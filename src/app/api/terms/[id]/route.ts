import { HistoryAction, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { termSchema } from "@/lib/validation";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;

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

async function recordHistory(termId: number, snapshot: unknown, action: HistoryAction, authorId?: number) {
  try {
    await prisma.termHistory.create({
      data: {
        termId,
        snapshot: sanitizeSnapshot(snapshot),
        action,
        authorId,
      },
    });
  } catch (error) {
    console.error("[History] No se pudo registrar el historial del término", { termId, action, error });
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

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (!id) {
    return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
  }
  const item = await prisma.term.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item }, { headers: noStoreHeaders });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;
  const id = parseId(params.id);
  if (!id) {
    return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
  }
  const body = await req.json();

  // Permitir updates parciales: combinamos defaults con lo que venga
  const partial = termSchema.partial().safeParse(body);
  if (!partial.success) {
    console.warn("[PATCH /api/terms/:id] Validación fallida", partial.error.flatten());
    return NextResponse.json({ error: partial.error.flatten() }, { status: 400 });
  }
  const updateData = partial.data;

  try {
    const updated = await prisma.term.update({
      where: { id },
      data: {
        ...updateData,
        updatedById: admin.id,
      },
    });
    await recordHistory(updated.id, updated, HistoryAction.update, admin.id);
    return NextResponse.json({ item: updated }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un término con ese nombre" },
        { status: 409 },
      );
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error actualizando término", error);
    const message = error instanceof Error ? error.message : "No se pudo actualizar el término";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;
  const id = parseId(params.id);
  if (!id) {
    return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
  }
  try {
    const existing = await prisma.term.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "No se encontró el término para eliminar" }, { status: 404 });
    }
    await recordHistory(existing.id, existing, HistoryAction.delete, admin.id);
    await prisma.term.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "No se encontró el término para eliminar" }, { status: 404 });
    }
    console.error("Error eliminando término", error);
    return NextResponse.json({ error: "No se pudo eliminar el término" }, { status: 500 });
  }
}
