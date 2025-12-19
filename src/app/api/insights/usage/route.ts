import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;
const RATE_LIMIT_PREFIX = "insights:usage";
const ACTIONS = new Set(["view", "copy", "favorite"]);
const TRUTHY = new Set(["1", "true", "yes", "on"]);
const searchLogWritesDisabled = (() => {
  const raw = process.env.DISABLE_SEARCH_LOGS;
  return raw ? TRUTHY.has(raw.trim().toLowerCase()) : false;
})();

function getClientIp(req: NextRequest) {
  const xForwarded = req.headers.get("x-forwarded-for");
  if (xForwarded) return xForwarded.split(",")[0]?.trim() || "anonymous";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  if (req.ip) return String(req.ip);
  return "anonymous";
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status, headers: noStoreHeaders });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = await rateLimit(`${RATE_LIMIT_PREFIX}:${ip}`, { limit: 180, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit" },
      { status: 429, headers: { ...noStoreHeaders, "Retry-After": String(rate.retryAfterSeconds ?? 1) } },
    );
  }

  const payload = await req.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return jsonError("Payload invalido", 400);
  }

  const rawTermId = (payload as { termId?: unknown }).termId;
  const rawAction = (payload as { action?: unknown }).action;
  const rawLanguage = (payload as { language?: unknown }).language;
  const rawContext = (payload as { context?: unknown }).context;

  const termId = Number(rawTermId);
  if (!Number.isInteger(termId) || termId <= 0) {
    return jsonError("termId invalido", 400);
  }

  const action = typeof rawAction === "string" ? rawAction.trim().toLowerCase() : "";
  if (!ACTIONS.has(action)) {
    return jsonError("accion no valida", 400);
  }

  const language = typeof rawLanguage === "string" && rawLanguage.trim() ? rawLanguage.trim() : "es";
  const context = typeof rawContext === "string" && rawContext.trim() ? rawContext.trim() : "usage";

  const increments: Record<string, { increment: number }> = {};
  if (action === "view") increments.views = { increment: 1 };
  if (action === "copy") increments.copyActions = { increment: 1 };
  if (action === "favorite") increments.favorites = { increment: 1 };

  try {
    await prisma.termStats.upsert({
      where: { termId },
      create: {
        termId,
        views: action === "view" ? 1 : 0,
        favorites: action === "favorite" ? 1 : 0,
        copyActions: action === "copy" ? 1 : 0,
      },
      update: increments,
    });

    if (!searchLogWritesDisabled) {
      await prisma.searchLog.create({
        data: {
          termId,
          query: action,
          language,
          context,
          mode: action,
          resultCount: 1,
          hadResults: true,
        },
      });
    }

    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    logger.error({ err: error, termId, action }, "insights.usage_failed");
    return jsonError("No se pudo registrar el evento", 500);
  }
}
