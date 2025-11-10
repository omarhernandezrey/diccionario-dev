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

  const where = {
    AND: [
      q
          ? {
            OR: [
              { term: { contains: q } },
              // Nota: omitimos búsqueda directa en `aliases` (JSON) por compatibilidad SQLite/Prisma.
              { meaning: { contains: q } },
              { what: { contains: q } },
              { how: { contains: q } },
            ],
          }
        : {},
      category ? { category } : {},
    ],
  };

  const items = await prisma.term.findMany({
    where,
    orderBy: [{ term: "asc" }],
    take: 50,
  });

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
