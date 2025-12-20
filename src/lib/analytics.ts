import { prisma } from "@/lib/prisma";

export type AnalyticsSummary = {
  topTerms: Array<{ termId: number; term: string; hits: number }>;
  languages: Array<{ language: string; count: number }>;
  contexts: Array<{ context: string; count: number }>;
  emptyQueries: Array<{ query: string; attempts: number }>;
  totalSearches: number;
  totalEmptyQueries: number;
  uniqueTerms: number;
  languagesTotal: number;
};

const SEARCH_MODES: string[] = ["list", "app", "widget", "create"];

export async function getAnalyticsSummary(limit = 10): Promise<AnalyticsSummary> {
  const [topTermsGroup, languageUsage, contextUsage, emptyQueries, totalSearches, totalEmptyQueries] = await Promise.all([
    prisma.searchLog.groupBy({
      by: ["termId"],
      where: { termId: { not: null }, mode: { in: SEARCH_MODES } },
      _count: { _all: true },
    }),
    prisma.searchLog.groupBy({
      by: ["language"],
      where: { mode: { in: SEARCH_MODES } },
      _count: { _all: true },
    }),
    prisma.searchLog.groupBy({
      by: ["context"],
      where: { mode: { in: SEARCH_MODES } },
      _count: { _all: true },
    }),
    prisma.searchLog.groupBy({
      by: ["query"],
      where: { termId: null, mode: { in: SEARCH_MODES } },
      _count: { _all: true },
    }),
    prisma.searchLog.count({ where: { mode: { in: SEARCH_MODES } } }),
    prisma.searchLog.count({ where: { termId: null, mode: { in: SEARCH_MODES } } }),
  ]);

  const ids = topTermsGroup.map((entry) => entry.termId).filter((value): value is number => value !== null);
  const terms = ids.length
    ? await prisma.term.findMany({ where: { id: { in: ids } }, select: { id: true, term: true } })
    : [];
  const lookup = new Map(terms.map((term) => [term.id, term.term]));

  const getCount = (entry: { _count?: { _all?: number } | number | null }) => {
    if (typeof entry._count === 'number') return entry._count;
    if (entry._count && typeof entry._count === 'object') return entry._count._all ?? 0;
    return 0;
  };

  const topTermsSorted = [...topTermsGroup].sort((a, b) => getCount(b) - getCount(a));
  const topTerms = topTermsSorted
    .filter((entry): entry is typeof entry & { termId: number } => entry.termId !== null)
    .slice(0, limit)
    .map((entry) => ({
      termId: entry.termId,
      term: lookup.get(entry.termId) ?? "Desconocido",
      hits: getCount(entry),
    }));

  const languagesSorted = [...languageUsage].sort((a, b) => getCount(b) - getCount(a));
  const languages = languagesSorted
    .slice(0, limit)
    .map((entry) => ({ language: entry.language, count: getCount(entry) }));

  const contextsSorted = [...contextUsage].sort((a, b) => getCount(b) - getCount(a));
  const contexts = contextsSorted
    .slice(0, limit)
    .map((entry) => ({ context: entry.context, count: getCount(entry) }));

  const emptySorted = [...emptyQueries].sort((a, b) => getCount(b) - getCount(a));
  const empty = emptySorted
    .slice(0, limit)
    .map((entry) => ({ query: entry.query, attempts: getCount(entry) }));

  return {
    topTerms,
    languages,
    contexts,
    emptyQueries: empty,
    totalSearches,
    totalEmptyQueries,
    uniqueTerms: topTermsGroup.length,
    languagesTotal: languageUsage.length,
  };
}
