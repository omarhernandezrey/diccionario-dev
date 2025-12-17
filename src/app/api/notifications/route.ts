import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeaders, verifyJwt } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = getTokenFromHeaders(req.headers);
  const payload = token ? verifyJwt(token) : null;

  if (!payload) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = payload.id;
    const [pendingUserTerms, totalUserTerms, pendingAllTerms, emptyQueries, recentPublished] = await Promise.all([
      prisma.term.count({ where: { status: { in: ["pending", "in_review"] }, createdById: userId } }),
      prisma.term.count({ where: { createdById: userId } }),
      prisma.term.count({ where: { status: { in: ["pending", "in_review"] } } }),
      prisma.searchLog.groupBy({
        by: ["query"],
        where: { termId: null },
        _count: { query: true },
        orderBy: [{ _count: { query: "desc" } }],
        take: 1,
      }),
      prisma.term.findMany({
        where: { createdById: userId, status: "approved" },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { term: true, updatedAt: true },
      }),
    ]);

    const now = Date.now();
    const items = [
      {
        id: now,
        title: pendingUserTerms ? "Tus términos pendientes" : "Sin pendientes personales",
        detail: pendingUserTerms
          ? `Tienes ${pendingUserTerms} término(s) esperando revisión.`
          : "No tienes términos pendientes de aprobar.",
        type: pendingUserTerms ? ("alert" as const) : ("info" as const),
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: now + 1,
        title: "Estado general",
        detail: pendingAllTerms ? `${pendingAllTerms} términos pendientes en el catálogo.` : "Catálogo sin pendientes.",
        type: pendingAllTerms ? ("alert" as const) : ("info" as const),
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: now + 2,
        title: "Tu actividad",
        detail: totalUserTerms
          ? `Has creado ${totalUserTerms} término(s). Sigue aportando.`
          : "Aún no has creado términos. ¡Sube el primero!",
        type: "info" as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];

    if (emptyQueries.length) {
      items.push({
        id: now + 3,
        title: "Búsqueda sin respuesta",
        detail: `“${emptyQueries[0].query}” falló ${emptyQueries[0]._count?.query ?? 0} vez/veces.`,
        type: "alert" as const,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    if (recentPublished.length) {
      items.push({
        id: now + 4,
        title: "Aprobados recientemente",
        detail: recentPublished.map((t) => t.term).join(", "),
        type: "info" as const,
        timestamp: new Date().toISOString(),
        read: false,
      });
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
