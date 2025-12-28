import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

const noStore = { "Cache-Control": "no-store" } as const;

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req.headers);
    const templates = await prisma.quizTemplate.count();
    const attempts = await prisma.quizAttempt.count();
    return NextResponse.json(
      {
        ok: true,
        status: {
          templates,
          attempts,
        },
      },
      { headers: noStore },
    );
  } catch (error) {
    if (error instanceof Response) return error;
    logger.error({ err: error }, "quizzes.seed_status_failed");
    return NextResponse.json(
      { ok: false, error: (error as Error)?.message ?? "Seed status failed" },
      { status: 500, headers: noStore },
    );
  }
}
