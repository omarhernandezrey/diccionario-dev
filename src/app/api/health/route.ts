import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
