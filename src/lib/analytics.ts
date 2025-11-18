import { prisma } from "@/lib/prisma";

export type AnalyticsSummary = {
  topTerms: Array<{ termId: number; term: string; hits: number }>;
  languages: Array<{ language: string; count: number }>;
  contexts: Array<{ context: string; count: number }>;
  emptyQueries: Array<{ query: string; attempts: number }>;
};

export async function getAnalyticsSummary(limit = 10): Promise<AnalyticsSummary> {
  const [topTermsGroup, languageUsage, contextUsage, emptyQueries] = await Promise.all([
    prisma.searchLog.groupBy({
      by: ["termId"],
      where: { termId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { _all: "desc" } },
      take: limit,
    }),
    prisma.searchLog.groupBy({
      by: ["language"],
      _count: { _all: true },
      orderBy: { _count: { _all: "desc" } },
      take: limit,
    }),
    prisma.searchLog.groupBy({
      by: ["context"],
      _count: { _all: true },
      orderBy: { _count: { _all: "desc" } },
      take: limit,
    }),
    prisma.searchLog.groupBy({
      by: ["query"],
      where: { termId: null },
      _count: { _all: true },
      orderBy: { _count: { _all: "desc" } },
      take: limit,
    }),
  ]);

  const ids = topTermsGroup.map((entry) => entry.termId).filter((value): value is number => value !== null);
  const terms = ids.length
    ? await prisma.term.findMany({ where: { id: { in: ids } }, select: { id: true, term: true } })
    : [];
  const lookup = new Map(terms.map((term) => [term.id, term.term]));

  return {
    topTerms: topTermsGroup
      .filter((entry): entry is typeof entry & { termId: number } => entry.termId !== null)
      .map((entry) => ({
        termId: entry.termId,
        term: lookup.get(entry.termId) ?? "Desconocido",
        hits: entry._count._all,
      })),
    languages: languageUsage.map((entry) => ({ language: entry.language, count: entry._count._all })),
    contexts: contextUsage.map((entry) => ({ context: entry.context, count: entry._count._all })),
    emptyQueries: emptyQueries.map((entry) => ({ query: entry.query, attempts: entry._count._all })),
  };
}
