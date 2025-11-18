import { Prisma } from "@prisma/client";
import type { TermDTO, TermExampleDTO, TermExerciseSolutionDTO, UseCaseStepDTO } from "@/types/term";

export type PrismaTermWithRelations = Prisma.TermGetPayload<{
  include: { variants: true; useCases: true; faqs: true; exercises: true };
}>;

export function serializeTerm(record: PrismaTermWithRelations): TermDTO {
  const examples = parseExamples(record.examples);
  const aliases = toStringArray(record.aliases);
  const tags = toStringArray(record.tags);
  return {
    id: record.id,
    term: record.term,
    translation: record.translation,
    slug: record.slug ?? undefined,
    aliases,
    tags,
    category: record.category,
    titleEs: record.titleEs ?? record.translation ?? record.term,
    titleEn: record.titleEn ?? record.term,
    meaning: record.meaning,
    meaningEs: record.meaningEs ?? record.meaning,
    meaningEn: record.meaningEn ?? undefined,
    what: record.what,
    whatEs: record.whatEs ?? record.what,
    whatEn: record.whatEn ?? undefined,
    how: record.how,
    howEs: record.howEs ?? record.how,
    howEn: record.howEn ?? undefined,
    examples,
    variants: record.variants?.map((variant) => ({
      id: variant.id,
      language: variant.language,
      snippet: variant.snippet,
      notes: variant.notes ?? undefined,
      level: variant.level,
      status: variant.status,
      reviewedAt: variant.reviewedAt?.toISOString?.() ?? null,
      reviewedById: variant.reviewedById ?? undefined,
    })),
    useCases: record.useCases?.map((useCase) => ({
      id: useCase.id,
      context: useCase.context,
      summary: useCase.summary,
      steps: parseSteps(useCase.steps),
      tips: useCase.tips ?? undefined,
      status: useCase.status,
      reviewedAt: useCase.reviewedAt?.toISOString?.() ?? null,
      reviewedById: useCase.reviewedById ?? undefined,
    })),
    exercises: record.exercises?.map((exercise) => ({
      id: exercise.id,
      titleEs: exercise.titleEs,
      titleEn: exercise.titleEn ?? undefined,
      promptEs: exercise.promptEs,
      promptEn: exercise.promptEn ?? undefined,
      difficulty: exercise.difficulty,
      solutions: parseSolutions(exercise.solutions),
      status: exercise.status,
      reviewedAt: exercise.reviewedAt?.toISOString?.() ?? null,
      reviewedById: exercise.reviewedById ?? undefined,
    })),
    status: record.status,
    reviewedAt: record.reviewedAt?.toISOString?.() ?? null,
    reviewedById: record.reviewedById ?? undefined,
  };
}

function parseExamples(value: Prisma.JsonValue | null | undefined): TermExampleDTO[] {
  if (!value || typeof value !== "object" || !Array.isArray(value)) return [];
  const items: TermExampleDTO[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const code = getString(raw.code) ?? "";
    if (!code) continue;
    const title = getString(raw.title) ?? getString(raw.titleEs) ?? getString(raw.titleEn);
    const note = getString(raw.note) ?? getString(raw.noteEs) ?? getString(raw.noteEn);
    items.push({
      title,
      titleEs: getString(raw.titleEs),
      titleEn: getString(raw.titleEn),
      code,
      note,
      noteEs: getString(raw.noteEs),
      noteEn: getString(raw.noteEn),
    });
  }
  return items;
}

function parseSteps(value: Prisma.JsonValue | null | undefined): UseCaseStepDTO[] {
  if (!value || !Array.isArray(value)) return [];
  const steps: UseCaseStepDTO[] = [];
  for (const raw of value) {
    if (typeof raw === "string") {
      steps.push({ es: raw });
      continue;
    }
    if (isRecord(raw)) {
      steps.push({ es: getString(raw.es), en: getString(raw.en) });
    }
  }
  return steps;
}

function parseSolutions(value: Prisma.JsonValue | null | undefined): TermExerciseSolutionDTO[] {
  if (!value || !Array.isArray(value)) return [];
  const solutions: TermExerciseSolutionDTO[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const code = getString(raw.code) ?? "";
    if (!code) continue;
    solutions.push({
      language: getString(raw.language) ?? "js",
      code,
      explainEs: getString(raw.explainEs) ?? "",
      explainEn: getString(raw.explainEn),
    });
  }
  return solutions;
}

function toStringArray(value: Prisma.JsonValue | null | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (typeof item === "number" || typeof item === "boolean") return String(item);
        return null;
      })
      .filter((item): item is string => Boolean(item));
  }
  return [];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
