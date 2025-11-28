import { prisma } from "../src/lib/prisma";
import { curatedTerms } from "./data/curatedTerms";
import { cssCuratedTerms } from "./data/cssTerms";
import { ReviewStatus, SkillLevel, UseCaseContext, Category, Language } from "@prisma/client";

// Mapeos necesarios copiados de bootstrap-dataset.ts
const categoryContextEs: Record<Category, string> = {
    frontend: "la capa visual y de interacción",
    backend: "las APIs, servicios y lógica de negocio",
    database: "el modelado y las consultas de datos",
    devops: "los pipelines, CLI y despliegues",
    general: "todo el stack",
};

const categoryContextEn: Record<Category, string> = {
    frontend: "the UI layer",
    backend: "APIs, services, and business logic",
    database: "data modeling and querying",
    devops: "pipelines, CLIs, and deployments",
    general: "the entire stack",
};

const howByCategoryEs: Record<Category, (term: string) => string> = {
    frontend: (term) => `Implementa "${term}" dentro de tus componentes React/Next para mantener una UI coherente y accesible.`,
    backend: (term) => `Incluye "${term}" en tus controladores o servicios Node/Nest garantizando reglas de negocio claras.`,
    database: (term) => `Modela "${term}" en tus esquemas SQL/Prisma y valida los datos antes de almacenarlos.`,
    devops: (term) => `Automatiza "${term}" con scripts, contenedores y pipelines de CI/CD para despliegues repetibles.`,
    general: (term) => `Documenta y reutiliza "${term}" como parte de tus utilidades para que el equipo comparta el mismo lenguaje.`,
};

const howByCategoryEn: Record<Category, (term: string) => string> = {
    frontend: (term) => `Use "${term}" across your React/Next components to keep the UI consistent and accessible.`,
    backend: (term) => `Add "${term}" to your Node/Nest controllers or services to keep business rules explicit.`,
    database: (term) => `Model "${term}" in your SQL/Prisma schemas and validate the data before persisting it.`,
    devops: (term) => `Automate "${term}" through scripts, containers, and CI/CD pipelines for reliable deployments.`,
    general: (term) => `Document and reuse "${term}" as a shared utility so the team speaks the same language.`,
};

const variantLanguageByCategory: Record<Category, Language> = {
    frontend: Language.ts,
    backend: Language.js,
    database: Language.py,
    devops: Language.go,
    general: Language.ts,
};

function toSlug(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function buildMeaningEn(term: string, translation: string) {
    if (!translation) {
        return `In programming, "${term}" is a common concept used across the stack.`;
    }
    return `In programming, "${term}" refers to ${translation}.`;
}

function buildVariants(language: Language, code: string, notes?: string) {
    return [
        {
            language,
            snippet: code,
            notes,
            level: language === Language.css ? SkillLevel.beginner : SkillLevel.intermediate,
        },
    ];
}

function buildUseCases(term: string, category: Category, whatEs: string, whatEn: string) {
    return [
        {
            context: UseCaseContext.project,
            summaryEs: `Aplica "${term}" en ${categoryContextEs[category]} para destrabar un caso real.`,
            summaryEn: `Apply "${term}" in ${categoryContextEn[category]} to unblock a real scenario.`,
            stepsEs: [
                `Describe el problema dentro de ${categoryContextEs[category]}.`,
                `Explica cómo "${term}" lo resuelve.`,
                "Comparte el impacto final.",
            ],
            stepsEn: [
                `Describe the problem inside ${categoryContextEn[category]}.`,
                `Explain how "${term}" solves it.`,
                "Share the outcome.",
            ],
            tipsEs: "Conecta el concepto con un proyecto o métrica real.",
            tipsEn: "Connect the concept with a real project or metric.",
        },
        {
            context: UseCaseContext.interview,
            summaryEs: `Explica "${term}" como si estuvieras frente a un líder técnico.`,
            summaryEn: `Explain "${term}" as if you were in front of a tech lead.`,
            stepsEs: [`Menciona qué resuelve "${term}".`, "Ilustra un ejemplo concreto.", "Cierra con el impacto en negocio."],
            stepsEn: [`Mention what "${term}" solves.`, "Illustrate a concrete example.", "Close with the business impact."],
            tipsEs: "Usa analogías claras y evita jerga innecesaria.",
            tipsEn: "Use clear analogies and avoid unnecessary jargon.",
        },
        {
            context: UseCaseContext.bug,
            summaryEs: `Usa "${term}" para diagnosticar o prevenir bugs relacionados.`,
            summaryEn: `Use "${term}" to diagnose or prevent related bugs.`,
            stepsEs: ["Identifica el síntoma o error.", `Relaciona el bug con "${term}".`, "Explica la solución aplicada."],
            stepsEn: ["Identify the symptom or error.", `Relate the bug to "${term}".`, "Explain the applied fix."],
            tipsEs: "Resalta logs o métricas relevantes.",
            tipsEn: "Highlight relevant logs or metrics.",
        },
    ].map((useCase) => ({
        context: useCase.context,
        summary: [useCase.summaryEs || whatEs, useCase.summaryEn || whatEn].filter(Boolean).join(" | "),
        steps: useCase.stepsEs.map((es, index) => ({
            es,
            en: useCase.stepsEn[index] ?? useCase.stepsEn[useCase.stepsEn.length - 1] ?? es,
        })),
        tips: [useCase.tipsEs, useCase.tipsEn].filter(Boolean).join(" | ") || undefined,
    }));
}

function buildFaqs(
    term: string,
    translation: string,
    meaningEs: string,
    meaningEn: string,
    example: any,
    howEs: string,
    howEn: string,
) {
    return [
        {
            questionEs: `¿Cómo explicas ${term} en una entrevista?`,
            questionEn: `How do you explain ${term} during an interview?`,
            answerEs: `${meaningEs} ${howEs}`,
            answerEn: `${meaningEn} ${howEn}`,
            snippet: example.code,
            category: translation,
            howToExplain: "Usa un ejemplo, enlaza con impacto real y ofrece métricas cuando sea posible.",
        },
    ];
}

function buildExercises(term: string, language: Language, code: string, howEs: string, howEn: string) {
    return [
        {
            titleEs: `Ejercicio ${term}`,
            titleEn: `${term} challenge`,
            promptEs: `Implementa "${term}" en un ejemplo práctico y explica cada paso.`,
            promptEn: `Implement "${term}" in a practical snippet and explain each step.`,
            difficulty: "medium", // Usamos string literal si el enum da problemas, o importamos Difficulty
            solutions: [
                {
                    language,
                    code,
                    explainEs: howEs,
                    explainEn: howEn,
                },
            ],
        },
    ];
}

async function main() {
    console.log("Iniciando actualización forzada de términos...");

    // Combinamos ambos arrays de términos
    const allTerms = [...curatedTerms, ...cssCuratedTerms];
    console.log(`Total de términos a procesar: ${allTerms.length}`);

    for (const input of allTerms) {
        console.log(`Procesando: ${input.term}`);

        const {
            term,
            translation,
            category,
            descriptionEs,
            descriptionEn,
            aliases = [],
            tags = [],
            example,
            exerciseExample, // Nuevo campo
            whatEs,
            whatEn,
            howEs,
            howEn,
            languageOverride,
        } = input;

        const meaningEs = `En programación "${term}" se refiere a ${descriptionEs}.`;
        const meaningEn = descriptionEn ?? buildMeaningEn(term, translation);
        const resolvedWhatEs = whatEs ?? `Lo empleamos para ${descriptionEs} dentro de ${categoryContextEs[category]}.`;
        const resolvedWhatEn = whatEn ?? `We use it for ${categoryContextEn[category]}.`;
        const resolvedHowEs = howEs ?? howByCategoryEs[category](term);
        const resolvedHowEn = howEn ?? howByCategoryEn[category](term);
        const variantLanguage = languageOverride ?? variantLanguageByCategory[category];

        // Usamos exerciseExample si existe, sino usamos example
        const exerciseCode = exerciseExample?.code ?? example.code;

        const termData = {
            term,
            translation,
            slug: toSlug(term),
            titleEs: translation || term,
            titleEn: term,
            aliases,
            tags,
            category,
            meaning: meaningEs,
            meaningEs,
            meaningEn,
            what: resolvedWhatEs,
            whatEs: resolvedWhatEs,
            whatEn: resolvedWhatEn,
            how: resolvedHowEs,
            howEs: resolvedHowEs,
            howEn: resolvedHowEn,
            examples: input.secondExample ? [example, input.secondExample] : [example],
            status: ReviewStatus.approved,
        };

        // Primero obtenemos el término si existe para poder borrar sus relaciones
        const existingTerm = await prisma.term.findUnique({
            where: { term: termData.term },
            select: { id: true }
        });

        // Si existe, borramos los ejercicios y variantes viejos para reemplazarlos
        if (existingTerm) {
            await prisma.exercise.deleteMany({
                where: { termId: existingTerm.id }
            });
            await prisma.termVariant.deleteMany({
                where: { termId: existingTerm.id }
            });
        }

        await prisma.term.upsert({
            where: { term: termData.term },
            update: {
                ...termData,
                // Forzamos actualización de examples
                examples: input.secondExample ? [example, input.secondExample] : [example],
                // Recreamos las variantes con el código comentado
                variants: {
                    create: buildVariants(variantLanguage, example.code, example.noteEs ?? example.noteEn).map(v => ({
                        ...v,
                        status: ReviewStatus.approved
                    }))
                },
                // Recreamos los ejercicios con el código comentado
                exercises: {
                    create: buildExercises(term, variantLanguage, exerciseCode, resolvedHowEs, resolvedHowEn).map(e => ({
                        ...e,
                        difficulty: "medium",
                        status: ReviewStatus.approved
                    }))
                }
            },
            create: {
                ...termData,
                variants: {
                    create: buildVariants(variantLanguage, example.code, example.noteEs ?? example.noteEn).map(v => ({
                        ...v,
                        status: ReviewStatus.approved
                    }))
                },
                useCases: {
                    create: buildUseCases(term, category, resolvedWhatEs, resolvedWhatEn).map(u => ({
                        ...u,
                        status: ReviewStatus.approved
                    }))
                },
                faqs: {
                    create: buildFaqs(term, translation, meaningEs, meaningEn, example, resolvedHowEs, resolvedHowEn).map(f => ({
                        ...f,
                        status: ReviewStatus.approved
                    }))
                },
                exercises: {
                    create: buildExercises(term, variantLanguage, exerciseCode, resolvedHowEs, resolvedHowEn).map(e => ({
                        ...e,
                        difficulty: "medium", // Hardcoded para simplificar tipos
                        status: ReviewStatus.approved
                    }))
                }
            }
        });
    }
    console.log("Actualización completada.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
