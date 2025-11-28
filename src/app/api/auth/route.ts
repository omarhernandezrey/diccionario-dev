import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLogoutCookie, getTokenFromHeaders, verifyJwt } from "@/lib/auth";
import { ensureContributorProfile } from "@/lib/contributors";

const UNAUTHORIZED = { ok: false, error: "Unauthorized" };

/**
 * GET /api/auth
 * Valida un token existente, devuelve datos del usuario y expone si se permite el bootstrap inicial.
 */
export async function GET(req: NextRequest) {
  const token = getTokenFromHeaders(req.headers);
  const allowBootstrap = (await prisma.user.count({ where: { role: "admin" } })) === 0;

  if (!token) {
    return NextResponse.json({ ...UNAUTHORIZED, allowBootstrap }, { status: 401 });
  }

  const payload = verifyJwt(token);
  if (!payload) {
    const res = NextResponse.json({ ...UNAUTHORIZED, allowBootstrap }, { status: 401 });
    res.headers.append("Set-Cookie", buildLogoutCookie());
    return res;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      username: true,
      role: true,
      email: true,
    },
  });

  if (!user) {
    const res = NextResponse.json({ ...UNAUTHORIZED, allowBootstrap }, { status: 401 });
    res.headers.append("Set-Cookie", buildLogoutCookie());
    return res;
  }

  const profile = await ensureContributorProfile(user.id, user.username);
  const enrichedUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    email: user.email,
    displayName: profile.displayName || user.username,
    avatarUrl: profile.avatarUrl ?? null,
    bio: profile.bio ?? "",
  };

  return NextResponse.json({ ok: true, user: enrichedUser, allowBootstrap });
}

/**
 * DELETE /api/auth
 * Elimina la cookie de sesión de administrador sin importar si el token es válido.
 */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", buildLogoutCookie());
  return res;
}
