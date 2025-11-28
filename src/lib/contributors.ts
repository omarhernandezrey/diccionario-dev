import { Prisma, ContributionAction, ContributionEntity, Language } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export type ContributionEvent = {
  userId: number;
  username: string;
  termId?: number | null;
  entityId: number;
  entityType: ContributionEntity;
  action: ContributionAction;
  points?: number;
  metadata?: Record<string, unknown>;
  languages?: Language[];
};

export async function ensureContributorProfile(userId: number, username: string, preferred?: Language[]) {
  const defaults: Language[] = preferred?.length ? preferred : [Language.js, Language.ts, Language.css];
  return prisma.contributorProfile.upsert({
    where: { userId },
    update: {}, // No sobrescribir datos existentes automáticamente
    create: {
      userId,
      displayName: username,
      preferredLanguages: defaults,
      totalPoints: 0,
    },
  });
}

export async function recordContributionEvent(event: ContributionEvent) {
  try {
    const contributor = await ensureContributorProfile(event.userId, event.username, event.languages);
    const points = Math.max(1, event.points ?? 5);
    const entry = await prisma.contribution.create({
      data: {
        contributorId: contributor.id,
        userId: event.userId,
        termId: event.termId ?? null,
        entityId: event.entityId,
        entityType: event.entityType,
        action: event.action,
        points,
        metadata: (event.metadata as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
      },
    });
    await prisma.contributorProfile.update({
      where: { id: contributor.id },
      data: { totalPoints: { increment: points } },
    });
    return entry;
  } catch (error) {
    logger.warn({ err: error, event }, "contributors.record_failed");
    return null;
  }
}

export async function getLeaderboard(limit = 8) {
  const profiles = await prisma.contributorProfile.findMany({
    include: {
      user: { select: { username: true, email: true } },
      badges: { include: { badge: true } },
    },
    orderBy: { totalPoints: "desc" },
    take: limit,
  });
  return profiles.map((profile, index) => ({
    id: profile.id,
    displayName: profile.displayName,
    username: profile.user?.username ?? "",
    email: profile.user?.email ?? null,
    totalPoints: profile.totalPoints,
    position: index + 1,
    badges: profile.badges.map((entry) => ({ slug: entry.badge.slug, title: entry.badge.title, icon: entry.badge.icon })),
  }));
}
