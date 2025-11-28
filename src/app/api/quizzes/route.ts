import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { QuizTemplateDTO } from "@/types/quiz";
import { ensureQuizzesSeeded } from "@/lib/bootstrap-quizzes";

const noStore = { "Cache-Control": "no-store" } as const;

type QuizRecord = Awaited<ReturnType<typeof prisma.quizTemplate.findMany>>[number];

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim().length) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value.split(",").map((entry) => entry.trim()).filter(Boolean);
    }
  }
  return [];
}

function toQuizTemplateDTO(record: QuizRecord): QuizTemplateDTO {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    difficulty: record.difficulty,
    tags: normalizeArray(record.tags),
    items: Array.isArray(record.items) ? (record.items as QuizTemplateDTO["items"]) : [],
  };
}

export async function GET(req: NextRequest) {
  await ensureQuizzesSeeded();
  const limitParam = req.nextUrl.searchParams.get("limit") ?? "6";
  const tagParam = req.nextUrl.searchParams.get("tags");
  const limit = Number.parseInt(limitParam, 10);
  const tags = tagParam
    ? tagParam
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
    : [];
  try {
    const offsetParam = req.nextUrl.searchParams.get("offset") ?? "0";
    const offset = Number.parseInt(offsetParam, 10);
    const pageSize = Number.isFinite(limit) ? Math.max(1, Math.min(12, limit)) : 6;
    const safeOffset = Number.isFinite(offset) && offset > 0 ? offset : 0;

    let rawItems;

    // Intentar filtrado en DB si hay tags
    if (tags.length > 0) {
      // Filtrado en memoria para evitar operadores JSON complejos
      const allQuizzes = await prisma.quizTemplate.findMany({
        orderBy: { createdAt: "desc" },
      });
      const filtered = allQuizzes.filter((quiz) => {
        const normalizedTags = normalizeArray(quiz.tags).map((tag) => tag.toLowerCase());
        return tags.some((tag) => normalizedTags.includes(tag));
      });
      rawItems = filtered.slice(safeOffset, safeOffset + pageSize);
    } else {
      // Sin filtros, paginación simple
      rawItems = await prisma.quizTemplate.findMany({
        orderBy: { createdAt: "desc" },
        take: pageSize,
        skip: safeOffset,
      });
    }

    const normalized = rawItems.map(toQuizTemplateDTO);
    return NextResponse.json({ ok: true, items: normalized }, { headers: noStore });
  } catch (error) {
    logger.error({ err: error }, "quizzes.list_failed");
    return NextResponse.json({ ok: false, error: "No se pudieron cargar los quizzes" }, { status: 500, headers: noStore });
  }
}
