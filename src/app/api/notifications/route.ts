import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeaders, verifyJwt } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SEARCH_MODES = ["list", "app", "widget", "create"] as const;
const DAY_MS = 24 * 60 * 60 * 1000;
const NOTIFICATION_IDS = {
  pendingUserTerms: 100,
  pendingAllTerms: 110,
  userActivity: 120,
  emptyQuery: 130,
  recentApproved: 140,
  emptySpike: 200,
  approvalsDrop: 210,
  staleReview: 220,
} as const;

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export async function GET(req: NextRequest) {
  const token = getTokenFromHeaders(req.headers);
  const payload = token ? verifyJwt(token) : null;

  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = payload.id;
    const isAdmin = payload.role === "admin";
    const now = Date.now();
    const nowIso = new Date().toISOString();
    const [pendingUserTerms, totalUserTerms, pendingAllTerms, emptyQueries, recentPublished] = await Promise.all([
      prisma.term.count({ where: { status: { in: ["pending", "in_review"] }, createdById: userId } }),
      prisma.term.count({ where: { createdById: userId } }),
      prisma.term.count({ where: { status: { in: ["pending", "in_review"] } } }),
      prisma.searchLog.groupBy({
        by: ["query"],
        where: { termId: null, mode: { in: SEARCH_MODES } },
        _count: { query: true },
        orderBy: [{ _count: { query: "desc" } }],
        take: 1,
      }),
      prisma.term.findMany({
        where: { createdById: userId, status: "approved", reviewedAt: { not: null } },
        orderBy: { reviewedAt: "desc" },
        take: 3,
        select: { term: true },
      }),
    ]);

    const items = [
      {
        id: NOTIFICATION_IDS.pendingUserTerms,
        title: pendingUserTerms ? "Tus términos pendientes" : "Sin pendientes personales",
        detail: pendingUserTerms
          ? `Tienes ${pendingUserTerms} término(s) esperando revisión.`
          : "No tienes términos pendientes de aprobar.",
        type: pendingUserTerms ? ("alert" as const) : ("info" as const),
        timestamp: nowIso,
        read: false,
      },
      {
        id: NOTIFICATION_IDS.pendingAllTerms,
        title: "Estado general",
        detail: pendingAllTerms ? `${pendingAllTerms} términos pendientes en el catálogo.` : "Catálogo sin pendientes.",
        type: pendingAllTerms ? ("alert" as const) : ("info" as const),
        timestamp: nowIso,
        read: false,
      },
      {
        id: NOTIFICATION_IDS.userActivity,
        title: "Tu actividad",
        detail: totalUserTerms
          ? `Has creado ${totalUserTerms} término(s). Sigue aportando.`
          : "Aún no has creado términos. ¡Sube el primero!",
        type: "info" as const,
        timestamp: nowIso,
        read: false,
      },
    ];

    if (emptyQueries.length) {
      items.push({
        id: NOTIFICATION_IDS.emptyQuery,
        title: "Búsqueda sin respuesta",
        detail: `“${emptyQueries[0].query}” falló ${emptyQueries[0]._count?.query ?? 0} vez/veces.`,
        type: "alert" as const,
        timestamp: nowIso,
        read: false,
      });
    }

    if (recentPublished.length) {
      items.push({
        id: NOTIFICATION_IDS.recentApproved,
        title: "Aprobados recientemente",
        detail: recentPublished.map((t) => t.term).join(", "),
        type: "info" as const,
        timestamp: nowIso,
        read: false,
      });
    }

    if (isAdmin) {
      const emptySpikeHours = Math.max(1, toNumber(process.env.ALERT_EMPTY_SPIKE_HOURS, 24));
      const emptyBaseDays = Math.max(1, toNumber(process.env.ALERT_EMPTY_BASE_DAYS, 7));
      const emptySpikeMultiplier = Math.max(1, toNumber(process.env.ALERT_EMPTY_SPIKE_MULTIPLIER, 2));
      const emptySpikeMin = Math.max(1, toNumber(process.env.ALERT_EMPTY_SPIKE_MIN, 5));

      const approvalWindowDays = Math.max(1, toNumber(process.env.ALERT_APPROVAL_WINDOW_DAYS, 7));
      const approvalDropRatio = Math.min(Math.max(toNumber(process.env.ALERT_APPROVAL_DROP_RATIO, 0.5), 0.1), 1);
      const approvalMinPrev = Math.max(1, toNumber(process.env.ALERT_APPROVAL_MIN_PREV, 4));

      const staleReviewDays = Math.max(1, toNumber(process.env.ALERT_STALE_REVIEW_DAYS, 7));

      const emptyWindowStart = new Date(now - emptySpikeHours * 60 * 60 * 1000);
      const baselineStart = new Date(now - emptyBaseDays * DAY_MS);
      const baselineEnd = emptyWindowStart;
      const approvalCurrentStart = new Date(now - approvalWindowDays * DAY_MS);
      const approvalPrevStart = new Date(now - approvalWindowDays * 2 * DAY_MS);
      const approvalPrevEnd = approvalCurrentStart;
      const staleBefore = new Date(now - staleReviewDays * DAY_MS);

      const [emptyRecentCount, emptyBaselineCount, approvalsRecent, approvalsPrev, staleReviewCount] = await Promise.all([
        prisma.searchLog.count({
          where: { termId: null, mode: { in: SEARCH_MODES }, createdAt: { gte: emptyWindowStart } },
        }),
        prisma.searchLog.count({
          where: { termId: null, mode: { in: SEARCH_MODES }, createdAt: { gte: baselineStart, lt: baselineEnd } },
        }),
        prisma.term.count({
          where: { status: "approved", reviewedAt: { gte: approvalCurrentStart } },
        }),
        prisma.term.count({
          where: { status: "approved", reviewedAt: { gte: approvalPrevStart, lt: approvalPrevEnd } },
        }),
        prisma.term.count({
          where: { status: { in: ["pending", "in_review"] }, updatedAt: { lt: staleBefore } },
        }),
      ]);

      const baselineHours = Math.max(1, emptyBaseDays * 24 - emptySpikeHours);
      const expectedEmpty = (emptyBaselineCount / baselineHours) * emptySpikeHours;
      const emptyThreshold = Math.max(emptySpikeMin, Math.ceil(expectedEmpty * emptySpikeMultiplier));

      if (emptyRecentCount >= emptyThreshold) {
        items.push({
          id: NOTIFICATION_IDS.emptySpike,
          title: "Pico de búsquedas vacías",
          detail: `${emptyRecentCount} vacías en las últimas ${emptySpikeHours}h (umbral ${emptyThreshold}).`,
          type: "alert" as const,
          timestamp: nowIso,
          read: false,
        });
      }

      if (approvalsPrev >= approvalMinPrev && approvalsRecent <= Math.floor(approvalsPrev * approvalDropRatio)) {
        items.push({
          id: NOTIFICATION_IDS.approvalsDrop,
          title: "Caída de aprobaciones",
          detail: `${approvalsRecent} aprobaciones en ${approvalWindowDays} días vs ${approvalsPrev} en el periodo anterior.`,
          type: "alert" as const,
          timestamp: nowIso,
          read: false,
        });
      }

      if (staleReviewCount > 0) {
        items.push({
          id: NOTIFICATION_IDS.staleReview,
          title: "Términos sin revisar",
          detail: `${staleReviewCount} términos sin revisión en más de ${staleReviewDays} días.`,
          type: "alert" as const,
          timestamp: nowIso,
          read: false,
        });
      }
    }

    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error("notifications.fetch_failed", error);
    return NextResponse.json({ ok: false, items: FALLBACK }, { status: 200 });
  }
}

const FALLBACK = [
  {
    id: 1,
    title: "Sin datos",
    detail: "La API de notificaciones no devolvió resultados.",
    type: "info",
    timestamp: new Date().toISOString(),
    read: false,
  },
];
