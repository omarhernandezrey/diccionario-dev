import { NextRequest, NextResponse } from "next/server";
import { createSessionValue, cookieName } from "@/lib/auth";
import { requireAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = (body && body.password) || "";
  const expected = process.env.ADMIN_TOKEN || "";
  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const value = createSessionValue();
  const res = NextResponse.json({ ok: true });
  // Set HttpOnly cookie
  res.cookies.set({
    name: cookieName(),
    value,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: cookieName(), value: "", path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: NextRequest) {
  // Check if the session cookie is valid
  const ok = requireAdminToken(req.headers as any);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true });
}
