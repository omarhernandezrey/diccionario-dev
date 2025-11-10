import { NextRequest, NextResponse } from "next/server";
import { signJwt, cookieName, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const username = (body && body.username) || "admin";
  const password = (body && body.password) || "";

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = signJwt({ sub: user.id, username: user.username, role: user.role });
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: cookieName(), value: token, httpOnly: true, path: "/", maxAge: 60 * 60 * 24, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: cookieName(), value: "", path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: NextRequest) {
  const ok = requireAdmin(req.headers as any);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
