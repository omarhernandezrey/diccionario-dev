import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLogoutCookie, getTokenFromHeaders, verifyJwt } from "@/lib/auth";

const UNAUTHORIZED = { ok: false, error: "Unauthorized" };

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
    select: { id: true, username: true, role: true, email: true },
  });

  if (!user) {
    const res = NextResponse.json({ ...UNAUTHORIZED, allowBootstrap }, { status: 401 });
    res.headers.append("Set-Cookie", buildLogoutCookie());
    return res;
  }

  return NextResponse.json({ ok: true, user, allowBootstrap });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", buildLogoutCookie());
  return res;
}
