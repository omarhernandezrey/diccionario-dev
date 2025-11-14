import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildAuthCookie, hashPassword, requireAdmin, signJwt } from "@/lib/auth";

const registerSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user"]).optional(),
});

function guardAdmin(headers: Headers) {
  try {
    // If requireAdmin doesn't throw, user is admin — return null (no error)
    requireAdmin(headers);
    return null;
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    throw error;
  }
}

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

  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || process.env.JWT_SECRET || "";

  if (!bootstrap) {
    // If we're running in development and no ADMIN_TOKEN is configured, allow registration
    // for convenience (this avoids locking dev environments). In production you must set
    // ADMIN_TOKEN or authenticate as an admin to create users.
    if (!ADMIN_TOKEN && process.env.NODE_ENV !== "production") {
      /* allow */
    } else {
      const authError = guardAdmin(req.headers);
      if (authError) {
        // Allow registration when a valid ADMIN_TOKEN header is provided (x-admin-token or Bearer)
        const maybeToken =
          req.headers.get("x-admin-token") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
        if (!ADMIN_TOKEN || maybeToken !== ADMIN_TOKEN) return authError;
        // otherwise allow (token matched)
      }
    }
  }

  const { username, password, email, role: desiredRole } = parsed.data;
  const uniqueFilters: Array<{ username: string } | { email: string }> = [{ username }];
  if (email) {
    uniqueFilters.push({ email });
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: uniqueFilters,
    },
  });

  if (existing) {
    const conflictField = existing.username === username ? "username" : "email";
    return NextResponse.json(
      { ok: false, error: `${conflictField} already exists` },
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

  const res = NextResponse.json({ ok: true, user: created }, { status: 201 });
  if (bootstrap) {
    const token = signJwt({ id: created.id, username: created.username, role: created.role });
    res.headers.append("Set-Cookie", buildAuthCookie(token));
  }
  return res;
}
