#!/usr/bin/env tsx
/**
 * Script de seed para quizzes
 * Ejecutar con: npx tsx prisma/seed-quizzes.ts
 * O añadir a package.json como script de seed
 */

import { PrismaClient } from "@prisma/client";
import { quizSeed } from "../src/lib/quiz-seed";
import { buildTermQuizSeed } from "../src/lib/quiz-from-terms";

const prisma = new PrismaClient();


async function main() {
    console.log("🌱 Iniciando seed de quizzes...");

    try {
        const existing = await prisma.quizTemplate.count();
        if (existing === 0) {
            console.log("📝 Creando quizzes de ejemplo...");
        } else {
            console.log(`📝 Actualizando ${quizSeed.length} quizzes de referencia...`);
        }

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

        if (termQuizzes.length) {
            console.log(`Quizzes por terminos: ${termQuizzes.length}`);
        }

        const allQuizzes = [...quizSeed, ...termQuizzes];

        for (const quiz of allQuizzes) {
            await prisma.quizTemplate.upsert({
                where: { slug: quiz.slug },
                create: {
                    slug: quiz.slug,
                    title: quiz.title,
                    description: quiz.description,
                    difficulty: quiz.difficulty,
                    tags: quiz.tags,
                    items: quiz.items,
                },
                update: {
                    title: quiz.title,
                    description: quiz.description,
                    difficulty: quiz.difficulty,
                    tags: quiz.tags,
                    items: quiz.items,
                },
            });
            console.log(`  ✓ Seed OK: ${quiz.title}`);
        }

        console.log(`\n✅ Seed completado: ${allQuizzes.length} quizzes procesados`);
    } catch (error) {
        console.error("❌ Error durante el seed de quizzes:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
