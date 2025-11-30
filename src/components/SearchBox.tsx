"use client";

import { useEffect, useMemo, useRef, useState, type ClipboardEvent } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useI18n } from "@/lib/i18n";
import type { TermDTO, TermVariantDTO, TermExampleDTO, TermExerciseDTO } from "@/types/term";
import type { StructuralTranslationResult } from "@/types/translate";
import { TbBriefcase, TbMicrophone, TbBug, TbBulb, TbListCheck, TbTarget, TbSparkles } from "react-icons/tb";

type SearchBoxVariant = "dark" | "light";

type SearchBoxProps = {
  variant?: SearchBoxVariant;
};

type SelectorPanelProps = {
  variantOptions: TermVariantDTO[];
  variantLang: string | null;
  onVariantChange: (lang: string) => void;
  activeVariant?: TermVariantDTO;
  snippetCode: string;
  snippetLabel?: string;
};

type ActionToolbarProps = {
  onCopyDefinition: () => void;
  onCopySnippet: () => void;
  onOpenCheatSheet: () => void;
  onGenerateResponse: (lang: "es" | "en") => void;
  hint?: string | null;
  variant?: SearchBoxVariant;
};

const quickTerms = ["fetch", "useState", "REST", "JOIN", "JWT", "Docker"];
const contexts = [
  { id: "dictionary", label: "Diccionario" },
  { id: "interview", label: "Entrevista" },
  { id: "bug", label: "Debug" },
  { id: "translate", label: "Traducción" },
];
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
const skillLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};
type Status = "idle" | "loading" | "ready" | "empty" | "error";

export default function SearchBox({ variant = "dark" }: SearchBoxProps) {
  const { t } = useI18n();
  const isLight = variant === "light";
  const tone = (light: string, dark: string) => (isLight ? light : dark);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<TermDTO[]>([]);
  const [selected, setSelected] = useState<TermDTO | null>(null);
  const [translationResult, setTranslationResult] = useState<StructuralTranslationResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [context, setContext] = useState<string>("dictionary");
  const [modeOverride, setModeOverride] = useState<string | null>(null);
  const [clipboardHint, setClipboardHint] = useState<string | null>(null);
  const [paramsHydrated, setParamsHydrated] = useState(false);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q");
    const contextParam = params.get("context");
    const modeParam = params.get("mode");
    if (qParam) {
      setSearch(qParam);
    }
    if (contextParam && contexts.some((ctx) => ctx.id === contextParam)) {
      setContext(contextParam);
    }
    if (modeParam && modeLabels[modeParam]) {
      setModeOverride(modeParam);
    }
    setParamsHydrated(true);
  }, []);

  useEffect(() => {
    if (!paramsHydrated || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const trimmed = search.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    if (context !== "dictionary") {
      params.set("context", context);
    } else {
      params.delete("context");
    }
    if (modeOverride) {
      params.set("mode", modeOverride);
    } else {
      params.delete("mode");
    }
    const queryString = params.toString();
    const nextUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [search, context, modeOverride, paramsHydrated]);

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
    setItems([]);
    setSelected(null);
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
    <section
      id="search"
      className="space-y-4"
    >
      <div className="space-y-3">
        <label htmlFor="term-search" className="sr-only">
          {t("search.ariaLabel")}
        </label>
        <div
          className={`flex items-center gap-3 rounded-2xl px-4 py-3 focus-within:border-accent-secondary ${tone(
            "border border-neo-border bg-neo-surface",
            "border border-neo-border bg-neo-surface",
          )}`}
        >
          <span aria-hidden className={`text-lg ${tone("text-neo-text-secondary", "text-neo-text-secondary")}`}>
            🔍
          </span>
          <input
            id="term-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onPaste={handlePaste}
            placeholder={t("search.placeholder")}
            aria-label={t("search.ariaLabel")}
            className={`w-full bg-transparent text-base focus:outline-none ${tone(
              "text-neo-text-primary placeholder:text-neo-text-secondary",
              "text-neo-text-primary placeholder:text-neo-text-secondary",
            )}`}
          />
          {status === "loading" ? (
            <span
              className={`h-4 w-4 animate-spin rounded-full border-2 ${tone(
                "border-neo-border border-t-neo-primary",
                "border-neo-border border-t-neo-primary",
              )}`}
            />
          ) : null}
        </div>
        {status !== "loading" && (
          <div className="flex flex-wrap gap-2 text-sm" aria-label={t("search.quickFilters")}>
            {quickTerms.map((term) => (
              <button
                key={term}
                type="button"
                className={`rounded-full border px-3 py-1 transition ${tone(
                  "border-neo-border bg-neo-surface text-neo-text-secondary hover:bg-white",
                  "border-neo-border bg-neo-surface text-neo-text-secondary hover:bg-neo-card hover:text-neo-text-primary",
                )}`}
                onClick={() => setSearch(term)}
              >
                #{term}
              </button>
            ))}
          </div>
        )}
        {clipboardHint ? (
          <p className={`text-sm font-semibold ${tone("text-neo-text-primary", "text-accent-secondary")}`}>{clipboardHint}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {contexts.map((ctx) => {
            const active = context === ctx.id;
            return (
              <button
                key={ctx.id}
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${active
                  ? tone("bg-neo-primary text-white shadow-lg shadow-neo-primary/30", "bg-neo-primary text-white shadow")
                  : tone(
                    "border border-neo-border text-neo-text-secondary hover:bg-neo-surface",
                    "border border-neo-border text-neo-text-secondary hover:bg-neo-surface",
                  )
                  }`}
                aria-pressed={active}
                onClick={() => setContext(ctx.id)}
              >
                {ctx.label}
              </button>
            );
          })}
          <span className={`text-xs ${tone("text-neo-text-secondary", "text-neo-text-secondary")}`}>
            Modo:{" "}
            <button
              type="button"
              className={`underline-offset-4 hover:underline ${tone("text-neo-text-primary", "text-neo-text-primary")}`}
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
        <TranslationPanel input={debounced} status={status} helper={statusMessage} result={translationResult} variant={variant} />
      ) : (
        <div className="mt-2 space-y-6">
          {/* Results List Section */}
          <div className="space-y-4">
            <header className="flex items-center justify-between gap-2">
              <h3 className={`text-lg font-semibold ${tone("text-neo-text-primary", "text-neo-text-primary")}`}>{t("search.results")}</h3>
              <span
                className={`rounded-full px-3 py-1 text-xs ${tone("border border-neo-border text-neo-text-secondary", "border border-white/10 text-white/70")}`}
                aria-live="polite"
              >
                {statusMessage}
              </span>
            </header>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {status === "loading" ? (
                <div className="col-span-full">
                  <GeminiLoader term={debounced} variant={variant} />
                </div>
              ) : items.length ? (
                items.map((term) => {
                  const active = selected?.id === term.id;
                  return (
                    <button
                      key={term.id}
                      type="button"
                      className={`rounded-2xl border px-4 py-3 text-left transition ${active
                        ? tone(
                          "border-neo-primary bg-neo-primary-light/80 shadow-lg shadow-neo-primary/30",
                          "border-neo-primary bg-neo-primary-light/20 shadow-glow-card",
                        )
                        : tone(
                          "border-neo-border hover:border-neo-primary hover:bg-neo-surface",
                          "border-neo-border hover:border-neo-primary hover:bg-neo-surface",
                        )
                        }`}
                      onClick={() => setSelected(term)}
                      aria-pressed={active}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-base font-semibold ${tone("text-neo-text-primary", "text-neo-text-primary")}`}>{term.term}</p>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${tone("bg-neo-surface text-neo-text-secondary", "bg-neo-surface text-neo-text-secondary")}`}
                          >
                            {term.category}
                          </span>
                        </div>
                        <p className={`text-xs uppercase tracking-wide ${tone("text-neo-text-secondary", "text-neo-text-secondary")}`}>
                          {term.translation}
                        </p>
                        {term.aliases?.length ? (
                          <p className={`line-clamp-1 text-xs ${tone("text-neo-text-secondary", "text-neo-text-secondary")}`}>
                            {term.aliases.slice(0, 2).join(", ")}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })
              ) : (
                <p
                  className={`col-span-full rounded-2xl border border-dashed px-4 py-6 text-center text-sm ${tone(
                    "border-neo-border text-neo-text-secondary",
                    "border-neo-border text-neo-text-secondary",
                  )}`}
                >
                  {statusMessage}
                </p>
              )}
            </div>
          </div>

          {/* Preview Section - Full Width */}
          {selected ? (
            <ResultPreview term={selected} activeContext={context} variant={variant} />
          ) : (
            <Placeholder copy={t("search.helper")} variant={variant} />
          )}
        </div>
      )}
    </section>
  );
}

function ResultPreview({ term, activeContext, variant }: { term: TermDTO; activeContext: string; variant: SearchBoxVariant }) {
  const { t } = useI18n();
  const [variantLang, setVariantLang] = useState<string | null>(term.variants?.[0]?.language ?? null);
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  const [actionHint, setActionHint] = useState<string | null>(null);
  const hintTimeout = useRef<number | null>(null);
  const useCases = useMemo(() => term.useCases ?? [], [term.useCases]);
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
  const snippetCode = activeVariant?.snippet ?? term.howEs ?? term.how ?? '';
  const snippetLabel = activeVariant
    ? `${languageLabels[activeVariant.language] ?? activeVariant.language}`
    : t('terms.how');
  const aliasList = term.aliases ?? [];
  const tags = term.tags ?? [];
  const exercises = term.exercises ?? [];
  const filteredUseCases = useCaseContext ? useCases.filter((useCase) => useCase.context === useCaseContext) : useCases;

  useEffect(() => {
    return () => {
      if (hintTimeout.current) {
        window.clearTimeout(hintTimeout.current);
      }
    };
  }, []);

  const showActionHint = (message: string) => {
    setActionHint(message);
    if (hintTimeout.current) {
      window.clearTimeout(hintTimeout.current);
    }
    hintTimeout.current = window.setTimeout(() => setActionHint(null), 1800);
  };

  const handleCopyDefinition = async () => {
    const text = `${term.term}: ${meaningEs}`;
    try {
      await navigator.clipboard.writeText(text);
      showActionHint('Definición copiada al portapapeles');
    } catch {
      showActionHint('No se pudo copiar');
    }
  };

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippetCode);
      showActionHint('Snippet copiado');
    } catch {
      showActionHint('No se pudo copiar');
    }
  };

  const handleGenerateResponse = async (language: 'es' | 'en') => {
    const text = buildInterviewResponse(term, { es: meaningEs, en: meaningEn }, { es: whatEs, en: whatEn }, language);
    try {
      await navigator.clipboard.writeText(text);
      showActionHint(language === 'es' ? 'Respuesta en ES lista' : 'Respuesta en EN lista');
    } catch {
      showActionHint('No se pudo copiar la respuesta');
    }
  };

  return (
    <article className="px-1 py-4 md:px-0">
      {/* Header with Term Info */}
      <div className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-neo-text-primary">{term.term}</h3>
            <p className="mt-1 text-sm md:text-base text-neo-text-secondary">{term.translation}</p>
          </div>
          <span className="rounded-full border border-neo-border bg-neo-surface px-3 py-1 text-xs font-semibold uppercase text-neo-text-secondary">
            {term.category}
          </span>
        </div>
        {(aliasList.length > 0 || tags.length > 0) && (
          <div className="flex flex-wrap gap-1 text-xs">
            {aliasList.map((alias) => (
              <span key={alias} className="rounded-full border border-neo-border bg-neo-surface px-2 py-0.5 text-neo-text-secondary">
                {alias}
              </span>
            ))}
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border border-neo-border bg-neo-surface px-2 py-0.5 font-semibold text-neo-text-primary">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="mt-6">
        <ActionToolbar
          onCopyDefinition={handleCopyDefinition}
          onCopySnippet={handleCopySnippet}
          onOpenCheatSheet={() => setCheatSheetOpen(true)}
          onGenerateResponse={handleGenerateResponse}
          hint={actionHint}
          variant={variant}
        />
      </div>

      {/* Definition + Code Side by Side */}
      <div className="mt-6 grid gap-6 md:gap-8 md:grid-cols-[1fr_1fr]">
        {/* Left: Definition & What */}
        <div className="space-y-6">
          {/* Meanings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-4 rounded-full bg-neo-primary shrink-0"></span>
              <p className="text-xs font-bold uppercase tracking-widest text-neo-primary">1. DEFINICIÓN</p>
            </div>
            <div className="space-y-3">
              {[{ label: 'ES', value: meaningEs }, { label: 'EN', value: meaningEn }].map((block) => (
                <div key={block.label}>
                  <span className="text-xs text-neo-text-secondary font-medium mb-1 block">{block.label}</span>
                  <p className="text-sm leading-relaxed text-neo-text-primary wrap-break-word">{block.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What it solves */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-4 rounded-full bg-neo-primary shrink-0"></span>
              <p className="text-xs font-bold uppercase tracking-widest text-neo-primary">2. PROPÓSITO</p>
            </div>
            <div className="space-y-3">
              {[{ label: 'ES', value: whatEs }, { label: 'EN', value: whatEn }].map((block) => (
                <div key={block.label}>
                  <span className="text-xs text-neo-text-secondary font-medium mb-1 block">{block.label}</span>
                  <p className="text-sm leading-relaxed text-neo-text-primary wrap-break-word">{block.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Code Snippet Only */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-1.5 w-4 rounded-full bg-neo-primary shrink-0"></span>
            <p className="text-xs font-bold uppercase tracking-widest text-neo-primary">3. CÓDIGO</p>
          </div>
          <SelectorPanel
            variantOptions={variantOptions}
            variantLang={variantLang}
            onVariantChange={setVariantLang}
            activeVariant={activeVariant}
            snippetLabel={snippetLabel}
            snippetCode={snippetCode}
          />
        </div>
      </div>

      {/* Preview Below - Full Width */}
      {activeVariant ? (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-4 rounded-full bg-neo-primary shrink-0"></span>
            <p className="text-xs font-bold uppercase tracking-widest text-neo-primary">4. PREVIEW</p>
          </div>
          <StyleAwareCode 
            term={term} 
            snippet={activeVariant.snippet || snippetCode} 
            language={activeVariant.language || 'css'}
          />
        </div>
      ) : null}

      {/* Examples */}
      {term.examples?.length ? (
        <div className="mt-10">
          <h3 className="text-xl font-bold text-neo-text-primary mb-6 flex items-center gap-2">
            <span className="h-1 w-6 rounded-full bg-neo-primary"></span>
            {t('terms.examples')}
          </h3>
          <div className="grid gap-8 grid-cols-1">
            {term.examples.map((example) => (
              <ExampleRow key={example.title} example={example} variant={variant} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Bottom Grid - Use Cases */}
      <div className="mt-10">
        {/* Use Cases - World Class Design */}
        <div className="">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neo-text-primary flex items-center gap-2">
              <TbTarget className="text-neo-primary" /> Casos de uso
            </h3>
          </div>

          {/* Premium Segmented Control */}
          <div className="flex p-1 gap-1 bg-neo-surface/50 rounded-lg mb-8 overflow-x-auto border border-neo-border/30">
            {availableUseCaseContexts.length ? (
              availableUseCaseContexts.map((contextOption) => {
                const isActive = useCaseContext === contextOption;
                const icons: Record<string, React.ComponentType<{ className?: string }>> = {
                  project: TbBriefcase,
                  interview: TbMicrophone,
                  bug: TbBug,
                };
                const Icon = icons[contextOption] ?? TbListCheck;

                return (
                  <button
                    key={contextOption}
                    type="button"
                    onClick={() => setUseCaseContext(contextOption)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 ${isActive
                      ? 'bg-white dark:bg-neo-primary text-neo-primary dark:text-white shadow-md scale-[1.02]'
                      : 'text-neo-text-secondary hover:bg-white/50 dark:hover:bg-white/5 hover:text-neo-text-primary'
                      }`}
                  >
                    <Icon className="text-base" />
                    <span className="capitalize">{contextOption}</span>
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-neo-text-secondary px-4 py-2">Sin contextos adicionales.</span>
            )}
          </div>

          {/* Dynamic Content Card */}
          <div className="min-h-[200px]">
            {filteredUseCases.length ? (
              filteredUseCases.map((useCase, index) => (
                <div key={`${useCase.context}-${index}`} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Hero Summary */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-neo-text-primary leading-tight">
                      {useCase.summary}
                    </h4>
                  </div>

                  {/* Timeline Steps */}
                  {useCase.steps?.length ? (
                    <div className="relative pl-2 space-y-6 mb-6">
                      {/* Vertical Line */}
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-linear-to-b from-neo-primary/50 to-transparent" />

                      {useCase.steps.map((step, i) => (
                        <div key={i} className="relative flex gap-4 group">
                          <div className="relative z-10 shrink-0 w-6 h-6 rounded-full bg-neo-surface border-2 border-neo-primary flex items-center justify-center text-[10px] font-bold text-neo-primary group-hover:scale-110 transition-transform bg-white dark:bg-black">
                            {i + 1}
                          </div>
                          <p className="text-sm text-neo-text-secondary pt-0.5 group-hover:text-neo-text-primary transition-colors">
                            {step.es ?? step.en}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Pro Tip Box */}
                  {useCase.tips ? (
                    <div className="relative overflow-hidden rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 md:p-5">
                      <div className="absolute top-0 right-0 p-1 md:p-2 opacity-10">
                        <TbBulb className="text-4xl text-yellow-500" />
                      </div>
                      <div className="flex gap-2 md:gap-3 relative z-10">
                        <TbBulb className="shrink-0 text-lg text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-yellow-600/80 mb-1">Pro Tip</p>
                          <p className="text-sm text-neo-text-primary/90 italic">
                            &quot;{useCase.tips}&quot;
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                <TbTarget className="text-4xl mb-2" />
                <p className="text-xs text-neo-text-secondary">Selecciona un contexto para ver el plan de acción.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercises - Full Width */}
      {
        exercises.length ? (
          <div className="mt-10">
            <h3 className="text-xl font-bold text-neo-text-primary mb-6 flex items-center gap-2">
              <span className="h-1 w-6 rounded-full bg-neo-accent-purple"></span>
              Ejercicios
            </h3>
            <div className="space-y-8">
              {exercises.map((exercise, index) => (
                <ExerciseRow key={exercise.id ?? index} exercise={exercise} variant={variant} />
              ))}
            </div>
          </div>
        ) : null
      }

      <CheatSheetOverlay
        open={cheatSheetOpen}
        onClose={() => setCheatSheetOpen(false)}
        term={term}
        meaningEs={meaningEs}
        meaningEn={meaningEn}
        whatEs={whatEs}
        whatEn={whatEn}
        snippet={snippetCode}
        tags={tags}
        aliases={aliasList}
      />
    </article >
  );
}

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
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="text-xs uppercase tracking-wide text-neo-text-secondary">{t("terms.how")}</p>
        {activeVariant?.level ? (
          <span className="rounded-full border border-neo-border bg-neo-surface px-3 py-0.5 text-[11px] uppercase tracking-wide text-neo-text-secondary">
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
                className={`rounded-full px-3 py-1 font-semibold transition ${active ? "bg-white text-ink-900" : "border border-white/20 text-white/60 hover:bg-white/10"
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



function ActionToolbar({ onCopyDefinition, onCopySnippet, onOpenCheatSheet, onGenerateResponse, hint }: ActionToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-neo-border/30 pb-6">
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <button className="btn-ghost" type="button" onClick={onCopyDefinition}>
          Copiar definición
        </button>
        <button className="btn-ghost" type="button" onClick={onCopySnippet}>
          Copiar snippet
        </button>
        <button className="btn-ghost" type="button" onClick={onOpenCheatSheet}>
          Abrir cheat sheet
        </button>
        <button className="btn-ghost" type="button" onClick={() => onGenerateResponse("es")}>
          Respuesta ES
        </button>
        <button className="btn-ghost" type="button" onClick={() => onGenerateResponse("en")}>
          Response EN
        </button>
      </div>
      {hint ? <p className="text-[11px] text-accent-secondary">{hint}</p> : null}
    </div>
  );
}

type CheatSheetOverlayProps = {
  open: boolean;
  onClose: () => void;
  term: TermDTO;
  meaningEs: string;
  meaningEn: string;
  whatEs: string;
  whatEn: string;
  snippet: string;
  tags: string[];
  aliases: string[];
};

function CheatSheetOverlay({ open, onClose, term, meaningEs, meaningEn, whatEs, whatEn, snippet, tags, aliases }: CheatSheetOverlayProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-ink-900 p-2 md:p-4 lg:p-6 shadow-2xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">Cheat sheet</p>
            <h3 className="text-xl font-semibold text-white">{term.term}</h3>
          </div>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </header>
        <div className="mt-4 space-y-3 text-sm text-white/80">
          <p>
            <strong>ES:</strong> {meaningEs}
          </p>
          <p>
            <strong>EN:</strong> {meaningEn}
          </p>
          <p>
            <strong>Cómo explicarlo (ES):</strong> {whatEs}
          </p>
          <p>
            <strong>How to pitch (EN):</strong> {whatEn}
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-2">
            <p className="text-xs uppercase tracking-wide text-white/60">Snippet base</p>
            <CodeBlock code={snippet} label={term.translation ?? term.term} />
          </div>
          {aliases.length ? (
            <p className="text-xs text-white/50">Aliases: {aliases.join(", ")}.</p>
          ) : null}
          {tags.length ? (
            <p className="text-xs text-white/50">Tags: {tags.join(", ")}.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function buildInterviewResponse(
  term: TermDTO,
  meaning: { es: string; en: string },
  usage: { es: string; en: string },
  language: "es" | "en",
) {
  if (language === "es") {
    return `Cuando hablo de ${term.term} me refiero a ${meaning.es}. Lo uso así: ${usage.es}. Por lo general lo aplico en contextos de ${term.category}.`;
  }
  return `When I mention ${term.term}, I mean ${meaning.en}. I rely on it because ${usage.en}. It's part of my ${term.category} toolkit.`;
}

function Placeholder({ copy, variant = "dark" }: { copy: string; variant?: SearchBoxVariant }) {
  const isLight = variant === "light";
  const tone = (light: string, dark: string) => (isLight ? light : dark);
  return (
    <div
      className={`flex h-full flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center text-sm ${tone(
        "border-neo-border bg-white text-neo-text-secondary",
        "border-white/10 bg-white/5 text-white/60",
      )}`}
    >
      <p>{copy}</p>
    </div>
  );
}

function ErrorBlock({ message, variant = "dark" }: { message: string; variant?: SearchBoxVariant }) {
  const isLight = variant === "light";
  return (
    <div
      className={`rounded-3xl border p-6 text-center text-sm ${isLight ? "border-accent-danger/40 bg-accent-danger/10 text-accent-danger" : "border-accent-danger/30 bg-accent-danger/10 text-accent-danger"}`}
    >
      {message}
    </div>
  );
}

function TranslationPanel({
  input,
  status,
  helper,
  result,
  variant,
}: {
  input: string;
  status: Status;
  helper: string;
  result: StructuralTranslationResult | null;
  variant: SearchBoxVariant;
}) {
  const isLight = variant === "light";
  const tone = (light: string, dark: string) => (isLight ? light : dark);
  const trimmed = input.trim();
  if (!trimmed) {
    return <Placeholder copy="Pega código o texto técnico para traducirlo al español." variant={variant} />;
  }
  if (status === "loading") {
    return <TranslationSkeleton />;
  }
  if (status === "error") {
    return <ErrorBlock message={helper} variant={variant} />;
  }
  if (!result) {
    return <Placeholder copy={helper} variant={variant} />;
  }
  return (
    <div className="mt-3 space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={`text-lg font-semibold ${tone("text-neo-text-primary", "text-white")}`}>Traducción estructural</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs ${tone("border border-neo-border text-neo-text-secondary", "border border-white/10 text-white/70")}`}
        >
          {helper}
        </span>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={`rounded-2xl border p-2 ${tone("border-neo-border bg-white", "border-white/10 bg-white/5")}`}>
          <p className={`text-xs uppercase tracking-wide ${tone("text-neo-text-secondary", "text-white/60")}`}>Fragmento original</p>
          <CodeBlock code={input} label="Original" />
        </div>
        <div className={`rounded-2xl border p-2 ${tone("border-neo-border bg-neo-surface", "border-white/10 bg-ink-900/50")}`}>
          <div className={`flex items-center justify-between gap-2 text-xs ${tone("text-neo-text-secondary", "text-white/60")}`}>
            <p className={tone("text-neo-text-primary", "text-white")}>Salida en español</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${tone("border border-neo-border text-neo-text-secondary", "border border-white/15 text-white/70")}`}
            >
              {result.fallbackApplied ? "Modo básico" : result.language.toUpperCase()}
            </span>
          </div>
          <CodeBlock code={result.code} label="Traducción" />
        </div>
      </div>
      <TranslationSummary result={result} variant={variant} />
    </div>
  );
}

function TranslationSummary({ result, variant }: { result: StructuralTranslationResult; variant: SearchBoxVariant }) {
  const isLight = variant === "light";
  const tone = (light: string, dark: string) => (isLight ? light : dark);
  const meaningfulSegments = (result.segments || []).filter((segment) => segment.type !== "text");
  const topSegments = meaningfulSegments.slice(0, 4);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className={`rounded-2xl border p-4 ${tone("border-neo-border bg-white", "border-white/10 bg-white/5")}`}>
        <p className={`text-xs uppercase tracking-wide ${tone("text-neo-text-secondary", "text-white/60")}`}>Resumen</p>
        <dl className={`mt-3 grid gap-2 text-sm ${tone("text-neo-text-primary", "text-white")}`}>
          <div className="flex items-center justify-between">
            <dt className={tone("text-neo-text-secondary", "text-white/60")}>Cadenas</dt>
            <dd className="font-semibold">{result.replacedStrings}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className={tone("text-neo-text-secondary", "text-white/60")}>Comentarios</dt>
            <dd className="font-semibold">{result.replacedComments}</dd>
          </div>
          {result.fallbackApplied ? (
            <p
              className={`rounded-full px-3 py-1 text-center text-[11px] ${tone(
                "border border-neo-border bg-neo-surface text-neo-text-secondary",
                "border border-white/10 bg-white/10 text-white/70",
              )}`}
            >
              Se activó el modo básico para mantener la estructura.
            </p>
          ) : null}
        </dl>
      </div>
      <div className={`rounded-2xl border p-4 ${tone("border-neo-border bg-neo-surface", "border-white/10 bg-ink-900/50")}`}>
        <p className={`text-xs uppercase tracking-wide ${tone("text-neo-text-secondary", "text-white/60")}`}>Segmentos detectados</p>
        {topSegments.length ? (
          <ul className={`mt-3 space-y-2 text-xs ${tone("text-neo-text-secondary", "text-white/80")}`}>
            {topSegments.map((segment, index) => (
              <li
                key={`${segment.type}-${segment.start}-${index}`}
                className={`rounded-xl border p-3 ${tone("border-neo-border bg-white", "border-white/10 bg-white/5")}`}
              >
                <div className={`flex items-center justify-between text-[11px] ${tone("text-neo-text-secondary", "text-white/60")}`}>
                  <span className="font-semibold capitalize">
                    {segment.type === "comment" ? "Comentario" : "Cadena"} #{index + 1}
                  </span>
                  <span>pos {segment.start}-{segment.end}</span>
                </div>
                <p className={`mt-2 text-[11px] ${tone("text-neo-text-secondary", "text-white/50")}`}>
                  Original: {truncateSegment(segment.original)}
                </p>
                <p className={`mt-1 text-[11px] ${tone("text-neo-text-primary", "text-white")}`}>→ {truncateSegment(segment.translated)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`mt-3 text-xs ${tone("text-neo-text-secondary", "text-white/60")}`}>No encontramos strings ni comentarios en este fragmento.</p>
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

function CodeBlock({ code, label, language = "tsx" }: { code: string; label?: string; language?: string }) {
  const normalized = (code ?? "").trimEnd().replace(/\r\n/g, "\n") || "// Sin código";
  return (
    <div className="overflow-hidden rounded-xl border border-neo-border/40 bg-[#0d1117] my-4 group transition-all hover:border-neo-primary/30">
      <div className="flex items-center justify-between gap-2 border-b border-neo-border/10 bg-white/5 px-3 py-2.5 md:px-5 md:py-3 text-xs md:text-sm text-neo-text-secondary">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </span>
          <span className="font-mono font-medium opacity-70">{label || "Snippet"}</span>
        </div>
        <CopyButton code={normalized} />
      </div>
      <SyntaxHighlighter
        language={language}
        style={dracula}
        customStyle={{
          borderRadius: 0,
          maxHeight: "32rem",
          overflow: "auto",
          backgroundColor: "transparent",
          margin: 0,
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          paddingRight: "1rem",
        }}
        codeTagProps={{
          style: {
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: '"JetBrains Mono", monospace',
          },
        }}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "1em",
          paddingLeft: "0.5em",
          textAlign: "right",
          color: "rgba(255,255,255,0.4)",
          userSelect: "none",
          flexShrink: 0,
        }}
        showLineNumbers
        className="scroll-silent p-3! md:p-6! lg:p-8! text-xs! md:text-sm! lg:text-base! leading-relaxed! md:leading-loose! tracking-tight [&_pre]:bg-transparent!"
      >
        {normalized}
      </SyntaxHighlighter>
    </div>
  );
}

type ExerciseRowProps = {
  exercise: TermExerciseDTO;
  variant: SearchBoxVariant;
};

function ExerciseRow({ exercise, variant }: ExerciseRowProps) {
  const [showSolution, setShowSolution] = useState(false);
  const tone = (light: string, dark: string) => (variant === "light" ? light : dark);

  const prompt = exercise.promptEs ?? exercise.promptEn ?? "";
  const solution = exercise.solutions?.[0];

  const renderPrompt = (text: string) => {
    if (!text.includes("```")) {
      return <span className="whitespace-pre-wrap">{text}</span>;
    }

    const parts = text.split(/(```[\w]*\n[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        if (match) {
          const [, lang, code] = match;
          return (
            <CodeBlock key={index} code={code.trim()} language={lang || 'text'} />
          );
        }
      }
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  return (
    <div className="border-b border-neo-border/30 pb-8 last:border-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <h4 className={`font-semibold ${tone('text-neo-text-primary', 'text-white')}`}>
            {exercise.titleEs ?? exercise.titleEn}
          </h4>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${exercise.difficulty === 'easy' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
            exercise.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' :
              'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}>
            {exercise.difficulty}
          </span>
        </div>
        {solution && (
          <button
            onClick={() => setShowSolution(!showSolution)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${showSolution
              ? tone("border-neo-primary bg-neo-primary text-white", "border-neo-primary bg-neo-primary text-white")
              : tone("border-neo-border bg-white hover:border-neo-primary hover:text-neo-primary", "border-neo-border bg-white/5 hover:border-neo-primary hover:text-neo-primary")
              }`}
          >
            {showSolution ? "Ocultar solución" : "Ver solución"}
          </button>
        )}
      </div>

      <div className={`text-sm ${tone('text-neo-text-secondary', 'text-neo-text-secondary')}`}>
        {renderPrompt(prompt)}
      </div>

      {showSolution && solution && (
        <div className="mt-4 pt-4 border-t border-neo-border/30">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-neo-primary" />
            <p className={`text-xs font-bold uppercase tracking-wider ${tone("text-neo-text-secondary", "text-neo-text-secondary")}`}>
              Solución
            </p>
          </div>

          <CodeBlock code={solution.code} language={solution.language} />

          {(solution.explainEs || solution.explainEn) && (
            <div className="mt-3 p-4 md:p-5 rounded-lg bg-neo-primary/5">
              <p className={`text-sm leading-relaxed ${tone("text-neo-text-primary", "text-neo-text-primary")}`}>
                <span className={`font-semibold ${tone("text-neo-primary", "text-neo-primary")}`}>💡 </span>
                {solution.explainEs ?? solution.explainEn}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type ExampleRowProps = {
  example: TermExampleDTO;
  variant: SearchBoxVariant;
};

function ExampleRow({ example }: ExampleRowProps) {
  const title = example.title ?? example.titleEs ?? example.titleEn ?? "Ejemplo";
  const note = example.note ?? example.noteEs ?? example.noteEn;

  return (
    <div className="space-y-3 pl-4 border-l-2 border-neo-border/50 hover:border-neo-primary transition-colors">
      <p className="text-sm font-bold text-neo-text-primary">{title}</p>
      {note ? <p className="text-sm text-neo-text-secondary">{note}</p> : null}
      <CodeBlock code={example.code} label={title} />
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
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${copied ? "border-accent-emerald/60 text-accent-emerald" : "border-white/20 text-white/70 hover:border-white/40"
        }`}
      aria-live="polite"
    >
      {copied ? t("common.copied") : t("common.copy")}
    </button>
  );
}

function StyleAwareCode({ term, snippet, language }: { term: TermDTO; snippet: string; language: string }) {
  const isHtml = language === "html";
  // Basic heuristic to detect if it's a Tailwind class being demonstrated
  const isTailwind = term.tags?.includes("tailwind") || term.category === "frontend";

  if (isHtml) {
    return (
      <div className="rounded-xl border border-neo-border bg-white overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-2 border-b border-neo-border text-xs font-medium text-gray-500 uppercase tracking-wider">
          Resultado Renderizado
        </div>
        <div className="p-8 flex justify-center items-center bg-white min-h-[120px]">
          <div dangerouslySetInnerHTML={{ __html: snippet }} />
        </div>
      </div>
    );
  }

  if (isTailwind && !snippet.includes("\n") && !snippet.includes(";")) {
     // If it's a single line and looks like a class, try to render a box with that class
     return (
      <div className="rounded-xl border border-neo-border bg-white overflow-hidden shadow-sm">
        <div className="bg-gray-50 px-4 py-2 border-b border-neo-border text-xs font-medium text-gray-500 uppercase tracking-wider">
          Visualización de Clase
        </div>
        <div className="p-8 flex justify-center items-center bg-white min-h-[120px]">
           <div className={`p-4 bg-gray-100 rounded ${snippet}`}>
              Ejemplo: {term.term}
           </div>
        </div>
      </div>
     );
  }

  return (
    <div className="rounded-xl border border-dashed border-neo-border p-6 text-center">
      <p className="text-sm text-neo-text-secondary">Vista previa no disponible para este formato.</p>
    </div>
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

function GeminiLoader({ term, variant }: { term: string; variant: SearchBoxVariant }) {
  const isLight = variant === "light";
  const tone = (light: string, dark: string) => (isLight ? light : dark);

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border py-16 px-8 text-center backdrop-blur-xl transition-all duration-500 ${tone(
      "border-neo-border/60 bg-white/60 shadow-xl shadow-neo-primary/5",
      "border-white/10 bg-black/20 shadow-2xl shadow-black/20"
    )}`}>
      {/* Ambient Background Glow */}
      <div className={`absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] opacity-40 ${tone(
        "from-neo-primary/10 via-transparent to-transparent",
        "from-emerald-500/10 via-transparent to-transparent"
      )}`} />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* The Dots - Premium & Glowing */}
        <div className="flex items-center gap-4">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className={`h-4 w-4 rounded-full animate-bounce ${tone(
                "bg-linear-to-br from-neo-primary to-neo-accent-purple shadow-[0_0_15px_rgba(77,154,255,0.4)]",
                "bg-linear-to-br from-emerald-400 to-cyan-500 shadow-[0_0_20px_rgba(52,211,153,0.6)]"
              )}`}
              style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}
            />
          ))}
        </div>

        {/* The Text - Modern & Clean */}
        <div className="space-y-3">
          <p className={`text-xl font-medium tracking-tight ${tone("text-neo-text-primary", "text-white/90")}`}>
            Buscando <span className={`font-bold text-transparent bg-clip-text ${tone(
              "bg-linear-to-r from-neo-primary to-neo-accent-purple",
              "bg-linear-to-r from-emerald-400 to-cyan-400"
            )}`}>&quot;{term}&quot;</span>
          </p>
          <div className={`flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest animate-pulse ${tone(
            "text-neo-text-secondary",
            "text-white/40"
          )}`}>
            <TbSparkles className={`text-sm ${tone("text-neo-primary", "text-emerald-400")}`} />
            <span>Procesando contexto semántico...</span>
          </div>
        </div>
      </div>
    </div>
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
