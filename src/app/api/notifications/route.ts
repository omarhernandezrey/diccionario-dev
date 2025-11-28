import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [pendingTerms, totalTerms, emptyQueries] = await Promise.all([
      prisma.term.count({ where: { status: { in: ["pending", "in_review"] } } }),
      prisma.term.count(),
      prisma.searchLog.groupBy({
        by: ["query"],
        where: { termId: null },
        _count: { query: true },
        orderBy: [{ _count: { query: "desc" } }],
        take: 1,
      }),
    ]);

    const items = [
      {
        id: Date.now(),
        title: pendingTerms ? "Pendientes de revisión" : "Catálogo verde",
        detail: pendingTerms
          ? `Hay ${pendingTerms} términos para aprobar.`
          : "Todos los términos están publicados, sigue añadiendo conocimiento.",
        type: pendingTerms ? "alert" : "info",
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: Date.now() + 1,
        title: "Cobertura del glosario",
        detail: `${totalTerms} términos disponibles en la base.`,
        type: "info" as const,
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];

    if (emptyQueries.length) {
      items.push({
        id: Date.now() + 2,
        title: "Búsquedas sin respuesta",
        detail: `“${emptyQueries[0].query}” falló ${emptyQueries[0]._count?.query ?? 0} veces.`,
        type: "alert" as const,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("notifications.fetch_failed", error);
    return NextResponse.json({ items: FALLBACK }, { status: 200 });
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
