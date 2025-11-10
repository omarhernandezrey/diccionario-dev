import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { termSchema } from "@/lib/validation";
import { requireAdminToken } from "@/lib/auth";

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

  // Si no hay query, devolvemos lista simple (posible filtro por categoría)
  if (!q) {
    const items = await prisma.term.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ term: "asc" }],
      take: 50,
    });
    return NextResponse.json({ items });
  }

  // Búsqueda case-insensitive usando SQL raw para SQLite: usamos LOWER(...) LIKE '%q%'
  const like = `%${q.toLowerCase()}%`;
  let sql = `SELECT * FROM "Term" WHERE `;
  const params: any[] = [];
  if (category) {
    sql += `"category" = ? AND `;
    params.push(category);
  }
  // Buscamos en term, meaning, what, how y en aliases convertido a texto
  sql += `(
    lower("term") LIKE ? OR
    lower("meaning") LIKE ? OR
    lower("what") LIKE ? OR
    lower("how") LIKE ? OR
    lower(CAST(aliases AS TEXT)) LIKE ?
  ) ORDER BY "term" ASC LIMIT 50;`;
  params.push(like, like, like, like, like);

  // Ejecutamos la consulta raw de forma parametrizada
  // Nota: usamos $queryRawUnsafe con parámetros para compatibilidad; los valores vienen de usuario
  // pero se pasan como parámetros (no concatenados) para evitar inyección.
  // Prisma $queryRawUnsafe acepta placeholders '?' en SQLite.
  // @ts-ignore
  const items = await prisma.$queryRawUnsafe(sql, ...params);

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!requireAdminToken(req.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = termSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const t = parsed.data;
  const created = await prisma.term.create({
    data: {
      term: t.term,
      aliases: t.aliases ?? [],
      category: t.category,
      meaning: t.meaning,
      what: t.what,
      how: t.how,
      examples: t.examples as any,
    },
  });
  return NextResponse.json({ item: created }, { status: 201 });
}
