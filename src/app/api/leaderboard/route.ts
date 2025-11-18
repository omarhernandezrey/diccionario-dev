import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = await prisma.contributorProfile.findMany({
      include: {
        user: { select: { username: true, email: true } },
        badges: { include: { badge: true } },
      },
      orderBy: { totalPoints: "desc" },
      take: 8,
    });
    const items = profiles.map((profile, index) => ({
      id: profile.id,
      displayName: profile.displayName,
      username: profile.user?.username ?? "",
      email: profile.user?.email ?? null,
      points: profile.totalPoints,
      position: index + 1,
      badges: profile.badges.map((entry) => ({
        slug: entry.badge.slug,
        title: entry.badge.title,
        icon: entry.badge.icon,
      })),
    }));
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    logger.error({ err: error }, "leaderboard.fetch_failed");
    return NextResponse.json({ ok: false, error: "No se pudo cargar el ranking" }, { status: 500 });
  }
}
