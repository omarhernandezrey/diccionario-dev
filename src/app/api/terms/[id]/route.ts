import { HistoryAction, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { termSchema } from "@/lib/validation";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;
const RATE_LIMIT_PREFIX = "terms:item";

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

function jsonError(message: unknown, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status, headers: noStoreHeaders });
}

type PrismaWithHistory = typeof prisma & {
  termHistory?: {
    create?: (args: Prisma.TermHistoryCreateArgs) => Promise<unknown>;
  };
};

async function recordHistory(termId: number, snapshot: unknown, action: HistoryAction, authorId?: number) {
  try {
    // prisma.termHistory puede no existir según el schema generado; chequeamos en runtime.
    const client = prisma as PrismaWithHistory;
    if (client && typeof client.termHistory?.create === "function") {
      await client.termHistory.create({
        data: {
          termId,
          snapshot: sanitizeSnapshot(snapshot),
          action,
          authorId,
        },
      });
    } else {
      // If the termHistory model is not available at runtime, skip recording history.
      // This avoids throwing at runtime and preserves existing behavior.
      console.warn("[History] termHistory model not available on Prisma client, skipping history record", {
        termId,
        action,
      });
    }
  } catch (error) {
    console.error("[History] Error registrando historial", { termId, action, error });
  }
}

function parseId(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function sanitizeSnapshot<T>(payload: T) {
  try {
    return JSON.parse(JSON.stringify(payload));
  } catch {
    return payload;
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (!id) {
    return jsonError("Identificador inválido", 400);
  }
  const rate = rateLimit(`${RATE_LIMIT_PREFIX}:${getClientIp(req)}:${id}`, { limit: 240, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas solicitudes. Intenta nuevamente en unos segundos." },
      { status: 429, headers: { ...noStoreHeaders, "Retry-After": String(rate.retryAfterSeconds) } },
    );
  }
  const item = await prisma.term.findUnique({ where: { id } });
  if (!item) return jsonError("No se encontró el término", 404);
  return NextResponse.json({ ok: true, item }, { headers: noStoreHeaders });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;
  const id = parseId(params.id);
  if (!id) {
    return jsonError("Identificador inválido", 400);
  }
  const body = await req.json();

  const partial = termSchema.partial().safeParse(body);
  if (!partial.success) {
    console.warn("[PATCH /api/terms/:id] Validación fallida", partial.error.flatten());
    return jsonError(partial.error.flatten(), 400);
  }
  const updateData = partial.data;

  try {
    const updated = await prisma.term.update({
      where: { id },
      data: {
        ...updateData,
        updatedBy: { connect: { id: admin.id } },
      },
    });
      await recordHistory(updated.id, updated, HistoryAction.update, admin.id);
    return NextResponse.json({ ok: true, item: updated }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Ya existe un término con ese nombre", 409);
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return jsonError(error.message, 400);
    }
    console.error("Error actualizando término", error);
    const message = error instanceof Error ? error.message : "No se pudo actualizar el término";
    return jsonError(message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;
  const id = parseId(params.id);
  if (!id) {
    return jsonError("Identificador inválido", 400);
  }
  try {
    const existing = await prisma.term.findUnique({ where: { id } });
    if (!existing) {
      return jsonError("No se encontró el término para eliminar", 404);
    }
      await recordHistory(existing.id, existing, HistoryAction.delete, admin.id);
    await prisma.term.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError("No se encontró el término para eliminar", 404);
    }
    console.error("Error eliminando término", error);
    return jsonError("No se pudo eliminar el término", 500);
  }
}
