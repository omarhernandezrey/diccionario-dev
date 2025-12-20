import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildAuthCookie, hashPassword, requireAdmin, signJwt } from "@/lib/auth";
import { ensureContributorProfile } from "@/lib/contributors";

const optionalEmail = z.preprocess(
  (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
  z.string().email("Correo inválido.").optional(),
);

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[a-zA-Z]/, "Incluye al menos una letra")
  .regex(/\d/, "Incluye al menos un número");

const registerSchema = z.object({
  username: z.string().trim().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: passwordSchema,
  email: optionalEmail,
  role: z.enum(["admin", "user"]).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const errorMessage = flat.formErrors.join(", ") || "Datos inválidos";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
  }

  const adminCount = await prisma.user.count({ where: { role: "admin" } });
  const bootstrap = adminCount === 0;

  const { username, password, email, role: desiredRole } = parsed.data;

  // Seguridad: Solo permitir crear admins si es bootstrap o si quien pide es admin
  if (desiredRole === "admin" && !bootstrap) {
    try {
      requireAdmin(req.headers);
    } catch {
      return NextResponse.json({ ok: false, error: "No autorizado para crear administradores" }, { status: 403 });
    }
  }

  // Permitir registro público de usuarios normales (sin restricciones de admin)
  
  const uniqueFilters: Array<{ username: { equals: string; mode: "insensitive" } } | { email: { equals: string; mode: "insensitive" } }> = [
    { username: { equals: username, mode: "insensitive" } },
  ];
  if (email) {
    uniqueFilters.push({ email: { equals: email, mode: "insensitive" } });
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: uniqueFilters,
    },
  });

  if (existing) {
    return NextResponse.json(
      { ok: false, error: "El usuario o correo ya existe" },
      { status: 409 },
    );
  }

  const hashed = await hashPassword(password);
  const role = bootstrap ? "admin" : desiredRole || "user";
  const created = await prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
      role,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  });

  await ensureContributorProfile(created.id, created.username);

  // Generar token y cookie para auto-login inmediato tras registro
  const token = signJwt({ id: created.id, username: created.username, role: created.role });
  const res = NextResponse.json({ ok: true, user: created }, { status: 201 });
  res.headers.append("Set-Cookie", buildAuthCookie(token));
  
  return res;
}
