import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { hashPassword, signJwt, buildAuthCookie } from "@/lib/auth";
import { ensureContributorProfile } from "@/lib/contributors";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

async function verifyIdToken(token: string): Promise<TokenPayload | null> {
  if (!client) return null;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload() ?? null;
  } catch (error) {
    console.error("Google token verification failed:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const credential = body?.credential;

  if (!credential) {
    return NextResponse.json({ ok: false, error: "Missing credential" }, { status: 400 });
  }

  if (!client) {
    return NextResponse.json({ ok: false, error: "Google client not configured" }, { status: 500 });
  }

  const payload = await verifyIdToken(credential);
  if (!payload || !payload.email) {
    return NextResponse.json({ ok: false, error: "Invalid Google token" }, { status: 401 });
  }

  const email = payload.email;
  const usernameBase = email.split("@")[0];
  const displayName = payload.name || usernameBase;

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username: usernameBase }],
    },
  });

  if (!user) {
    // Google users requieren password en el esquema; generar uno aleatorio
    const tempPassword = `google-${crypto.randomUUID()}`;
    const hashed = await hashPassword(tempPassword);
    user = await prisma.user.create({
      data: {
        username: usernameBase,
        email,
        password: hashed,
        role: "user",
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });
  }

  await ensureContributorProfile(user.id, displayName);

  const token = signJwt({ id: user.id, username: user.username, role: user.role });
  const res = NextResponse.json({
    ok: true,
    user,
  });
  res.headers.append("Set-Cookie", buildAuthCookie(token));
  return res;
}
