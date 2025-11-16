import { NextRequest, NextResponse } from "next/server";
import { translateStructural } from "@/lib/structural-translate";
import { translationRequestSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const RATE_LIMIT_PREFIX = "translate:structural";
const noStoreHeaders = { "Cache-Control": "no-store" } as const;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = await rateLimit(`${RATE_LIMIT_PREFIX}:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Intenta nuevamente en unos segundos." },
      { status: 429, headers: { ...noStoreHeaders, "Retry-After": String(rate.retryAfterSeconds ?? 30) } },
    );
  }
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400, headers: noStoreHeaders });
  }
  const parsed = translationRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400, headers: noStoreHeaders });
  }
  try {
    const result = await translateStructural(parsed.data);
    await recordTranslationEvent({
      query: summarizeQuery(parsed.data.code),
      language: parsed.data.language ?? result.language,
      context: "translate",
      mode: "translate",
    });
    return NextResponse.json({ ok: true, result }, { headers: noStoreHeaders });
  } catch (error) {
    logger.error({ err: error, route: "/api/translate" }, "translate.error");
    return NextResponse.json(
      { ok: false, error: "No se pudo traducir el fragmento" },
      { status: 500, headers: noStoreHeaders },
    );
  }
}

function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "anonymous";
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  if (req.ip) return String(req.ip);
  return "anonymous";
}

async function recordTranslationEvent(event: { query: string; context: string; language: string; mode: string }) {
  try {
    await prisma.searchLog.create({
      data: {
        query: event.query,
        context: event.context,
        language: event.language,
        mode: event.mode,
      },
    });
  } catch (error) {
    logger.warn({ err: error, route: "/api/translate" }, "translate.log_failed");
  }
}

function summarizeQuery(value: string) {
  const trimmed = value.trim();
  if (trimmed.length <= 500) return trimmed;
  return `${trimmed.slice(0, 500)}…`;
}
