import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, type AuthTokenPayload } from "@/lib/auth";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const noStoreHeaders = { "Cache-Control": "no-store" } as const;
const ACTIONS = ["view", "copy", "favorite"] as const;

type UsageTerm = {
  id: number;
  term: string;
  translation: string;
  category: string;
  views: number;
  favorites: number;
  copies: number;
  total: number;
};

function adminOrResponse(headers: Headers): AuthTokenPayload | Response {
  try {
    return requireAdmin(headers);
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }
}

export async function GET(req: NextRequest) {
  const admin = adminOrResponse(req.headers);
  if (admin instanceof Response) return admin;

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 12), 1), 50);
  const daysWindow = Math.min(Math.max(Number(url.searchParams.get("days") ?? 30), 1), 365);
  const since = new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000);

  try {
    const [stats, heatmapRows] = await Promise.all([
      prisma.termStats.findMany({
        include: {
          term: {
            select: { id: true, term: true, translation: true, category: true },
          },
        },
      }),
      prisma.$queryRaw<
        Array<{ dow: number | null; hour: number | null; count: number | bigint }>
      >`
        SELECT
          EXTRACT(DOW FROM "createdAt") AS dow,
          EXTRACT(HOUR FROM "createdAt") AS hour,
          COUNT(*) AS count
        FROM "SearchLog"
        WHERE "context" = 'usage'
          AND "mode" IN (${ACTIONS[0]}, ${ACTIONS[1]}, ${ACTIONS[2]})
          AND "createdAt" >= ${since}
        GROUP BY dow, hour;
      `,
    ]);

    const terms = stats
      .map((entry): UsageTerm => {
        const views = entry.views ?? 0;
        const favorites = entry.favorites ?? 0;
        const copies = entry.copyActions ?? 0;
        return {
          id: entry.termId,
          term: entry.term?.term ?? "Desconocido",
          translation: entry.term?.translation ?? "",
          category: entry.term?.category ?? "general",
          views,
          favorites,
          copies,
          total: views + favorites + copies,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);

    const totals = terms.reduce(
      (acc, term) => {
        acc.views += term.views;
        acc.favorites += term.favorites;
        acc.copies += term.copies;
        return acc;
      },
      { views: 0, favorites: 0, copies: 0 },
    );

    const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const hours = Array.from({ length: 24 }, (_, idx) => idx);
    const matrix = days.map(() => hours.map(() => 0));
    let max = 0;

    heatmapRows.forEach((row) => {
      const dayIndex = typeof row.dow === "number" ? Math.floor(row.dow) : null;
      const hourIndex = typeof row.hour === "number" ? Math.floor(row.hour) : null;
      if (dayIndex === null || hourIndex === null) return;
      if (dayIndex < 0 || dayIndex >= days.length) return;
      if (hourIndex < 0 || hourIndex >= hours.length) return;
      const countValue = typeof row.count === "bigint" ? Number(row.count) : Number(row.count ?? 0);
      matrix[dayIndex][hourIndex] = countValue;
      if (countValue > max) max = countValue;
    });

    return NextResponse.json(
      {
        ok: true,
        terms,
        totals,
        heatmap: {
          days,
          hours,
          matrix,
          max,
          windowDays: daysWindow,
        },
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    logger.error({ err: error }, "admin.usage_failed");
    return NextResponse.json(
      { ok: false, error: "No se pudo cargar el uso real" },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
