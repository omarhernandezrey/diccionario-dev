import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { quizSeed } from "@/lib/quiz-seed";
import { buildTermQuizSeed } from "@/lib/quiz-from-terms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const noStore = { "Cache-Control": "no-store" } as const;
const TRUTHY = new Set(["1", "true", "yes", "on"]);

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req.headers);
    const includeTermsParam = req.nextUrl.searchParams.get("includeTerms");
    const includeTerms =
      includeTermsParam == null
        ? process.env.QUIZ_AUTOSEED_INCLUDE_TERMS === "true"
        : TRUTHY.has(includeTermsParam.trim().toLowerCase());

    let allQuizzes = quizSeed;
    if (includeTerms) {
      const termRecords = await prisma.term.findMany({
        select: {
          id: true,
          term: true,
          translation: true,
          meaning: true,
          meaningEn: true,
          what: true,
          how: true,
          whatEn: true,
          howEn: true,
          category: true,
        },
      });
      const termQuizzes = buildTermQuizSeed(
        termRecords.map((term) => ({
          id: term.id,
          term: term.term,
          translation: term.translation ?? "",
          meaning: term.meaning?.trim() || term.what?.trim() || term.how?.trim() || term.term,
          meaningEn: term.meaningEn?.trim() || term.whatEn?.trim() || term.howEn?.trim() || null,
          category: term.category,
        })),
      );
      allQuizzes = [...quizSeed, ...termQuizzes];
    }

    const existingSlugs = new Set(
      (await prisma.quizTemplate.findMany({ select: { slug: true } })).map((record) => record.slug),
    );
    let created = 0;
    let updated = 0;

    for (const quiz of allQuizzes) {
      if (existingSlugs.has(quiz.slug)) {
        await prisma.quizTemplate.update({
          where: { slug: quiz.slug },
          data: {
            title: quiz.title,
            description: quiz.description,
            difficulty: quiz.difficulty,
            tags: quiz.tags,
            items: quiz.items,
          },
        });
        updated += 1;
      } else {
        await prisma.quizTemplate.create({
          data: {
            slug: quiz.slug,
            title: quiz.title,
            description: quiz.description,
            difficulty: quiz.difficulty,
            tags: quiz.tags,
            items: quiz.items,
          },
        });
        created += 1;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        total: allQuizzes.length,
        created,
        updated,
        includeTerms,
      },
      { headers: noStore },
    );
  } catch (error) {
    if (error instanceof Response) return error;
    logger.error({ err: error }, "quizzes.seed_failed");
    return NextResponse.json(
      {
        ok: false,
        error: (error as Error)?.message ?? "Seed failed",
      },
      { status: 500, headers: noStore },
    );
  }
}
