import { Difficulty } from "@prisma/client";
import type { SeedQuiz } from "@/lib/quiz-seed";

export type TermQuizRecord = {
  id: number;
  term: string;
  translation: string;
  meaning: string;
  meaningEn?: string | null;
  category: string;
};

export type TermQuizOptions = {
  perQuiz?: number;
  maxOptionLength?: number;
};

export const DEFAULT_TERMS_PER_QUIZ = 12;
export const DEFAULT_MAX_OPTION_LENGTH = 120;

const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  database: "Bases de Datos",
  devops: "DevOps",
  general: "General",
};

const CATEGORY_DIFFICULTY: Record<string, Difficulty> = {
  frontend: Difficulty.easy,
  backend: Difficulty.medium,
  database: Difficulty.medium,
  devops: Difficulty.hard,
  general: Difficulty.easy,
};

const normalizeText = (value: string) => value.trim();
const normalizeKey = (value: string) => normalizeText(value).toLowerCase();

const truncate = (value: string, max: number) => {
  const trimmed = normalizeText(value);
  if (trimmed.length <= max) return trimmed;
  const ellipsis = "...";
  const sliceEnd = Math.max(0, max - ellipsis.length);
  return `${trimmed.slice(0, sliceEnd).trim()}${ellipsis}`;
};

const uniqueOptions = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((value) => {
    const trimmed = normalizeText(value);
    if (!trimmed) return;
    const key = normalizeKey(trimmed);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(trimmed);
  });
  return result;
};

const mulberry32 = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const seededShuffle = <T,>(list: T[], seed: number) => {
  const result = [...list];
  const rand = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const pickOptions = (pool: string[], exclude: string, count: number, seed: number) => {
  const normalizedExclude = normalizeKey(exclude);
  const filtered = pool.filter((value) => normalizeKey(value) !== normalizedExclude);
  return seededShuffle(filtered, seed).slice(0, Math.max(0, count));
};

const chunk = <T,>(list: T[], size: number) => {
  const result: T[][] = [];
  if (!size || size <= 0) return result;
  for (let i = 0; i < list.length; i += size) {
    result.push(list.slice(i, i + size));
  }
  return result;
};

type OptionPools = {
  translationsByCategory: Record<string, string[]>;
  meaningsByCategory: Record<string, string[]>;
  translationsAll: string[];
  meaningsAll: string[];
};

const buildOptionPools = (terms: TermQuizRecord[]): OptionPools => {
  const translationsByCategory: Record<string, string[]> = {};
  const meaningsByCategory: Record<string, string[]> = {};
  const translationsAll: string[] = [];
  const meaningsAll: string[] = [];

  terms.forEach((term) => {
    const category = term.category || "general";
    if (!translationsByCategory[category]) translationsByCategory[category] = [];
    if (!meaningsByCategory[category]) meaningsByCategory[category] = [];

    if (term.translation?.trim()) {
      translationsByCategory[category].push(term.translation);
      translationsAll.push(term.translation);
    }
    if (term.meaning?.trim()) {
      meaningsByCategory[category].push(term.meaning);
      meaningsAll.push(term.meaning);
    }
  });

  Object.keys(translationsByCategory).forEach((category) => {
    translationsByCategory[category] = uniqueOptions(translationsByCategory[category]);
  });
  Object.keys(meaningsByCategory).forEach((category) => {
    meaningsByCategory[category] = uniqueOptions(meaningsByCategory[category]);
  });

  return {
    translationsByCategory,
    meaningsByCategory,
    translationsAll: uniqueOptions(translationsAll),
    meaningsAll: uniqueOptions(meaningsAll),
  };
};

const buildTranslationItem = (
  term: TermQuizRecord,
  pools: OptionPools,
  maxOptionLength: number,
) => {
  const correct = normalizeText(term.translation);
  const correctOption = truncate(correct, maxOptionLength);
  const category = term.category || "general";
  const needed = 3;
  const wrongFromCategory = pickOptions(
    pools.translationsByCategory[category] || [],
    correct,
    needed,
    term.id,
  );
  const missing = needed - wrongFromCategory.length;
  const wrongFromAll = missing
    ? pickOptions(pools.translationsAll, correct, missing, term.id + 11)
    : [];
  const options = seededShuffle(
    [correctOption, ...wrongFromCategory, ...wrongFromAll].map((value) => truncate(value, maxOptionLength)),
    term.id + 21,
  );
  const answerIndex = Math.max(0, options.findIndex((value) => normalizeKey(value) === normalizeKey(correctOption)));

  return {
    questionEs: `Que traduccion corresponde a "${term.term}"?`,
    questionEn: `Which translation matches "${term.term}"?`,
    options,
    answerIndex,
    explanationEs: term.meaning?.trim()
      ? `${term.meaning}`
      : `Traduccion correcta: ${correctOption}.`,
    explanationEn: term.meaningEn?.trim()
      ? `${term.meaningEn}`
      : `Correct translation: ${correctOption}.`,
  };
};

const buildMeaningItem = (
  term: TermQuizRecord,
  pools: OptionPools,
  maxOptionLength: number,
) => {
  const correct = normalizeText(term.meaning);
  const correctOption = truncate(correct, maxOptionLength);
  const category = term.category || "general";
  const needed = 3;
  const wrongFromCategory = pickOptions(
    pools.meaningsByCategory[category] || [],
    correct,
    needed,
    term.id + 3,
  );
  const missing = needed - wrongFromCategory.length;
  const wrongFromAll = missing
    ? pickOptions(pools.meaningsAll, correct, missing, term.id + 17)
    : [];
  const options = seededShuffle(
    [correctOption, ...wrongFromCategory, ...wrongFromAll].map((value) => truncate(value, maxOptionLength)),
    term.id + 29,
  );
  const answerIndex = Math.max(0, options.findIndex((value) => normalizeKey(value) === normalizeKey(correctOption)));

  return {
    questionEs: `Que descripcion corresponde a "${term.term}"?`,
    questionEn: `Which description matches "${term.term}"?`,
    options,
    answerIndex,
    explanationEs: term.meaning,
    explanationEn: term.meaningEn?.trim() ? term.meaningEn : term.meaning,
  };
};

export function buildTermQuizSeed(terms: TermQuizRecord[], options: TermQuizOptions = {}): SeedQuiz[] {
  const perQuiz = Math.max(3, options.perQuiz ?? DEFAULT_TERMS_PER_QUIZ);
  const maxOptionLength = Math.max(60, options.maxOptionLength ?? DEFAULT_MAX_OPTION_LENGTH);
  const pools = buildOptionPools(terms);
  const grouped: Record<string, TermQuizRecord[]> = {};

  terms.forEach((term) => {
    const category = term.category || "general";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(term);
  });

  const quizzes: SeedQuiz[] = [];

  Object.keys(grouped).forEach((category) => {
    const categoryTerms = grouped[category]
      .filter((term) => term.term?.trim() && term.meaning?.trim())
      .sort((a, b) => a.term.localeCompare(b.term));
    if (!categoryTerms.length) return;

    const items = categoryTerms.map((term) =>
      term.translation?.trim()
        ? buildTranslationItem(term, pools, maxOptionLength)
        : buildMeaningItem(term, pools, maxOptionLength),
    );

    const chunks = chunk(items, perQuiz);
    const label = CATEGORY_LABELS[category] || "General";
    const difficulty = CATEGORY_DIFFICULTY[category] || Difficulty.medium;

    chunks.forEach((chunkItems, index) => {
      quizzes.push({
        slug: `terms-${category}-${index + 1}`,
        title: `Terminos ${label} - Quiz ${index + 1}`,
        description: `Quiz de ${label} con ${chunkItems.length} terminos del catalogo.`,
        difficulty,
        tags: [category, "terms"],
        items: chunkItems,
      });
    });
  });

  return quizzes;
}
