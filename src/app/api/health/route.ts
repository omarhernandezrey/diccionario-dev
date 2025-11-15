import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 * Comprueba salud básica de la API y de la base de datos (consulta trivial a Prisma).
 */
export async function GET() {
  let dbStatus: "up" | "down" = "down";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "up";
  } catch (error) {
    console.error("[/api/health] Prisma check failed", error);
    return NextResponse.json({ ok: false, db: dbStatus }, { status: 503 });
  }

  return NextResponse.json({ ok: true, db: dbStatus }, { status: 200 });
}
