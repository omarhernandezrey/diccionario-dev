"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { TermDTO } from "@/types/term";

type SortOption = "term_asc" | "term_desc" | "recent" | "oldest";

const categories = ["all", "frontend", "backend", "database", "devops", "general"] as const;

const pageSizes = [12, 24, 48];
const RECENT_KEY = "recent_terms_explorer";

type Filters = {
  q: string;
  tag: string;
  category: string;
  sort: SortOption;
  page: number;
  pageSize: number;
};

type TermsResponse = {
  items: TermDTO[];
  meta?: {
    total: number;
    totalPages: number;
    page: number;
    pageSize: number;
  };
};

export default function TermsExplorer() {
  const { t } = useI18n();
  const [filters, setFilters] = useState<Filters>({
    q: "",
    tag: "",
    category: "all",
    sort: "term_asc",
    page: 1,
    pageSize: 12,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState<TermsResponse>({ items: [], meta: { total: 0, totalPages: 1, page: 1, pageSize: 12 } });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebounce(filters.q, 400);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setRecentSearches(parsed.filter(Boolean));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((term) => term !== trimmed)].slice(0, 6);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, [debouncedQuery]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setErrorMsg("");
    const params = new URLSearchParams({
      page: String(filters.page),
      pageSize: String(filters.pageSize),
      sort: filters.sort,
    });
    if (filters.q.trim()) params.set("q", filters.q.trim());
    if (filters.tag.trim()) params.set("tag", filters.tag.trim());
    if (filters.category !== "all") params.set("category", filters.category);

    fetch(`/api/terms?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        setData(payload);
        setStatus("idle");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setStatus("error");
        setErrorMsg(error?.message || "");
        setData({ items: [], meta: { total: 0, totalPages: 1, page: 1, pageSize: filters.pageSize } });
      });

    return () => controller.abort();
  }, [filters]);

  const meta = data.meta ?? { total: 0, totalPages: 1, page: filters.page, pageSize: filters.pageSize };
  const statusMessage =
    status === "loading"
      ? t("state.loading")
      : status === "error"
        ? errorMsg || t("state.error")
        : data.items.length
          ? t("state.success", { count: meta.total ?? data.items.length })
          : t("state.empty");

  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: "term_asc", label: t("sortOptions.term_asc") },
    { value: "term_desc", label: t("sortOptions.term_desc") },
    { value: "recent", label: t("sortOptions.recent") },
    { value: "oldest", label: t("sortOptions.oldest") },
  ];

  const totalPages = Math.max(1, meta.totalPages || Math.ceil((meta.total || 0) / filters.pageSize));

  function updateFilters(partial: Partial<Filters>, resetPage = true) {
    setFilters((prev) => ({
      ...prev,
      ...partial,
      page: resetPage ? 1 : partial.page ?? prev.page,
    }));
  }

  function handlePageChange(direction: "next" | "prev") {
    setFilters((prev) => {
      const nextPage = direction === "next" ? Math.min(totalPages, prev.page + 1) : Math.max(1, prev.page - 1);
      return { ...prev, page: nextPage };
    });
  }

  function resetFilters() {
    setFilters({ q: "", tag: "", category: "all", sort: "term_asc", page: 1, pageSize: 12 });
  }

  return (
    <section id="explorer" className="glass-panel space-y-6 rounded-3xl border border-neo-border bg-neo-surface p-5 sm:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="badge-pill">{t("filters.heading")}</p>
          <h2 className="text-2xl font-semibold text-neo-text-primary sm:text-3xl">{t("explorer.title")}</h2>
          <p className="text-sm text-neo-text-secondary">{t("explorer.description")}</p>
        </div>
        <span className="rounded-full border border-neo-border px-4 py-2 text-xs text-neo-text-secondary" aria-live="polite">
          {statusMessage}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <label className="text-sm text-neo-text-secondary" htmlFor="explorer-search">
            {t("search.ariaLabel")}
          </label>
          <input
            id="explorer-search"
            className="w-full rounded-2xl border border-neo-border bg-transparent px-4 py-3 text-neo-text-primary placeholder:text-neo-text-secondary focus:border-accent-secondary focus:outline-none"
            value={filters.q}
            onChange={(event) => updateFilters({ q: event.target.value })}
            placeholder={t("search.placeholder")}
          />
          {recentSearches.length ? (
            <div className="flex flex-wrap gap-2 text-xs text-neo-text-secondary">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="rounded-full border border-neo-border bg-neo-surface px-3 py-1 transition hover:border-accent-secondary hover:text-neo-text-primary"
                  onClick={() => updateFilters({ q: term })}
                >
                  #{term}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="space-y-4">
          <label className="text-sm text-neo-text-secondary" htmlFor="explorer-tag">
            {t("filters.tag")}
          </label>
          <input
            id="explorer-tag"
            className="w-full rounded-2xl border border-neo-border bg-transparent px-4 py-3 text-neo-text-primary placeholder:text-neo-text-secondary focus:border-accent-secondary focus:outline-none"
            value={filters.tag}
            onChange={(event) => updateFilters({ tag: event.target.value })}
            placeholder="#react, css-grid..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="toolbar" aria-label={t("filters.category")}>
        {categories.map((categoryId) => {
          const active = filters.category === categoryId;
          return (
            <button
              key={categoryId}
              type="button"
              onClick={() => updateFilters({ category: categoryId })}
              className={`rounded-full px-4 py-1.5 text-sm transition ${active ? "bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold" : "border border-neo-border bg-neo-card text-neo-text-secondary"
                }`}
              aria-pressed={active}
            >
              {t(`categories.${categoryId}`)}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm text-neo-text-secondary" htmlFor="sort-select">
            {t("filters.sort")}
          </label>
          <select
            id="sort-select"
            className="w-full rounded-2xl border border-neo-border bg-neo-card px-4 py-3 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
            value={filters.sort}
            onChange={(event) => updateFilters({ sort: event.target.value as SortOption })}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-neo-card text-neo-text-primary">
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-neo-text-secondary" htmlFor="page-size-select">
            {t("filters.perPage")}
          </label>
          <select
            id="page-size-select"
            className="w-full rounded-2xl border border-neo-border bg-neo-card px-4 py-3 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
            value={filters.pageSize}
            onChange={(event) => updateFilters({ pageSize: Number(event.target.value) })}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size} className="bg-neo-card text-neo-text-primary">
                {size}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end justify-end">
          <button type="button" className="btn-ghost w-full text-center" onClick={resetFilters}>
            {t("filters.reset")}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {status === "loading" ? (
          <CardSkeleton />
        ) : data.items.length ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {data.items.map((term) => {
              const meaning = term.meaningEs ?? term.meaning ?? term.meaningEn ?? "";
              const howCopy = term.howEs ?? term.how ?? term.howEn ?? "";
              const translation = term.translation || term.titleEs || term.term;
              return (
                <article key={term.id} className="rounded-3xl border border-neo-border bg-neo-card p-5 shadow-glow-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-neo-text-primary">{term.term}</h3>
                      <p className="text-sm text-neo-text-secondary">{translation}</p>
                    </div>
                    <span className="rounded-full bg-neo-surface px-3 py-1 text-xs text-neo-text-secondary">{term.category}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-neo-text-primary/80">{meaning}</p>
                  <dl className="mt-4 space-y-2 text-xs text-neo-text-secondary">
                    {term.aliases?.length ? (
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-neo-text-secondary/70">{t("terms.aliases")}</dt>
                        <dd className="text-neo-text-primary/80">{term.aliases.slice(0, 4).join(", ")}</dd>
                      </div>
                    ) : null}
                    {term.tags?.length ? (
                      <div>
                        <dt className="font-semibold uppercase tracking-wide text-neo-text-secondary/70">{t("terms.tags")}</dt>
                        <dd className="text-neo-text-primary/80">{term.tags.slice(0, 4).join(", ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <div className="mt-4 rounded-2xl border border-neo-border bg-neo-surface p-3">
                    <p className="text-xs uppercase tracking-wide text-neo-text-secondary/70">{t("terms.how")}</p>
                    <p className="line-clamp-3 text-xs text-neo-text-primary/80">{howCopy}</p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={term.slug ? `/term/${encodeURIComponent(term.slug)}` : `/term/${encodeURIComponent(term.term)}`}
                      className="btn-ghost text-xs"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-neo-border px-4 py-8 text-center text-neo-text-secondary">{status === "error" ? errorMsg || t("state.error") : t("state.empty")}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neo-text-secondary">{t("pagination.page", { page: filters.page, pages: totalPages })}</p>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => handlePageChange("prev")}
            disabled={filters.page === 1}
            aria-disabled={filters.page === 1}
          >
            {t("pagination.prev")}
          </button>
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={() => handlePageChange("next")}
            disabled={filters.page === totalPages}
            aria-disabled={filters.page === totalPages}
          >
            {t("pagination.next")}
          </button>
        </div>
      </div>
    </section>
  );
}

function CardSkeleton() {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-3xl border border-neo-border bg-neo-card p-5">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 rounded-full bg-neo-surface" />
            <div className="h-4 w-12 rounded-full bg-neo-surface" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded-full bg-neo-surface" />
            <div className="h-3 w-4/5 rounded-full bg-neo-surface" />
            <div className="h-3 w-2/3 rounded-full bg-neo-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
