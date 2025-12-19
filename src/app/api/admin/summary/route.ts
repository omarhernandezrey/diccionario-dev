import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeaders, verifyJwt } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { ReviewStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" } as const;
const STATUS_LIST: ReviewStatus[] = ["pending", "in_review", "approved", "rejected"];

type StatusCounts = Record<ReviewStatus, number>;

function normalizeStatusCounts(raw: Array<{ status: ReviewStatus; _count: { _all: number } }>): StatusCounts {
  const base = STATUS_LIST.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as StatusCounts);
  raw.forEach((entry) => {
    base[entry.status] = entry._count?._all ?? 0;
  });
  return base;
}

function countExamples(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

export async function GET(req: NextRequest) {
  const token = getTokenFromHeaders(req.headers);
  const payload = token ? verifyJwt(token) : null;
  const includeAll = payload?.role === "admin";
  const termWhere = includeAll ? {} : { status: "approved" as const };

  try {
    const [
      totalTerms,
      statusGroups,
      categoryGroups,
      exerciseCount,
      exampleRecords,
      recentTerms,
    ] = await Promise.all([
      prisma.term.count({ where: termWhere }),
      includeAll
        ? prisma.term.groupBy({
            by: ["status"],
            _count: { _all: true },
          })
        : Promise.resolve([]),
      prisma.term.groupBy({
        by: ["category"],
        where: termWhere,
        _count: { _all: true },
      }),
      prisma.exercise.count({
        where: includeAll ? {} : { term: { status: "approved" } },
      }),
      prisma.term.findMany({
        where: termWhere,
        select: { examples: true },
      }),
      prisma.term.findMany({
        where: termWhere,
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { id: true, term: true, translation: true, status: true },
      }),
    ]);

    const exampleCount = exampleRecords.reduce((sum, record) => sum + countExamples(record.examples), 0);
    const statusCounts = includeAll
      ? normalizeStatusCounts(statusGroups as Array<{ status: ReviewStatus; _count: { _all: number } }>)
      : {
          pending: 0,
          in_review: 0,
          approved: totalTerms,
          rejected: 0,
        };
    const categoryCounts = categoryGroups.map((entry) => ({
      category: entry.category,
      value: entry._count?._all ?? 0,
    }));

    return NextResponse.json(
      {
        ok: true,
        summary: {
          totalTerms,
          exampleCount,
          exerciseCount,
          statusCounts,
          categoryCounts,
          recentTerms,
          scope: includeAll ? "all" : "approved",
        },
      },
      { headers: noStore },
    );
  } catch (error) {
    logger.error({ err: error }, "admin.summary_failed");
    return NextResponse.json({ ok: false, error: "No se pudo generar el resumen" }, { status: 500, headers: noStore });
  }
}
