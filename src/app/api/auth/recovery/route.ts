import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createRecoveryToken,
  getClientInfo,
  getRecoveryBaseUrl,
  hashRecoveryToken,
  recoveryCooldownUntil,
  recoveryExpiresAt,
  RECOVERY_TOKEN_COOLDOWN_MINUTES,
  RECOVERY_TOKEN_TTL_MINUTES,
  shouldExposeRecoveryToken,
} from "@/lib/auth-recovery";
import { sendPasswordResetEmail } from "@/lib/email";

const requestSchema = z.object({
  identifier: z.string().min(3, "Ingresa tu usuario o correo."),
});

const GENERIC_MESSAGE = "Si existe una cuenta asociada, enviaremos instrucciones para recuperar la contraseña.";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const errorMessage = flat.formErrors.join(", ") || "Datos inválidos.";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }

  const identifier = parsed.data.identifier.trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: identifier, mode: "insensitive" } },
        { email: { equals: identifier, mode: "insensitive" } },
      ],
    },
    select: { id: true, email: true, username: true },
  });

  if (!user) {
    return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
  }

  const cooldownWindow = new Date(Date.now() - RECOVERY_TOKEN_COOLDOWN_MINUTES * 60 * 1000);
  const recentToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      createdAt: { gt: cooldownWindow },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentToken) {
    const retryAfter = Math.max(0, Math.ceil((recoveryCooldownUntil(recentToken.createdAt).getTime() - Date.now()) / 1000));
    return NextResponse.json({
      ok: true,
      message: GENERIC_MESSAGE,
      retryAfter,
    });
  }

  const token = createRecoveryToken();
  const tokenHash = hashRecoveryToken(token);
  const expiresAt = recoveryExpiresAt();
  const { ip, userAgent } = getClientInfo(req.headers);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
      ip,
      userAgent,
    },
  });

  const exposeToken = shouldExposeRecoveryToken();
  const baseUrl = getRecoveryBaseUrl(req.nextUrl.origin);
  const resetUrl = `${baseUrl}/admin/access?token=${token}`;

  // Enviar email si el usuario tiene correo configurado
  if (user.email) {
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      resetUrl,
      expiresInMinutes: RECOVERY_TOKEN_TTL_MINUTES,
    });
    
    if (!emailResult.success) {
      console.warn("[recovery] Failed to send email:", emailResult.error);
    }
  }

  return NextResponse.json({
    ok: true,
    message: GENERIC_MESSAGE,
    expiresIn: RECOVERY_TOKEN_TTL_MINUTES * 60,
    recoveryToken: exposeToken ? token : undefined,
    resetUrl: exposeToken ? resetUrl : undefined,
  });
}
