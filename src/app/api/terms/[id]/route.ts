import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { termSchema } from "@/lib/validation";
import { requireAdminToken } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const item = await prisma.term.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdminToken(req.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  const body = await req.json();

  // Permitir updates parciales: combinamos defaults con lo que venga
  const partial = termSchema.partial().safeParse(body);
  if (!partial.success) {
    return NextResponse.json({ error: partial.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.term.update({
    where: { id },
    data: body,
  });
  return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!requireAdminToken(req.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  await prisma.term.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
