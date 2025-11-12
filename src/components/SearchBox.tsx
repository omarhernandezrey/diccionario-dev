"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import type { TermDTO } from "@/types/term";

const quickTerms = ["fetch", "useState", "REST", "JOIN", "JWT", "Docker"];
type Status = "idle" | "loading" | "ready" | "empty" | "error";

export default function SearchBox() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TermDTO[]>([]);
  const [selected, setSelected] = useState<TermDTO | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const debounced = useDebounce(search, 220);

  const hasQuery = debounced.trim().length > 1;
  const statusMessage = useMemo(() => {
    switch (status) {
      case "idle":
        return t("search.helper");
      case "loading":
        return t("state.loading");
      case "empty":
        return t("search.empty");
      case "error":
        return errorMsg || t("state.error");
      case "ready":
        return t("state.success", { count: items.length });
      default:
        return "";
    }
  }, [status, errorMsg, t, items.length]);

  useEffect(() => {
    if (!hasQuery) {
      setItems([]);
      setSelected(null);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    setErrorMsg("");
    const params = new URLSearchParams({
      q: debounced,
      pageSize: "12",
      sort: "term_asc",
    });
    fetch(`/api/terms?${params.toString()}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const results: TermDTO[] = data?.items || [];
        setItems(results);
        setSelected(results[0] ?? null);
        setStatus(results.length ? "ready" : "empty");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setItems([]);
        setSelected(null);
        setStatus("error");
        setErrorMsg(error?.message || "");
      });
    return () => controller.abort();
  }, [debounced, hasQuery]);

  return (
    <section id="search" className="glass-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="badge-pill">{t("search.title")}</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">{t("search.subtitle")}</h2>
          <p className="text-sm text-white/70">{t("search.overview")}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <label htmlFor="term-search" className="sr-only">
          {t("search.ariaLabel")}
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-accent-secondary">
          <span aria-hidden className="text-lg text-white/60">
            🔍
          </span>
          <input
            id="term-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.ariaLabel")}
            className="w-full bg-transparent text-base text-white placeholder:text-white/40 focus:outline-none"
          />
          {status === "loading" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : null}
        </div>
        <div className="flex flex-wrap gap-2 text-sm" aria-label={t("search.quickFilters")}>
          {quickTerms.map((term) => (
            <button
              key={term}
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 transition hover:bg-white/10 hover:text-white"
              onClick={() => setSearch(term)}
            >
              #{term}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card h-full rounded-3xl border border-white/10 bg-ink-800/80 p-4">
          <header className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">{t("search.results")}</h3>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70" aria-live="polite">
              {statusMessage}
            </span>
          </header>
          <div className="mt-4 max-h-[360px] overflow-y-auto pr-2">
            {status === "loading" ? (
              <SkeletonList />
            ) : items.length ? (
              <ul className="space-y-2">
                {items.map((term) => {
                  const active = selected?.id === term.id;
                  return (
                    <li key={term.id}>
                      <button
                        type="button"
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          active
                            ? "border-accent-secondary/70 bg-white/10 shadow-glow-card"
                            : "border-white/5 bg-white/0 hover:border-white/20 hover:bg-white/[0.03]"
                        }`}
                        onClick={() => setSelected(term)}
                        aria-pressed={active}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-white">{term.term}</p>
                            <p className="text-xs uppercase tracking-wide text-white/50">{term.translation}</p>
                          </div>
                          <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-white/70">{term.category}</span>
                        </div>
                        {term.aliases?.length ? (
                          <p className="mt-2 line-clamp-1 text-xs text-white/60">
                            Aliases: <span className="text-white/80">{term.aliases.slice(0, 3).join(", ")}</span>
                          </p>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/60">{statusMessage}</p>
            )}
          </div>
        </div>

        <div className="glass-card h-full rounded-3xl border border-white/10 bg-ink-800/60 p-5">
          {selected ? <ResultPreview term={selected} /> : <Placeholder copy={t("search.helper")} />}
        </div>
      </div>
    </section>
  );
}

function ResultPreview({ term }: { term: TermDTO }) {
  const { t } = useI18n();
  return (
    <article className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">{term.term}</h3>
          <p className="text-sm text-white/70">{term.translation}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">{term.category}</span>
      </div>
      <p className="text-white/80">{term.meaning}</p>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-white/60">{t("terms.what")}</p>
        <p className="text-sm text-white">{term.what}</p>
      </div>
      <div className="flex-1 rounded-2xl border border-white/10 bg-ink-900/60 p-4">
        <p className="text-xs uppercase tracking-wide text-white/60">{t("terms.how")}</p>
        <CodeBlock code={term.how} />
      </div>
      {term.examples?.length ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-white/60">{t("terms.examples")}</p>
          <div className="space-y-2">
            {term.examples.map((example, index) => (
              <div key={`${example.title}-${index}`} className="rounded-2xl border border-white/10 bg-ink-900/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{example.title || `Snippet #${index + 1}`}</p>
                    {example.note ? <p className="text-xs text-white/60">{example.note}</p> : null}
                  </div>
                  <CopyButton code={example.code} />
                </div>
                <CodeBlock code={example.code} />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Placeholder({ copy }: { copy: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
      <p>{copy}</p>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const normalized = code?.replace(/\r\n/g, "\n") || "";
  const lines = normalized.split("\n");
  return (
    <pre className="mt-3 max-h-48 overflow-auto rounded-2xl bg-ink-900/80 p-4 text-xs text-white/80">
      {lines.map((line, index) => (
        <code key={`${index}-${line.slice(0, 8)}`} className="flex gap-3 whitespace-pre">
          <span className="w-6 text-right text-white/30">{String(index + 1).padStart(2, "0")}</span>
          <span className="flex-1">{line || "\u00A0"}</span>
        </code>
      ))}
    </pre>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        copied ? "border-accent-emerald/60 text-accent-emerald" : "border-white/20 text-white/70 hover:border-white/40"
      }`}
      aria-live="polite"
    >
      {copied ? t("common.copied") : t("common.copy")}
    </button>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="animate-pulse rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="h-4 w-28 rounded-full bg-white/20" />
            <span className="h-4 w-12 rounded-full bg-white/10" />
          </div>
          <div className="mt-2 h-3 w-32 rounded-full bg-white/10" />
        </li>
      ))}
    </ul>
  );
}

function useDebounce<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}
