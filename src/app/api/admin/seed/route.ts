import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { ensureDictionarySeeded } from "@/lib/bootstrap-dataset";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" } as const;

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req.headers);
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  const before = await prisma.term.count();
  await ensureDictionarySeeded({ force: true });
  const after = await prisma.term.count();

  return NextResponse.json(
    {
      ok: true,
      before,
      after,
      added: Math.max(0, after - before),
    },
    { headers: noStore },
  );
}
