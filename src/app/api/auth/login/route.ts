import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildAuthCookie, comparePassword, signJwt } from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const errorMessage = flat.formErrors.join(", ") || "Datos inválidos";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const identifier = username.trim();
  
  // Permitir login por username O email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: { equals: identifier, mode: "insensitive" } },
        { email: { equals: identifier, mode: "insensitive" } } // El campo "username" del form puede contener un email
      ]
    }
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "Credenciales inválidas" }, { status: 401 });
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = signJwt({ id: user.id, username: user.username, role: user.role });
  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, username: user.username, role: user.role, email: user.email },
  });
  res.headers.append("Set-Cookie", buildAuthCookie(token));
  return res;
}
