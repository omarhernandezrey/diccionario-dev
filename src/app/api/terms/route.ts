import { HistoryAction, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { termSchema } from "@/lib/validation";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;

function adminOrResponse(headers: Headers): AuthTokenPayload | Response {
  try {
    return requireAdmin(headers);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    throw error;
  }
}

async function recordHistory(termId: number, snapshot: unknown, action: HistoryAction, authorId?: number) {
  try {
    await prisma.termHistory.create({
      data: {
        termId,
        snapshot: sanitizeSnapshot(snapshot),
        action,
        authorId,
      },
    });
  } catch (error) {
    console.error("[History] No se pudo registrar el historial del término", { termId, action, error });
  }
}

function sanitizeSnapshot<T>(payload: T) {
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    return payload;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // No forzar a minúsculas para mantener coincidencias en SQLite, donde `mode: "insensitive"` no aplica.
  const q = (searchParams.get("q") || "").trim();
  const category = searchParams.get("category") as
    | "frontend"
    | "backend"
    | "database"
    | "devops"
    | "general"
    | null;

  // Si no hay query, devolvemos todos los términos (sin límite) para el panel admin
  if (!q) {
    const items = await prisma.term.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ term: "asc" }],
    });
    return NextResponse.json({ items }, { headers: noStoreHeaders });
  }

  // Búsqueda case-insensitive usando SQL raw para SQLite: usamos LOWER(...) LIKE '%q%'
  const like = `%${q.toLowerCase()}%`;
  let sql = `SELECT * FROM "Term" WHERE `;
  const params: any[] = [];
  if (category) {
    sql += `"category" = ? AND `;
    params.push(category);
  }
  // Buscamos en term, meaning, what, how y en aliases/tags convertidos a texto
  sql += `(
    lower("term") LIKE ? OR
    lower("translation") LIKE ? OR
    lower("meaning") LIKE ? OR
    lower("what") LIKE ? OR
    lower("how") LIKE ? OR
    lower(CAST(aliases AS TEXT)) LIKE ? OR
    lower(CAST(tags AS TEXT)) LIKE ?
  ) ORDER BY "term" ASC;`;
  params.push(like, like, like, like, like, like, like);

  // Ejecutamos la consulta raw de forma parametrizada
  // Nota: usamos $queryRawUnsafe con parámetros para compatibilidad; los valores vienen de usuario
  // pero se pasan como parámetros (no concatenados) para evitar inyección.
  // Prisma $queryRawUnsafe acepta placeholders '?' en SQLite.
  // @ts-ignore
  const items = await prisma.$queryRawUnsafe(sql, ...params);

  return NextResponse.json({ items }, { headers: noStoreHeaders });
}

export async function POST(req: NextRequest) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;
  const body = await req.json();
  const parsed = termSchema.safeParse(body);
  if (!parsed.success) {
    console.warn("[POST /api/terms] Validación fallida", parsed.error.flatten());
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const t = parsed.data;
  try {
    const created = await prisma.term.create({
      data: {
        term: t.term,
        translation: t.translation,
        aliases: t.aliases ?? [],
        tags: t.tags ?? [],
        category: t.category,
        meaning: t.meaning,
        what: t.what,
        how: t.how,
        examples: t.examples as any,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
    await recordHistory(created.id, created, HistoryAction.create, admin.id);
    return NextResponse.json({ item: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un término con ese nombre" },
        { status: 409 },
      );
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }
    console.error("Error creando término", error);
    const message = error instanceof Error ? error.message : "No se pudo guardar el término";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
