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

export async function getAnalyticsSummary(limit = 10): Promise<AnalyticsSummary> {
  const [topTermsGroup, languageUsage, contextUsage, emptyQueries, totalSearches, totalEmptyQueries] = await Promise.all([
    prisma.searchLog.groupBy({
      by: ["termId"],
      where: { termId: { not: null } },
      _count: { _all: true },
    }),
    prisma.searchLog.groupBy({
      by: ["language"],
      _count: { _all: true },
    }),
    prisma.searchLog.groupBy({
      by: ["context"],
      _count: { _all: true },
    }),
    prisma.searchLog.groupBy({
      by: ["query"],
      where: { termId: null },
      _count: { _all: true },
    }),
    prisma.searchLog.count(),
    prisma.searchLog.count({ where: { termId: null } }),
  ]);

  const ids = topTermsGroup.map((entry) => entry.termId).filter((value): value is number => value !== null);
  const terms = ids.length
    ? await prisma.term.findMany({ where: { id: { in: ids } }, select: { id: true, term: true } })
    : [];
  const lookup = new Map(terms.map((term) => [term.id, term.term]));

  const sortByCountDesc = <T extends { _count?: { _all?: number } | null }>(arr: T[]) =>
    [...arr].sort((a, b) => (b._count?._all ?? 0) - (a._count?._all ?? 0));

  const topTerms = sortByCountDesc(topTermsGroup)
    .filter((entry): entry is typeof entry & { termId: number } => entry.termId !== null)
    .slice(0, limit)
    .map((entry) => ({
      termId: entry.termId,
      term: lookup.get(entry.termId) ?? "Desconocido",
      hits: entry._count?._all ?? 0,
    }));

  const languages = sortByCountDesc(languageUsage)
    .slice(0, limit)
    .map((entry) => ({ language: entry.language, count: entry._count?._all ?? 0 }));

  const contexts = sortByCountDesc(contextUsage)
    .slice(0, limit)
    .map((entry) => ({ context: entry.context, count: entry._count?._all ?? 0 }));

  const empty = sortByCountDesc(emptyQueries)
    .slice(0, limit)
    .map((entry) => ({ query: entry.query, attempts: entry._count?._all ?? 0 }));

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
