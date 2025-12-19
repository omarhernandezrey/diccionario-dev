import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req.headers);

    const users = await prisma.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        contributorProfile: {
          select: { displayName: true, avatarUrl: true },
        },
      },
      orderBy: { username: "asc" },
    });

    const items = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email ?? null,
      role: user.role,
      displayName: user.contributorProfile?.displayName || user.username,
      avatarUrl: user.contributorProfile?.avatarUrl ?? null,
    }));

    return NextResponse.json({ ok: true, items }, { headers: noStoreHeaders });
  } catch (error) {
    if (error instanceof Response) return error;
    logger.error({ err: error }, "admin.reviewers_failed");
    return NextResponse.json(
      { ok: false, error: "No se pudo cargar la lista de revisores" },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
