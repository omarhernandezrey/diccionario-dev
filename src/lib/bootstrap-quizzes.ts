import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { quizSeed } from "@/lib/quiz-seed";
import { buildTermQuizSeed } from "@/lib/quiz-from-terms";

let seedPromise: Promise<void> | null = null;

/**
 * Asegura que los quizzes estén sembrados.
 * NOTA: Este autoseed en runtime está deshabilitado por defecto para mejorar rendimiento.
 * Se recomienda usar el script de seed dedicado: npx tsx prisma/seed-quizzes.ts
 * Para habilitar el autoseed, establece ENABLE_QUIZ_AUTOSEED=true en .env
 * Para incluir quizzes por terminos, establece QUIZ_AUTOSEED_INCLUDE_TERMS=true
 */
export async function ensureQuizzesSeeded() {
  // Autoseed deshabilitado por defecto para mejorar rendimiento
  const autoseedEnabled = process.env.ENABLE_QUIZ_AUTOSEED === "true";

  if (!autoseedEnabled) {
    logger.info("Quiz autoseed deshabilitado. Usa 'npx tsx prisma/seed-quizzes.ts' para sembrar quizzes.");
    return;
  }

  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const existing = await prisma.quizTemplate.count();
    if (existing === 0) {
      logger.warn("Inicializando quizzes de ejemplo porque la tabla esta vacia.");
    }
    const includeTermQuizzes = process.env.QUIZ_AUTOSEED_INCLUDE_TERMS === "true";
    let allQuizzes = quizSeed;
    if (includeTermQuizzes) {
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
      logger.info({ count: termQuizzes.length }, "quizzes.autoseed_terms_enabled");
    }
    const existingSlugs = new Set(
      (await prisma.quizTemplate.findMany({ select: { slug: true } })).map((record) => record.slug),
    );
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
      }
    }
  })().catch((error) => {
    logger.error({ err: error }, "quizzes.bootstrap_failed");
    seedPromise = null;
    throw error;
  });
  return seedPromise;
}
