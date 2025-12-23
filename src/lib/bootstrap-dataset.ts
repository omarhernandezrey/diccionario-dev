import type { SeedTerm, SeedTermInput } from "../../prisma/dictionary-types";
import { curatedTerms } from "../../prisma/data/curatedTerms";
import { cssCuratedTerms } from "../../prisma/data/cssTerms";
import { Category, Difficulty, Language, ReviewStatus, SkillLevel, UseCaseContext } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

type SeedOptions = {
  force?: boolean;
};

type SeedBatchResult = {
  processed: number;
  remaining: number;
  totalMissing: number;
  completed: boolean;
  batchLimitReached: boolean;
  timeBudgetReached: boolean;
};

const EXPECTED_SEED_COUNT = (() => {
  const terms = [...curatedTerms, ...cssCuratedTerms]
    .map((entry) => (typeof entry.term === "string" ? entry.term.trim().toLowerCase() : ""))
    .filter(Boolean);
  return new Set(terms).size;
})();

export function getExpectedSeedCount() {
  return EXPECTED_SEED_COUNT;
}

const DEFAULT_SEED_BATCH_SIZE = Number(process.env.SEED_BATCH_SIZE || 200);
const DEFAULT_SEED_TIME_BUDGET_MS = Number(process.env.SEED_TIME_BUDGET_MS || 7_000);

let seedPromise: Promise<SeedBatchResult | null> | null = null;

export async function ensureDictionarySeeded(options: SeedOptions = {}): Promise<SeedBatchResult | null> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const force = Boolean(options.force);
    const existingCount = await prisma.term.count();
    if (!force && existingCount >= EXPECTED_SEED_COUNT) {
      logger.info({ existingCount, expected: EXPECTED_SEED_COUNT }, "dictionary.seed_skipped");
      return null;
    }
    logger.info({ force, existingCount, expected: EXPECTED_SEED_COUNT }, "dictionary.seed_start");
    const result = await runDictionarySeedBatch(DEFAULT_SEED_BATCH_SIZE, DEFAULT_SEED_TIME_BUDGET_MS);
    logger.info(
      {
        processed: result.processed,
        remaining: result.remaining,
        totalMissing: result.totalMissing,
        batchLimitReached: result.batchLimitReached,
        timeBudgetReached: result.timeBudgetReached,
      },
      "dictionary.seed_batch_complete",
    );
    if (result.completed) {
      logger.info("dictionary.seed_complete");
    }
    return result;
  })().catch((error) => {
    logger.error({ err: error }, "dictionary.bootstrap_failed");
    throw error;
  }).finally(() => {
    seedPromise = null;
  });
  return seedPromise;
}

async function runDictionarySeedBatch(maxItems: number, timeBudgetMs: number): Promise<SeedBatchResult> {
  const dictionary = dedupeTerms([...curatedTerms, ...cssCuratedTerms].map(createSeedTerm));
  const existingTerms = await prisma.term.findMany({ select: { term: true } });
  const existingSet = new Set(existingTerms.map((entry) => entry.term.trim().toLowerCase()));
  const missingTerms = dictionary.filter((term) => !existingSet.has(term.term.trim().toLowerCase()));
  const start = Date.now();
  let processed = 0;
  let batchLimitReached = false;
  let timeBudgetReached = false;

  for (const term of missingTerms) {
    if (processed >= maxItems) {
      batchLimitReached = true;
      break;
    }
    if (Date.now() - start >= timeBudgetMs) {
      timeBudgetReached = true;
      break;
    }
    // Preparamos los datos para create/update
    const termData = {
      term: term.term,
      translation: term.translation,
      slug: term.slug,
      titleEs: term.titleEs,
      titleEn: term.titleEn,
      aliases: term.aliases,
      tags: term.tags ?? [],
      category: term.category,
      meaning: term.meaningEs,
      meaningEs: term.meaningEs,
      meaningEn: term.meaningEn,
      what: term.whatEs ?? term.whatEn ?? "",
      whatEs: term.whatEs,
      whatEn: term.whatEn,
      how: term.howEs ?? term.howEn ?? "",
      howEs: term.howEs,
      howEn: term.howEn,
      examples: term.examples,
      status: ReviewStatus.approved,
    };

    // Usamos upsert para crear o actualizar
    const created = await prisma.term.upsert({
      where: { term: term.term },
      update: {
        ...termData,
        // Actualizamos relaciones si es necesario, aunque para ejemplos simples basta con actualizar el JSON de examples
        // Nota: Para relaciones complejas (variants, useCases) en un upsert masivo, 
        // la estrategia ideal sería borrar y recrear o hacer upserts anidados complejos.
        // Para este caso, priorizamos actualizar los campos principales y examples que es donde está el código comentado.
      },
      create: {
        ...termData,
        variants: term.variants?.length
          ? {
            create: term.variants.map((variant) => ({
              language: variant.language,
              snippet: variant.code,
              notes: variant.notes,
              level: variant.level ?? SkillLevel.intermediate,
              status: ReviewStatus.approved,
            })),
          }
          : undefined,
        useCases: term.useCases?.length
          ? {
            create: term.useCases.map((useCase) => ({
              context: useCase.context,
              summary: [useCase.summaryEs, useCase.summaryEn].filter(Boolean).join(" | "),
              steps: useCase.stepsEs.map((es, index) => ({
                es,
                en: useCase.stepsEn[index] ?? useCase.stepsEn[useCase.stepsEn.length - 1] ?? es,
              })),
              tips: [useCase.tipsEs, useCase.tipsEn].filter(Boolean).join(" | ") || undefined,
              status: ReviewStatus.approved,
            })),
          }
          : undefined,
        faqs: term.faqs?.length
          ? {
            create: term.faqs.map((faq) => ({
              questionEs: faq.questionEs,
              questionEn: faq.questionEn,
              answerEs: faq.answerEs,
              answerEn: faq.answerEn,
              snippet: faq.snippet,
              category: faq.category,
              howToExplain: faq.howToExplain,
              status: ReviewStatus.approved,
            })),
          }
          : undefined,
        exercises: term.exercises?.length
          ? {
            create: term.exercises.map((exercise) => ({
              titleEs: exercise.titleEs,
              titleEn: exercise.titleEn,
              promptEs: exercise.promptEs,
              promptEn: exercise.promptEn,
              difficulty: exercise.difficulty,
              solutions: exercise.solutions,
              status: ReviewStatus.approved,
            })),
          }
          : undefined,
      },
    });
    await prisma.termStats.upsert({
      where: { termId: created.id },
      create: { termId: created.id },
      update: {},
    }).catch(() => undefined);
    processed += 1;
  }

  const remaining = Math.max(0, missingTerms.length - processed);
  return {
    processed,
    remaining,
    totalMissing: missingTerms.length,
    completed: remaining === 0,
    batchLimitReached,
    timeBudgetReached,
  };
}

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

function createSeedTerm(input: SeedTermInput): SeedTerm {
  const {
    term,
    translation,
    category,
    descriptionEs,
    descriptionEn,
    aliases = [],
    tags = [],
    example,
    exerciseExample, // Ahora es obligatorio
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
  const hasTailwindTag = (tags || []).map((tag) => tag.toLowerCase()).includes("tailwind");
  const examples = hasTailwindTag ? [example, exerciseExample] : [example, input.secondExample]; // Tailwind: solo 2 (ejemplo + práctica)

  // Usamos exerciseExample (ahora obligatorio)
  const exerciseCode = exerciseExample.code;

  return {
    term,
    translation,
    slug: toSlug(term),
    aliases,
    tags,
    category,
    titleEs: translation || term,
    titleEn: term,
    meaningEs,
    meaningEn,
    whatEs: resolvedWhatEs,
    whatEn: resolvedWhatEn,
    howEs: resolvedHowEs,
    howEn: resolvedHowEn,
    examples,
    variants: buildVariants(variantLanguage, example.code, example.noteEs ?? example.noteEn),
    useCases: buildUseCases(term, category, resolvedWhatEs, resolvedWhatEn),
    faqs: buildFaqs(term, translation, meaningEs, meaningEn, example, resolvedHowEs, resolvedHowEn),
    exercises: buildExercises(term, variantLanguage, exerciseCode, resolvedHowEs, resolvedHowEn),
  };
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
      code,
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
    ...useCase,
    summaryEs: useCase.summaryEs || whatEs,
    summaryEn: useCase.summaryEn || whatEn,
  }));
}

function buildFaqs(
  term: string,
  translation: string,
  meaningEs: string,
  meaningEn: string,
  example: SeedTerm["examples"][number],
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
      difficulty: Difficulty.medium,
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

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function dedupeTerms(terms: SeedTerm[]) {
  const map = new Map<string, SeedTerm>();

  for (const term of terms) {
    const key = term.term.trim().toLowerCase();
    if (!key) continue;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...term,
        aliases: term.aliases ?? [],
        tags: term.tags ?? [],
      });
      continue;
    }

    map.set(key, {
      ...existing,
      ...term,
      slug: existing.slug ?? term.slug,
      aliases: mergeUnique(existing.aliases ?? [], term.aliases ?? []),
      tags: mergeUnique(existing.tags ?? [], term.tags ?? []),
      examples: term.examples?.length ? term.examples : existing.examples,
      variants: mergeCollection(existing.variants, term.variants),
      useCases: mergeCollection(existing.useCases, term.useCases),
      faqs: mergeCollection(existing.faqs, term.faqs),
      exercises: mergeCollection(existing.exercises, term.exercises),
    });
  }

  return Array.from(map.values());
}

function mergeUnique<T>(a: T[], b: T[]) {
  return Array.from(new Set([...a, ...b].filter(Boolean)));
}

function mergeCollection<T>(a?: T[], b?: T[]) {
  if (!a?.length) return b ?? [];
  if (!b?.length) return a;
  return [...a, ...b];
}
