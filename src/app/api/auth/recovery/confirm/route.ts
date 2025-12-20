import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { hashRecoveryToken } from "@/lib/auth-recovery";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .regex(/[a-zA-Z]/, "Incluye al menos una letra.")
  .regex(/\d/, "Incluye al menos un número.");

const confirmSchema = z.object({
  token: z.string().min(16, "Token inválido."),
  password: passwordSchema,
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const errorMessage = flat.formErrors.join(", ") || "Datos inválidos.";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const tokenHash = hashRecoveryToken(token.trim());

  const recovery = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
    },
    include: { user: true },
  });

  if (!recovery || recovery.expiresAt < new Date()) {
    return NextResponse.json({ ok: false, error: "El token es inválido o expiró." }, { status: 400 });
  }

  const hashed = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: recovery.userId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { id: recovery.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: { userId: recovery.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true, message: "Contraseña actualizada. Ya puedes iniciar sesión." });
}
