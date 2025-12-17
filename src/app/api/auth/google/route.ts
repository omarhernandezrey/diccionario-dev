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
  // Sanitizar username
  const usernameBase = email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "");
  const displayName = payload.name || usernameBase;

  // 1. Buscar usuario existente SOLO por email para garantizar identidad
  let user = await prisma.user.findUnique({
    where: { email },
  });

  // 2. Si no existe, registrar automáticamente
  if (!user) {
    // Generar username único en caso de colisión
    let finalUsername = usernameBase;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const existing = await prisma.user.findUnique({ where: { username: finalUsername } });
      if (!existing) {
        isUnique = true;
      } else {
        // Si existe, agregar sufijo aleatorio
        finalUsername = `${usernameBase}${Math.floor(Math.random() * 10000)}`;
        attempts++;
      }
    }

    const tempPassword = `google-${crypto.randomUUID()}`;
    const hashed = await hashPassword(tempPassword);

    try {
      user = await prisma.user.create({
        data: {
          username: finalUsername,
          email,
          password: hashed,
          role: "user",
        },
      });
    } catch (error) {
      console.error("Error creating Google user:", error);
      return NextResponse.json({ ok: false, error: "Error al crear usuario con Google" }, { status: 500 });
    }
  }

  if (!user) {
    return NextResponse.json({ ok: false, error: "No se pudo crear el usuario" }, { status: 500 });
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
