"use client";

import { useEffect, useMemo, useState, type ClipboardEvent } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useI18n } from "@/lib/i18n";
import type { TermDTO, TermVariantDTO } from "@/types/term";
import type { StructuralTranslationResult } from "@/types/translate";

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
const skillLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};
type Status = "idle" | "loading" | "ready" | "empty" | "error";

export default function SearchBox() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TermDTO[]>([]);
  const [selected, setSelected] = useState<TermDTO | null>(null);
  const [translationResult, setTranslationResult] = useState<StructuralTranslationResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [context, setContext] = useState<string>("dictionary");
  const [modeOverride, setModeOverride] = useState<string | null>(null);
  const [clipboardHint, setClipboardHint] = useState<string | null>(null);
  const debounced = useDebounce(search, 220);
  const detectedMode = useMemo(() => detectInputMode(debounced), [debounced]);
  const effectiveMode = modeOverride ?? detectedMode;

  const hasQuery = debounced.trim().length > 1;
  const statusMessage = useMemo(() => {
    if (context === "translate") {
      switch (status) {
        case "idle":
          return "Pega un fragmento para traducirlo.";
        case "loading":
          return t("state.loading");
        case "empty":
          return t("search.empty");
        case "error":
          return errorMsg || t("state.error");
        case "ready": {
          if (!translationResult) return t("search.empty");
          if (translationResult.fallbackApplied) {
            return translationResult.segments.length ? "Modo básico aplicado" : "No hay texto para traducir";
          }
          const total = (translationResult.replacedStrings ?? 0) + (translationResult.replacedComments ?? 0);
          return total ? `${total} segmentos traducidos` : "No se detectaron cadenas";
        }
        default:
          return "";
      }
    }
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
  }, [status, errorMsg, t, items.length, context, translationResult]);

  useEffect(() => {
    if (!clipboardHint) return;
    const timer = window.setTimeout(() => setClipboardHint(null), 3800);
    return () => window.clearTimeout(timer);
  }, [clipboardHint]);

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData?.getData("text") ?? "";
    if (!pasted) return;
    if (shouldTriggerStructuralTranslation(pasted)) {
      event.preventDefault();
      setSearch(pasted);
      setContext("translate");
      setModeOverride("code");
      setClipboardHint("Detecté un bloque de código y activé la traducción estructural.");
    }
  };

  useEffect(() => {
    if (!hasQuery) {
      setItems([]);
      setSelected(null);
      setTranslationResult(null);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    setErrorMsg("");
    if (context === "translate") {
      setItems([]);
      setSelected(null);
      setTranslationResult(null);
      fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: debounced }),
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((payload) => {
          setTranslationResult(payload?.result ?? null);
          setStatus(payload?.result ? "ready" : "empty");
        })
        .catch((error) => {
          if (error.name === "AbortError") return;
          setTranslationResult(null);
          setStatus("error");
          setErrorMsg(error?.message || "");
        });
      return () => controller.abort();
    }
    setTranslationResult(null);
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
            onPaste={handlePaste}
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
        {clipboardHint ? <p className="text-sm font-semibold text-accent-secondary">{clipboardHint}</p> : null}
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

      {context === "translate" ? (
        <TranslationPanel input={debounced} status={status} helper={statusMessage} result={translationResult} />
      ) : (
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
            {selected ? <ResultPreview term={selected} activeContext={context} /> : <Placeholder copy={t("search.helper")} />}
          </div>
        </div>
      )}
    </section>
  );
}

function ResultPreview({ term, activeContext }: { term: TermDTO; activeContext: string }) {
  const { t } = useI18n();
  const [variantLang, setVariantLang] = useState<string | null>(term.variants?.[0]?.language ?? null);
  const useCases = term.useCases ?? [];
  const availableUseCaseContexts = useMemo(
    () => Array.from(new Set(useCases.map((useCase) => useCase.context))),
    [useCases],
  );
  const defaultUseCaseContext = useMemo(() => {
    if (!availableUseCaseContexts.length) return null;
    return availableUseCaseContexts.includes(activeContext) ? activeContext : availableUseCaseContexts[0];
  }, [availableUseCaseContexts, activeContext]);
  const [useCaseContext, setUseCaseContext] = useState<string | null>(defaultUseCaseContext);
  useEffect(() => {
    setVariantLang(term.variants?.[0]?.language ?? null);
  }, [term.id, term.variants]);
  useEffect(() => {
    setUseCaseContext(defaultUseCaseContext);
  }, [defaultUseCaseContext, term.id]);
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
  const faqs = term.faqs ?? [];
  const exercises = term.exercises ?? [];
  const filteredUseCases = useCaseContext ? useCases.filter((useCase) => useCase.context === useCaseContext) : useCases;
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

        <SelectorPanel
          variantOptions={variantOptions}
          variantLang={variantLang}
          onVariantChange={setVariantLang}
          activeVariant={activeVariant}
          snippetLabel={snippetLabel}
          snippetCode={snippetCode}
        />

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
            <header className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-white/60">Casos de uso</p>
              {availableUseCaseContexts.length > 1 ? (
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {availableUseCaseContexts.map((ctx) => {
                    const active = ctx === useCaseContext;
                    return (
                      <button
                        key={`${term.id}-ctx-${ctx}`}
                        type="button"
                        className={`rounded-full px-2.5 py-0.5 font-semibold transition ${
                          active ? "bg-white text-ink-900" : "border border-white/20 text-white/60 hover:bg-white/10"
                        }`}
                        onClick={() => setUseCaseContext(ctx)}
                      >
                        {contextLabels[ctx] ?? ctx}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </header>
            <div className="space-y-3 pt-3">
              {filteredUseCases.length ? (
                filteredUseCases.slice(0, 3).map((useCase) => (
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
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 p-4 text-xs text-white/60">
                  No tenemos guías para este contexto todavía.
                </p>
              )}
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

type SelectorPanelProps = {
  variantOptions: TermVariantDTO[];
  variantLang: string | null;
  onVariantChange: (language: string) => void;
  activeVariant: TermVariantDTO | null;
  snippetCode: string;
  snippetLabel: string;
};

function SelectorPanel({
  variantOptions = [],
  variantLang,
  onVariantChange,
  activeVariant,
  snippetCode,
  snippetLabel,
}: SelectorPanelProps) {
  const { t } = useI18n();
  const hasVariants = Boolean(variantOptions.length);
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide text-white/60">{t("terms.how")}</p>
        {activeVariant?.level ? (
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-0.5 text-[11px] uppercase tracking-wide text-white/60">
            {skillLabels[activeVariant.level] ?? activeVariant.level}
          </span>
        ) : null}
      </div>
      {hasVariants ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {variantOptions.map((variant) => {
            const active = variant.language === (variantLang ?? variantOptions[0]?.language);
            return (
              <button
                key={`variant-${variant.language}`}
                type="button"
                className={`rounded-full px-3 py-1 font-semibold transition ${
                  active ? "bg-white text-ink-900" : "border border-white/20 text-white/60 hover:bg-white/10"
                }`}
                onClick={() => onVariantChange(variant.language)}
              >
                {languageLabels[variant.language] ?? variant.language.toUpperCase()}
              </button>
            );
          })}
        </div>
      ) : null}
      <CodeBlock code={snippetCode} label={snippetLabel} />
      {activeVariant?.notes ? <p className="mt-2 text-xs text-white/60">{activeVariant.notes}</p> : null}
    </div>
  );
}

function Placeholder({ copy }: { copy: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
      <p>{copy}</p>
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-accent-danger/30 bg-accent-danger/10 p-6 text-center text-sm text-accent-danger">
      {message}
    </div>
  );
}

function TranslationPanel({
  input,
  status,
  helper,
  result,
}: {
  input: string;
  status: Status;
  helper: string;
  result: StructuralTranslationResult | null;
}) {
  const trimmed = input.trim();
  if (!trimmed) {
    return <Placeholder copy="Pega código o texto técnico para traducirlo al español." />;
  }
  if (status === "loading") {
    return <TranslationSkeleton />;
  }
  if (status === "error") {
    return <ErrorBlock message={helper} />;
  }
  if (!result) {
    return <Placeholder copy={helper} />;
  }
  return (
    <div className="mt-3 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white">Traducción estructural</h3>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">{helper}</span>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Fragmento original</p>
          <CodeBlock code={input} label="Original" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-4">
          <div className="flex items-center justify-between gap-2 text-xs text-white/60">
            <p>Salida en español</p>
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
              {result.fallbackApplied ? "Modo básico" : result.language.toUpperCase()}
            </span>
          </div>
          <CodeBlock code={result.code} label="Traducción" />
        </div>
      </div>
      <TranslationSummary result={result} />
    </div>
  );
}

function TranslationSummary({ result }: { result: StructuralTranslationResult }) {
  const meaningfulSegments = (result.segments || []).filter((segment) => segment.type !== "text");
  const topSegments = meaningfulSegments.slice(0, 4);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wide text-white/60">Resumen</p>
        <dl className="mt-3 grid gap-2 text-sm text-white">
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Cadenas</dt>
            <dd className="font-semibold">{result.replacedStrings}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Comentarios</dt>
            <dd className="font-semibold">{result.replacedComments}</dd>
          </div>
          {result.fallbackApplied ? (
            <p className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-center text-[11px] text-white/70">
              Se activó el modo básico para mantener la estructura.
            </p>
          ) : null}
        </dl>
      </div>
      <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-4">
        <p className="text-xs uppercase tracking-wide text-white/60">Segmentos detectados</p>
        {topSegments.length ? (
          <ul className="mt-3 space-y-2 text-xs text-white/80">
            {topSegments.map((segment, index) => (
              <li key={`${segment.type}-${segment.start}-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span className="font-semibold capitalize">
                    {segment.type === "comment" ? "Comentario" : "Cadena"} #{index + 1}
                  </span>
                  <span>pos {segment.start}-{segment.end}</span>
                </div>
                <p className="mt-2 text-[11px] text-white/50">Original: {truncateSegment(segment.original)}</p>
                <p className="mt-1 text-[11px] text-white">→ {truncateSegment(segment.translated)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-white/60">No encontramos strings ni comentarios en este fragmento.</p>
        )}
      </div>
    </div>
  );
}

function TranslationSkeleton() {
  return (
    <div className="mt-3 space-y-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="h-48 animate-pulse rounded-3xl border border-white/5 bg-white/5" />
      ))}
    </div>
  );
}

function truncateSegment(text: string, limit = 120) {
  const trimmed = text.trim();
  if (trimmed.length <= limit) return trimmed || "—";
  return `${trimmed.slice(0, limit)}…`;
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

function shouldTriggerStructuralTranslation(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 60) return false;
  if (trimmed.includes("\n")) return true;
  if (/[{}/();=<>\[\]]/.test(trimmed)) return true;
  if (/<[a-z][\s\S]*?>/i.test(trimmed)) return true;
  if (/\b(function|class|const|let|def)\b/i.test(trimmed)) return true;
  return false;
}

function useDebounce<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}
