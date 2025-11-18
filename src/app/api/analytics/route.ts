import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/analytics";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
const RATE_LIMIT_PREFIX = "analytics:summary";

function getClientIp(req: NextRequest) {
  const header = req.headers.get("x-forwarded-for");
  if (header) return header.split(",")[0]?.trim() || "anonymous";
  return req.ip ?? "anonymous";
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = await rateLimit(`${RATE_LIMIT_PREFIX}:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds ?? 1) } },
    );
  }
  try {
    const summary = await getAnalyticsSummary(8);
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    logger.error({ err: error }, "analytics.summary_failed");
    return NextResponse.json({ ok: false, error: "No se pudo generar la analítica" }, { status: 500 });
  }
}
