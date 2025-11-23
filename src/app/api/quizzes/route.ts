import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { QuizTemplateDTO } from "@/types/quiz";

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
    const quizzes = await prisma.quizTemplate.findMany({ orderBy: { createdAt: "desc" } });
    const filtered = tags.length
      ? quizzes.filter((quiz: QuizRecord) => {
        const normalized = normalizeArray(quiz.tags).map((tag) => tag.toLowerCase());
        return tags.some((tag) => normalized.includes(tag));
      })
      : quizzes;
    const offsetParam = req.nextUrl.searchParams.get("offset") ?? "0";
    const offset = Number.parseInt(offsetParam, 10);
    const pageSize = Number.isFinite(limit) ? Math.max(1, Math.min(12, limit)) : 6;
    const items = filtered.slice(offset, offset + pageSize).map(toQuizTemplateDTO);
    return NextResponse.json({ ok: true, items }, { headers: noStore });
  } catch (error) {
    logger.error({ err: error }, "quizzes.list_failed");
    return NextResponse.json({ ok: false, error: "No se pudieron cargar los quizzes" }, { status: 500, headers: noStore });
  }
}
