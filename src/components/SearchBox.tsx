"use client";

import { useEffect, useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useI18n } from "@/lib/i18n";
import type { TermDTO } from "@/types/term";

const quickTerms = ["fetch", "useState", "REST", "JOIN", "JWT", "Docker"];
const contexts = [
  { id: "dictionary", label: "Diccionario" },
  { id: "interview", label: "Entrevista" },
  { id: "bug", label: "Debug" },
  { id: "translate", label: "Traducción" },
];
const contextLabels = Object.fromEntries(contexts.map((ctx) => [ctx.id, ctx.label]));
const modeLabels: Record<string, string> = {
  list: "Concepto",
  code: "Código",
  question: "Pregunta",
};
const languageLabels: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  css: "CSS",
  py: "Python",
  java: "Java",
  csharp: "C#",
  go: "Go",
  php: "PHP",
  ruby: "Ruby",
  rust: "Rust",
  cpp: "C++",
  swift: "Swift",
  kotlin: "Kotlin",
};
const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Alta",
};
type Status = "idle" | "loading" | "ready" | "empty" | "error";

export default function SearchBox() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TermDTO[]>([]);
  const [selected, setSelected] = useState<TermDTO | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [context, setContext] = useState<string>("dictionary");
  const [modeOverride, setModeOverride] = useState<string | null>(null);
  const debounced = useDebounce(search, 220);
  const detectedMode = useMemo(() => detectInputMode(debounced), [debounced]);
  const effectiveMode = modeOverride ?? detectedMode;

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
      context,
      mode: effectiveMode,
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
  }, [debounced, hasQuery, context, effectiveMode]);

  return (
    <section id="search" className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-card space-y-4">
      <div className="space-y-3">
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
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {contexts.map((ctx) => {
            const active = context === ctx.id;
            return (
              <button
                key={ctx.id}
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  active ? "bg-white text-ink-900 shadow" : "border border-white/15 text-white/70 hover:bg-white/10"
                }`}
                aria-pressed={active}
                onClick={() => setContext(ctx.id)}
              >
                {ctx.label}
              </button>
            );
          })}
          <span className="text-xs text-white/60">
            Modo:{" "}
            <button
              type="button"
              className="underline-offset-4 hover:underline"
              onClick={() =>
                setModeOverride((current) => {
                  if (current === null) return detectedMode;
                  const modes = Object.keys(modeLabels);
                  const idx = modes.indexOf(current);
                  return modes[(idx + 1) % modes.length];
                })
              }
            >
              {modeLabels[effectiveMode]}
            </button>
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <header className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">{t("search.results")}</h3>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70" aria-live="polite">
              {statusMessage}
            </span>
          </header>
          <div className="max-h-[360px] overflow-y-auto pr-2 scroll-silent">
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

        <div className="flex-1">
          {selected ? <ResultPreview term={selected} /> : <Placeholder copy={t("search.helper")} />}
        </div>
      </div>
    </section>
  );
}

function ResultPreview({ term }: { term: TermDTO }) {
  const { t } = useI18n();
  const [variantLang, setVariantLang] = useState<string | null>(term.variants?.[0]?.language ?? null);
  useEffect(() => {
    setVariantLang(term.variants?.[0]?.language ?? null);
  }, [term.id, term.variants]);
  const variantOptions = term.variants ?? [];
  const activeVariant =
    (variantLang ? variantOptions.find((variant) => variant.language === variantLang) : undefined) ??
    variantOptions[0] ??
    null;
  const meaningEs = term.meaningEs ?? term.meaning;
  const meaningEn = term.meaningEn ?? term.meaning;
  const whatEs = term.whatEs ?? term.what;
  const whatEn = term.whatEn ?? term.what;
  const snippetCode = activeVariant?.snippet ?? term.howEs ?? term.how;
  const snippetLabel = activeVariant
    ? `${languageLabels[activeVariant.language] ?? activeVariant.language}`
    : t("terms.how");
  const aliasList = term.aliases ?? [];
  const tags = term.tags ?? [];
  const useCases = term.useCases ?? [];
  const faqs = term.faqs ?? [];
  const exercises = term.exercises ?? [];
  return (
    <article className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-white">{term.term}</h3>
            <p className="text-sm text-white/70">{term.translation}</p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
            {term.category}
          </span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Traducción literal</p>
          <p className="text-lg font-semibold text-white">{term.translation}</p>
          {aliasList.length ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
              {aliasList.map((alias) => (
                <span key={alias} className="rounded-full border border-white/15 px-2 py-0.5">
                  {alias}
                </span>
              ))}
            </div>
          ) : null}
          {tags.length ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/40">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Significado (ES)</p>
            <p className="mt-2 text-sm text-white">{meaningEs}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Meaning (EN)</p>
            <p className="mt-2 text-sm text-white">{meaningEn}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">{t("terms.what")} (ES)</p>
            <p className="text-sm text-white">{whatEs}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">{t("terms.what")} (EN)</p>
            <p className="text-sm text-white">{whatEn}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-white/60">{t("terms.how")}</p>
            {variantOptions.length ? (
              <div className="flex flex-wrap gap-2 text-xs">
                {variantOptions.map((variant) => {
                  const active = variant.language === (variantLang ?? variantOptions[0]?.language);
                  return (
                    <button
                      key={`${term.id}-${variant.language}`}
                      type="button"
                      className={`rounded-full px-3 py-1 font-semibold transition ${
                        active ? "bg-white text-ink-900" : "border border-white/20 text-white/60 hover:bg-white/10"
                      }`}
                      onClick={() => setVariantLang(variant.language)}
                    >
                      {languageLabels[variant.language] ?? variant.language.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <CodeBlock code={snippetCode} label={snippetLabel} />
          {activeVariant?.notes ? <p className="mt-2 text-xs text-white/60">{activeVariant.notes}</p> : null}
        </div>

        {term.examples?.length ? (
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-white/60">{t("terms.examples")}</p>
            <div className="space-y-2">
              {term.examples.map((example, index) => {
                const title =
                  example.titleEs || example.titleEn || example.title || `${t("terms.examples")} #${index + 1}`;
                const note = example.noteEs || example.noteEn || example.note;
                return (
                  <div key={`${title}-${index}`} className="rounded-2xl border border-white/10 bg-ink-900/60 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      {note ? <p className="text-xs text-white/60">{note}</p> : null}
                    </div>
                    <CodeBlock code={example.code} label={title} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <aside className="w-full space-y-4 lg:w-80">
        {useCases.length ? (
          <section className="rounded-2xl border border-white/10 bg-ink-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-2">Casos de uso</p>
            <div className="space-y-3">
              {useCases.slice(0, 3).map((useCase) => (
                <div key={`${term.id}-usecase-${useCase.context}-${useCase.id ?? ""}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="font-semibold">{contextLabels[useCase.context] ?? useCase.context}</span>
                  </div>
                  <p className="mt-2 text-sm text-white">{useCase.summary}</p>
                  {useCase.steps?.length ? (
                    <ul className="mt-2 space-y-1 text-xs text-white/70">
                      {useCase.steps.slice(0, 3).map((step, index) => (
                        <li key={`${term.id}-step-${useCase.context}-${index}`} className="flex gap-2">
                          <span className="text-white/40">{index + 1}.</span>
                          <span>{step.es || step.en}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {useCase.tips ? <p className="mt-2 text-xs text-white/50">{useCase.tips}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {faqs.length ? (
          <section className="rounded-2xl border border-white/10 bg-ink-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-2">FAQs</p>
            <div className="space-y-3">
              {faqs.slice(0, 2).map((faq) => (
                <details
                  key={`${term.id}-faq-${faq.id ?? faq.questionEs}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <summary className="cursor-pointer text-sm font-semibold text-white">{faq.questionEs}</summary>
                  <div className="mt-2 text-sm text-white/80">{faq.answerEs}</div>
                  {faq.answerEn ? <div className="mt-1 text-xs text-white/60">{faq.answerEn}</div> : null}
                  {faq.snippet ? <CodeBlock code={faq.snippet} label={faq.category ?? "FAQ"} /> : null}
                  {faq.howToExplain ? (
                    <p className="mt-2 text-xs text-white/50">{faq.howToExplain}</p>
                  ) : null}
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {exercises.length ? (
          <section className="rounded-2xl border border-white/10 bg-ink-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60 mb-2">Ejercicios</p>
            <div className="space-y-3">
              {exercises.slice(0, 2).map((exercise) => {
                const difficultyLabel = difficultyLabels[exercise.difficulty as keyof typeof difficultyLabels] ?? exercise.difficulty;
                const solution = exercise.solutions?.[0];
                return (
                  <div key={`${term.id}-exercise-${exercise.id ?? exercise.titleEs}`} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span className="font-semibold text-white">{exercise.titleEs}</span>
                      <span>{difficultyLabel}</span>
                    </div>
                    <p className="mt-2 text-xs text-white/70">{exercise.promptEs}</p>
                    {solution ? (
                      <CodeBlock
                        code={solution.code}
                        label={`${languageLabels[solution.language] ?? solution.language.toUpperCase()} · ${difficultyLabel}`}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </aside>
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

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const normalized = (code ?? "").trimEnd().replace(/\r\n/g, "\n") || "// Sin código";
  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#050915] shadow-inner">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-2 text-[11px] text-white/60">
        <div className="flex items-center gap-3">
          <span className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </span>
          <span className="uppercase tracking-wide opacity-70">{label || "Snippet"}</span>
        </div>
        <CopyButton code={normalized} />
      </div>
      <SyntaxHighlighter
        language="tsx"
        style={dracula}
        customStyle={{
          borderRadius: 0,
          padding: "1rem 1.25rem",
          maxHeight: "11rem",
          overflow: "auto",
          fontSize: "0.78rem",
          backgroundColor: "transparent",
          margin: 0,
        }}
        codeTagProps={{
          style: {
            fontFamily: "JetBrains Mono, SFMono-Regular, Menlo, monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          },
        }}
        lineNumberStyle={{
          minWidth: "2.5ch",
          paddingRight: "0.75rem",
          textAlign: "right",
          color: "rgba(255,255,255,0.35)",
        }}
        lineProps={{
          style: {
            display: "block",
            paddingLeft: "0.85rem",
            textIndent: "-0.85rem",
          },
        }}
        showLineNumbers
        wrapLines
        wrapLongLines
        className="scroll-silent"
      >
        {normalized}
      </SyntaxHighlighter>
    </div>
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

function detectInputMode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "list";
  if (/\n/.test(trimmed) || /[{<>=;]/.test(trimmed) || trimmed.includes("function") || trimmed.includes("const ")) {
    return "code";
  }
  if (trimmed.endsWith("?") || /^¿/.test(trimmed) || /(how|why|qué|por qué|como)\b/i.test(trimmed)) {
    return "question";
  }
  return "list";
}
function useDebounce<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}
