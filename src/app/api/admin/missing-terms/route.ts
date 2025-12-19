import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" } as const;
const RATE_LIMIT_PREFIX = "admin:missing-terms";

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

function getClientIp(req: NextRequest) {
  const xForwarded = req.headers.get("x-forwarded-for");
  if (xForwarded) return xForwarded.split(",")[0]?.trim() || "anonymous";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  if (req.ip) return String(req.ip);
  return "anonymous";
}

export async function GET(req: NextRequest) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;

  const ip = getClientIp(req);
  const rate = await rateLimit(`${RATE_LIMIT_PREFIX}:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit" },
      { status: 429, headers: { ...noStore, "Retry-After": String(rate.retryAfterSeconds ?? 1) } },
    );
  }

  const limitParam = req.nextUrl.searchParams.get("limit") ?? "8";
  const limit = Number.parseInt(limitParam, 10);
  const take = Number.isFinite(limit) ? Math.max(1, Math.min(20, limit)) : 8;

  try {
    const grouped = await prisma.searchLog.groupBy({
      by: ["query"],
      where: { termId: null },
      _count: { _all: true },
      _max: { createdAt: true },
      orderBy: [{ _count: { _all: "desc" } }],
      take,
    });

    const items = grouped
      .map((entry) => ({
        query: entry.query,
        attempts: entry._count?._all ?? 0,
        lastSeen: entry._max?.createdAt?.toISOString?.() ?? null,
      }))
      .filter((entry) => entry.query.trim().length > 0);

    return NextResponse.json({ ok: true, items }, { headers: noStore });
  } catch (error) {
    logger.error({ err: error }, "missing_terms.fetch_failed");
    return NextResponse.json({ ok: false, error: "No se pudo generar el radar" }, { status: 500, headers: noStore });
  }
}
