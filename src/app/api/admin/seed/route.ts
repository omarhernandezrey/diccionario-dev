import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const noStore = { "Cache-Control": "no-store" } as const;

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req.headers);

    const { ensureDictionarySeeded, getExpectedSeedCount } = await import("@/lib/bootstrap-dataset");
    const before = await prisma.term.count();
    const batch = await ensureDictionarySeeded({ force: true });
    const after = await prisma.term.count();
    const expected = getExpectedSeedCount();
    const missing = Math.max(0, expected - after);

    return NextResponse.json(
      {
        ok: true,
        before,
        after,
        added: Math.max(0, after - before),
        expected,
        missing,
        batch,
      },
      { headers: noStore },
    );
  } catch (error) {
    if (error instanceof Response) return error;
    logger.error({ err: error }, "dictionary.seed_failed");
    return NextResponse.json(
      {
        ok: false,
        error: (error as Error)?.message ?? "Seed failed",
        code: (error as { code?: string })?.code,
      },
      { status: 500, headers: noStore },
    );
  }
}
