import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { ensureContributorProfile } from "@/lib/contributors";

const MAX_BIO_LENGTH = 500;
const MAX_NAME_LENGTH = 80;
// Permitimos data URLs pequeñas o links externos razonables (~1MB)
const MAX_AVATAR_LENGTH = 1_000_000;

function serializeProfile(profile: { displayName: string; bio: string | null; avatarUrl: string | null }, username: string) {
  return {
    displayName: profile.displayName || username,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl,
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = requireAuth(req.headers);
    const existing = await prisma.contributorProfile.findUnique({
      where: { userId: auth.id },
      select: { id: true, displayName: true, bio: true, avatarUrl: true },
    });

    if (existing) {
      return NextResponse.json({ ok: true, profile: serializeProfile(existing, auth.username) });
    }

    const created = await ensureContributorProfile(auth.id, auth.username);
    return NextResponse.json({
      ok: true,
      profile: serializeProfile(
        { displayName: created.displayName, bio: created.bio ?? "", avatarUrl: created.avatarUrl ?? null },
        auth.username,
      ),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ ok: false, error: "No se pudo cargar el perfil" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = requireAuth(req.headers);
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Payload inválido" }, { status: 400 });
    }

    const displayName = String(body.displayName ?? "").trim();
    const bio = String(body.bio ?? "").trim();
    const avatarUrl = body.avatarUrl ? String(body.avatarUrl).trim() : null;

    if (!displayName) {
      return NextResponse.json({ ok: false, error: "El nombre es obligatorio" }, { status: 400 });
    }
    if (displayName.length > MAX_NAME_LENGTH) {
      return NextResponse.json({ ok: false, error: "El nombre es demasiado largo" }, { status: 400 });
    }
    if (bio.length > MAX_BIO_LENGTH) {
      return NextResponse.json({ ok: false, error: "La biografía supera el límite" }, { status: 400 });
    }
    if (avatarUrl && avatarUrl.length > MAX_AVATAR_LENGTH) {
      return NextResponse.json({ ok: false, error: "La imagen es demasiado pesada" }, { status: 400 });
    }

    const profile = await ensureContributorProfile(auth.id, auth.username);
    const updated = await prisma.contributorProfile.update({
      where: { id: profile.id },
      data: {
        displayName,
        bio,
        avatarUrl,
      },
      select: { displayName: true, bio: true, avatarUrl: true },
    });

    return NextResponse.json({ ok: true, profile: serializeProfile(updated, auth.username) });
  } catch (error) {
    if (error instanceof Response) return error;
    return NextResponse.json({ ok: false, error: "No se pudo guardar el perfil" }, { status: 500 });
  }
}
