import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const noStore = { "Cache-Control": "no-store" } as const;

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req.headers);
    const { getExpectedSeedCount } = await import("@/lib/bootstrap-dataset");

    const current = await prisma.term.count();
    const expected = getExpectedSeedCount();
    const missing = Math.max(0, expected - current);

    return NextResponse.json(
      {
        ok: true,
        status: {
          expected,
          current,
          missing,
        },
      },
      { headers: noStore },
    );
  } catch (error) {
    if (error instanceof Response) return error;
    logger.error({ err: error }, "dictionary.seed_status_failed");
    return NextResponse.json(
      {
        ok: false,
        error: (error as Error)?.message ?? "Seed status failed",
        code: (error as { code?: string })?.code,
      },
      { status: 500, headers: noStore },
    );
  }
}
