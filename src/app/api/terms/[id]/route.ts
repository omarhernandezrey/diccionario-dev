import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { termSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth";

function guardAdmin(headers: Headers) {
  try {
    requireAdmin(headers);
    return null;
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    throw error;
  }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const item = await prisma.term.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = guardAdmin(req.headers);
  if (authError) return authError;
  const id = Number(params.id);
  const body = await req.json();

  // Permitir updates parciales: combinamos defaults con lo que venga
  const partial = termSchema.partial().safeParse(body);
  if (!partial.success) {
    console.warn("[PATCH /api/terms/:id] Validación fallida", partial.error.flatten());
    return NextResponse.json({ error: partial.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await prisma.term.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ item: updated });
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
  const authError = guardAdmin(req.headers);
  if (authError) return authError;
  const id = Number(params.id);
  await prisma.term.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
