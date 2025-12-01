import { vi } from "vitest";
import type { Difficulty } from "@prisma/client";

type TermRecord = {
  id: number;
  term: string;
  translation: string;
  category: string;
  meaning: string;
  what: string;
  how: string;
  aliases: string[];
  tags: string[];
  examples: unknown[];
  variants: unknown[];
  useCases: unknown[];
  faqs: unknown[];
  exercises: unknown[];
  createdAt: Date;
  slug?: string | null;
};
type TermInput = Partial<TermRecord> &
  Pick<TermRecord, "term" | "translation" | "category" | "meaning" | "what" | "how">;

type QuizRecord = {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  items: unknown[];
  createdAt: Date;
};
type QuizInput = Partial<QuizRecord> &
  Pick<QuizRecord, "slug" | "title" | "description" | "difficulty" | "tags" | "items">;

let termId = 1;
let quizId = 1;
const termStore: TermRecord[] = [];
const quizStore: QuizRecord[] = [];

function normalizeLikeParam(param?: string | number) {
  if (typeof param !== "string") return "";
  return param.replace(/%/g, "").toLowerCase();
}

function filterTermsFromSql(sql: string, params: Array<string | number>) {
  let filtered = [...termStore];
  let index = 0;
  const lowerSql = sql.toLowerCase();
  const hasPagination = /limit\s+\$\d+/i.test(sql);
  const filterParamCount = params.length - (hasPagination ? 2 : 0);
  const hasCategoryFilter = sql.includes("\"category\"");
  const hasTextSearch = lowerSql.includes(" ilike $");
  const hasTagFilter =
    sql.includes("\"tags\"") && filterParamCount > (hasCategoryFilter ? 1 : 0) + (hasTextSearch ? 8 : 0);

  if (hasCategoryFilter) {
    const category = params[index++] as string | undefined;
    if (category) {
      filtered = filtered.filter((term) => term.category === category);
    }
  }

  if (hasTagFilter) {
    const rawTag = params[index++] as string | undefined;
    const tag = normalizeLikeParam(rawTag);
    if (tag) {
      filtered = filtered.filter((term) => term.tags.some((entry) => entry.toLowerCase().includes(tag)));
    }
  }

  if (hasTextSearch) {
    const like = normalizeLikeParam(params[index]);
    if (like) {
      filtered = filtered.filter((term) => {
        const values = [
          term.term,
          term.translation,
          term.meaning,
          term.what,
          term.how,
          term.aliases.join(" "),
          term.tags.join(" "),
          JSON.stringify(term.examples),
        ]
          .filter(Boolean)
          .map((value) => value.toLowerCase());
        return values.some((value) => value.includes(like));
      });
    }
  }

  const order = (() => {
    const lowerSql = sql.toLowerCase();
    if (lowerSql.includes("\"createdat\" desc")) {
      return (a: TermRecord, b: TermRecord) => b.createdAt.getTime() - a.createdAt.getTime();
    }
    if (lowerSql.includes("\"createdat\" asc")) {
      return (a: TermRecord, b: TermRecord) => a.createdAt.getTime() - b.createdAt.getTime();
    }
    if (lowerSql.includes("\"term\" desc")) {
      return (a: TermRecord, b: TermRecord) => b.term.localeCompare(a.term);
    }
    return (a: TermRecord, b: TermRecord) => a.term.localeCompare(b.term);
  })();

  filtered = [...filtered].sort(order);

  return filtered;
}

export function resetPrismaMock() {
  termId = 1;
  quizId = 1;
  termStore.length = 0;
  quizStore.length = 0;
  vi.clearAllMocks();
}

export const prisma = {
  term: {
    createMany: vi.fn(async ({ data }: { data: TermInput[] }) => {
      const items = Array.isArray(data) ? data : [data];
      let count = 0;
      for (const item of items) {
        const slug = item.slug ?? null;
        if (termStore.some((existing) => existing.term === item.term || existing.slug === slug)) continue;
        termStore.push({
          id: termId++,
          aliases: [],
          tags: [],
          examples: [],
          variants: [],
          useCases: [],
          faqs: [],
          exercises: [],
          createdAt: new Date(),
          ...item,
          slug,
        });
        count += 1;
      }
      return { count };
    }),
    deleteMany: vi.fn(async ({ where }: { where?: { term?: { in?: string[] } } }) => {
      const toDelete = where?.term?.in ?? [];
      const initial = termStore.length;
      for (const term of toDelete) {
        const index = termStore.findIndex((entry) => entry.term === term);
        if (index !== -1) termStore.splice(index, 1);
      }
      return { count: initial - termStore.length };
    }),
    findMany: vi.fn(async (args?: { where?: { id?: { in?: number[] } }; take?: number; skip?: number }) => {
      let results = [...termStore];
      const ids = args?.where?.id?.in;
      if (ids) {
        results = results.filter((term) => ids.includes(term.id));
      }
      if (typeof args?.skip === "number" || typeof args?.take === "number") {
        const start = args?.skip ?? 0;
        const end = args?.take ? start + args.take : undefined;
        results = results.slice(start, end);
      }
      return results.map((term) => ({
        ...term,
        slug: term.slug ?? null,
        translation: term.translation ?? term.term,
      }));
    }),
  },
  quizTemplate: {
    createMany: vi.fn(async ({ data }: { data: QuizInput[] }) => {
      const items = Array.isArray(data) ? data : [data];
      let count = 0;
      for (const item of items) {
        if (quizStore.some((quiz) => quiz.slug === item.slug)) continue;
        quizStore.push({
          id: quizId++,
          createdAt: new Date(),
          ...item,
        });
        count += 1;
      }
      // Prisma createMany devuelve { count }
      return { count };
    }),
    deleteMany: vi.fn(async ({ where }: { where?: { slug?: { in?: string[] } } }) => {
      const slugs = where?.slug?.in ?? [];
      const initial = quizStore.length;
      for (const slug of slugs) {
        const index = quizStore.findIndex((quiz) => quiz.slug === slug);
        if (index !== -1) quizStore.splice(index, 1);
      }
      return { count: initial - quizStore.length };
    }),
    findMany: vi.fn(async (args?: { orderBy?: { createdAt?: "desc" | "asc" }; take?: number; skip?: number }) => {
      let results = [...quizStore];
      if (args?.orderBy?.createdAt === "desc") {
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      if (typeof args?.skip === "number" || typeof args?.take === "number") {
        const start = args?.skip ?? 0;
        const end = args?.take ? start + args.take : undefined;
        results = results.slice(start, end);
      }
      return results.map((quiz) => ({ ...quiz }));
    }),
  },
  searchLog: {
    create: vi.fn(async () => ({})),
  },
  $queryRawUnsafe: vi.fn(async (sql: string, ...params: Array<string | number>) => {
    const filtered = filterTermsFromSql(sql, params);
    if (sql.toLowerCase().includes("count")) {
      return [{ count: filtered.length }];
    }
    // List query: last two params are limit and offset
    const limit = Number(params.at(-2) ?? filtered.length);
    const offset = Number(params.at(-1) ?? 0);
    return filtered.slice(offset, offset + limit).map((term) => ({ id: term.id }));
  }),
  $disconnect: vi.fn(async () => undefined),
};

export type PrismaMock = typeof prisma;
