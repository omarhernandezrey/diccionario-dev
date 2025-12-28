"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useSession } from "@/components/admin/SessionProvider";
import type { TermDTO } from "@/types/term";
import SoftSkillsPanel from "@/components/SoftSkillsPanel";

type TrainingMode = {
  label: string;
  question: string;
  answer: string;
  snippet: string;
};

type ResponseTemplateOptions = {
  roleContext?: string;
  impactMetric?: string;
};

const responseTemplates = {
  es: "Como {roleContext} en {category}, cuando hablan de {term} digo que {meaningEs}. Lo conecto con {usageEs} y resalto {impactMetric}.",
  en: "As {roleContext} working on {category}, I describe {term} as {meaningEn}. I apply it with {usageEn} and highlight {impactMetric}.",
};

export default function InterviewLivePage() {
  const pathname = usePathname() || "";
  const { session, loading: sessionLoading } = useSession();
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState<TermDTO | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "empty">("idle");
  const [hint, setHint] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [interviewFallback, setInterviewFallback] = useState(false);
  const [trainingModeActive, setTrainingModeActive] = useState(false);
  const [trainingIndex, setTrainingIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query, 200);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if ((event.metaKey || event.ctrlKey) && key === "1") {
        event.preventDefault();
        copyResponse("es");
      }
      if ((event.metaKey || event.ctrlKey) && key === "2") {
        event.preventDefault();
        copyResponse("en");
      }
      if ((event.metaKey || event.ctrlKey) && key === "b") {
        event.preventDefault();
        copySnippet();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  useEffect(() => {
    if (!debounced.trim()) {
      setInterviewFallback(false);
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    fetch(`/api/terms?q=${encodeURIComponent(debounced)}&pageSize=1&context=interview`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        const item = Array.isArray(payload?.items) ? (payload.items as TermDTO[])[0] : null;
        setInterviewFallback(Boolean(payload?.meta?.interviewFallback));
        setTerm(item ?? null);
        setStatus(item ? "ready" : "empty");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setStatus("empty");
        setTerm(null);
        setInterviewFallback(false);
      });
    return () => controller.abort();
  }, [debounced]);

  useEffect(() => {
    if (debounced.trim()) return;
    const controller = new AbortController();
    setTerm(null);
    setStatus("loading");
    fetch("/api/terms?sort=recent&pageSize=1", { cache: "no-store", signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        const item = Array.isArray(payload?.items) ? (payload.items as TermDTO[])[0] : null;
        setTerm(item ?? null);
        setStatus(item ? "ready" : "idle");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setStatus("idle");
        setTerm(null);
      });
    return () => controller.abort();
  }, [debounced]);

  const meaning = useMemo(() => {
    if (!term) return { es: "", en: "" };
    return {
      es: term.meaningEs ?? term.meaning,
      en: term.meaningEn ?? term.meaning,
    };
  }, [term]);
  const usage = useMemo(() => {
    if (!term) return { es: "", en: "" };
    return {
      es: term.whatEs ?? term.what,
      en: term.whatEn ?? term.what,
    };
  }, [term]);

  const filteredExercises = useMemo(() => {
    if (!term?.exercises?.length) return [];
    if (difficultyFilter === "all") return term.exercises;
    return term.exercises.filter((exercise) => exercise.difficulty === difficultyFilter);
  }, [difficultyFilter, term]);

  const preferredSnippet = useMemo(() => {
    const exerciseSnippet =
      filteredExercises[0]?.solutions?.[0]?.code ??
      filteredExercises[0]?.solutions?.find(Boolean)?.code;
    if (exerciseSnippet) return exerciseSnippet;
    const variantSnippet = term?.variants?.[0]?.snippet;
    if (variantSnippet) return variantSnippet;
    return term?.examples?.[0]?.code ?? "";
  }, [filteredExercises, term]);

  const followUpQuestions = useMemo(() => {
    if (!term) return [];
    const questions: string[] = [];
    term.useCases?.forEach((useCase) => {
      if (questions.length >= 4) return;
      const contextLabel = useCase.context === "interview" ? "entrevista" : useCase.context;
      const summary = useCase.summary
        ? `Cuéntame cómo ${useCase.summary.toLowerCase().replace(/(^\w)/, (match) => match.toLowerCase())}`
        : undefined;
      questions.push(
        `¿Cómo aplicaste ${term.term} en ${contextLabel}?${summary ? ` ${summary}.` : ""}`,
      );
    });
    filteredExercises.forEach((exercise) => {
      if (questions.length >= 4) return;
      questions.push(
        `Describe tu enfoque para ${exercise.titleEs ?? exercise.titleEn ?? term.term} (${exercise.difficulty}).`,
      );
    });
    term.examples?.forEach((example) => {
      if (questions.length >= 4) return;
      questions.push(
        `¿Puedes explicar qué estaba pasando en este ejemplo? ${example.note ?? example.title ?? ""}`,
      );
    });
    return questions;
  }, [filteredExercises, term]);

  const summaryCards = useMemo(() => {
    if (!term) return [];
    const cards: { id: string; label: string; heading: string; details: string[] }[] = [];
    term.useCases?.slice(0, 2).forEach((useCase, index) => {
      const steps = useCase.steps
        ?.filter((step) => Boolean(step?.es || step?.en))
        .slice(0, 3)
        .map((step, idx) => `${idx + 1}. ${step?.es ?? step?.en}`);
      cards.push({
        id: `usecase-${useCase.id ?? index}`,
        label: `Caso · ${useCase.context}`,
        heading: useCase.summary || `Uso de ${term.term}`,
        details: steps.length ? steps : [useCase.tips ?? "Sin pasos concretos"],
      });
    });
    filteredExercises.slice(0, 2).forEach((exercise, index) => {
      cards.push({
        id: `exercise-${exercise.id ?? index}`,
        label: `Ejercicio · ${exercise.difficulty}`,
        heading: exercise.titleEs ?? exercise.titleEn ?? "Práctica",
        details: [exercise.promptEs, `${exercise.difficulty} · ${exercise.solutions?.length ?? 0} solución`].filter(Boolean),
      });
    });
    term.examples?.slice(0, 1).forEach((example, index) => {
      cards.push({
        id: `example-${index}`,
        label: "Ejemplo de código",
        heading: example.title?.trim() || "Snippet rápido",
        details: [example.code.slice(0, 120) + (example.code.length > 120 ? "…" : ""), example.note ?? "Sin notas"],
      });
    });
    return cards.slice(0, 3);
  }, [filteredExercises, term]);

  const timelineSteps = useMemo(
    () => [
      {
        label: "Preparar",
        detail: term ? `${term.meaningEs ?? term.meaning} → ubícate en el problema` : "Resalta el porqué del término",
      },
      {
        label: "Ejecutar",
        detail: term ? `${term.whatEs ?? term.what} con ejemplos del día a día` : "Relaciona un uso concreto",
      },
      {
        label: "Aprender",
        detail: term ? `${term.howEs ?? term.how} y reflexiona sobre impacto/metricas` : "Conecta con el aprendizaje",
      },
    ],
    [term],
  );

  const contextBullets = useMemo(() => {
    if (!term) return [];
    const bullets: string[] = [];
    term.useCases?.slice(0, 2).forEach((useCase) => {
      bullets.push(
        `${useCase.context} · ${useCase.summary ?? "Caso sin resumen"}${useCase.tips ? ` · Tips: ${useCase.tips}` : ""}`,
      );
    });
    term.faqs?.slice(0, 2).forEach((faq) => {
      bullets.push(`FAQ: ${faq.questionEs} → ${faq.answerEs ?? "sin respuesta"}`);
    });
    term.exercises?.slice(0, 2).forEach((exercise) => {
      bullets.push(`Ejercicio ${exercise.difficulty}: ${exercise.titleEs ?? exercise.titleEn ?? "Práctica"}`);
    });
    return bullets.slice(0, 5);
  }, [term]);

  const roleContext = useMemo(() => {
    if (!term) return "profesional técnico";
    const priorityTag = term.tags?.find((tag) => tag.toLowerCase().includes("lead") || tag.toLowerCase().includes("senior"));
    if (priorityTag) return `${priorityTag} especializado`;
    return `${term.category} specialist`;
  }, [term]);

  const impactMetric = useMemo(() => {
    if (!term) return "impacto en el negocio";
    const killerUseCase = term.useCases?.find((useCase) => useCase.context === "interview");
    if (killerUseCase?.summary) return `${killerUseCase.summary} con enfoque en métricas`;
    return `${usage.es} impulsando calidad`;
  }, [term, usage.es]);

  const trainingModes = useMemo<TrainingMode[]>(() => {
    if (!term) return [];
    const categories = [
      { key: "Frontend", prompt: "Frontend", snippet: term.examples?.[0]?.code ?? preferredSnippet ?? "" },
      { key: "Backend", prompt: "Backend API", snippet: term.examples?.[1]?.code ?? preferredSnippet ?? "" },
      { key: "Product", prompt: "Product", snippet: preferredSnippet ?? "" },
    ];
    return categories.map((item) => ({
      label: item.key,
      question: `${item.prompt}? Describe cómo resolverías el desafío usando ${term.term}.`,
      answer: buildInterviewResponse(term, meaning, usage, "es", { roleContext, impactMetric }),
      snippet: item.snippet,
    }));
  }, [term, meaning, preferredSnippet, usage, roleContext, impactMetric]);

  useEffect(() => {
    if (!trainingModeActive || !trainingModes.length) return;
    const interval = setInterval(() => {
      setTrainingIndex((prev) => (trainingModes.length ? (prev + 1) % trainingModes.length : 0));
    }, 8000);
    return () => clearInterval(interval);
  }, [trainingModes, trainingModeActive]);

  const resetQuery = () => {
    setQuery("");
    setTerm(null);
    setStatus("idle");
    setInterviewFallback(false);
    inputRef.current?.focus();
  };

  const showingSuggestion = !debounced.trim() && Boolean(term);
  const statusCopy = useMemo(() => {
    switch (status) {
      case "idle":
        return {
          title: "Comienza aquí",
          body: "Escribe un término técnico o pega un snippet para obtener tu speech.",
          action: { label: "Ver todos los casos", href: "/training" },
        };
      case "loading":
        return {
          title: "Buscando inspiración",
          body: "Estamos recorriendo todos los casos y ejercicios del glosario.",
        };
      case "empty":
        return {
          title: "Sin coincidencias",
          body: "Ajusta la búsqueda o prueba otro término más amplio.",
          action: { label: "Probar otro término", onClick: resetQuery },
        };
      case "ready":
      default:
        return showingSuggestion
          ? {
            title: "Ejemplo sugerido",
            body: "Te mostramos un término reciente para inspirarte. Escribe el tuyo cuando quieras.",
          }
          : {
            title: "Listo para brillar",
            body: "Sigue con un follow-up o copia la respuesta en español o inglés.",
          };
    }
  }, [status, showingSuggestion]);

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Training", href: "/training" },
    { label: "Interview Live", href: "/interview/live" },
  ];
  if (session?.role === "admin") {
    quickLinks.push({ label: "Dashboard", href: "/admin" });
  }
  if (!sessionLoading && !session) {
    quickLinks.push({ label: "Autenticación", href: "/admin/access" });
  }
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  function copyResponse(lang: "es" | "en") {
    if (!term) return;
    const text = buildInterviewResponse(term, meaning, usage, lang, { roleContext, impactMetric });
    navigator.clipboard.writeText(text).then(() => {
      setHint(lang === "es" ? "Respuesta copiada en español" : "Answer copied in English");
      setTimeout(() => setHint(null), 2000);
    });
  }

  function copySnippet() {
    if (!term) return;
    const snippet = preferredSnippet ?? "";
    if (!snippet) return;
    navigator.clipboard.writeText(snippet).then(() => {
      setHint("Snippet copiado");
      setTimeout(() => setHint(null), 2000);
    });
  }

  const currentTraining = trainingModes[trainingIndex];

  return (
    <div className="min-h-screen bg-neo-bg p-6 text-neo-text-primary">
      <nav className="mx-auto mb-6 flex w-full max-w-5xl flex-wrap items-center gap-2">
        {quickLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                active
                  ? "border-neo-primary bg-linear-to-r from-neo-primary to-neo-accent-purple text-white shadow-lg shadow-neo-primary/30"
                  : "border-neo-border bg-neo-surface text-neo-text-secondary hover:border-neo-primary/40 hover:text-neo-text-primary"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-neo-border bg-white p-6 shadow-2xl shadow-neo-primary/10 dark:border-slate-800 dark:bg-slate-950/80">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">Modo entrevista en vivo</p>
            <h1 className="text-3xl font-semibold text-neo-text-primary">Respuestas instantáneas</h1>
          </div>
          <div className="text-right text-xs text-neo-text-secondary">
            <p>⌘/Ctrl + K · Enfocar</p>
            <p>⌘/Ctrl + 1 · Copiar ES</p>
            <p>⌘/Ctrl + 2 · Copy EN</p>
          </div>
        </header>
        <div className="mt-6 rounded-2xl border border-neo-border bg-neo-surface p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <input
            ref={inputRef}
            className="w-full bg-transparent text-2xl font-semibold text-neo-text-primary placeholder:text-neo-text-secondary focus:outline-none"
            placeholder="Busca un término o pega código"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold uppercase tracking-[0.3em] text-neo-text-secondary">Dificultad</span>
            {(["all", "easy", "medium", "hard"] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={`rounded-full border px-3 py-1 transition ${
                  difficultyFilter === level
                    ? "border-neo-primary bg-neo-primary/10 text-neo-primary dark:border-emerald-300/70 dark:text-emerald-200"
                    : "border-neo-border bg-transparent text-neo-text-secondary hover:border-neo-primary/40 hover:text-neo-text-primary"
                }`}
                onClick={() => setDifficultyFilter(level)}
              >
                {level === "all" ? "Todas" : level}
              </button>
            ))}
            {difficultyFilter !== "all" ? (
              <span className="text-neo-text-secondary">Filtrando {difficultyFilter}</span>
            ) : null}
          </div>
        </div>
        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article className="rounded-2xl border border-neo-border bg-white/95 p-5 shadow-inner dark:border-slate-800 dark:bg-slate-900/80">
            {interviewFallback && status !== "idle" ? (
              <div className="mb-4 rounded-2xl border border-amber-300/80 bg-amber-50/90 px-3 py-2 text-xs font-semibold text-amber-900 dark:border-amber-400/60 dark:bg-amber-500/10 dark:text-amber-100">
                Mostramos resultados generales porque no hay casos de uso de entrevista aprobados para esta búsqueda. Todos tienen meaning y what/how listos, pero los marcamos como sugerencias.
              </div>
            ) : null}
            <div className="mb-4 rounded-2xl border border-neo-border bg-neo-surface/80 p-4 text-sm text-neo-text-secondary dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.4em] text-neo-text-secondary">{statusCopy.title}</p>
              <p className="mt-1 text-sm text-neo-text-primary/80">{statusCopy.body}</p>
              {statusCopy.action ? (
                statusCopy.action.href ? (
                  <Link
                    href={statusCopy.action.href}
                    className="mt-3 inline-flex rounded-full border border-neo-border bg-white px-3 py-1 text-xs font-semibold text-neo-text-primary shadow-sm transition hover:border-neo-primary hover:text-neo-primary dark:bg-slate-900/70 dark:text-white"
                  >
                    {statusCopy.action.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={statusCopy.action.onClick}
                    className="mt-3 inline-flex rounded-full border border-neo-border bg-white px-3 py-1 text-xs font-semibold text-neo-text-primary shadow-sm transition hover:border-neo-primary hover:text-neo-primary dark:bg-slate-900/70 dark:text-white"
                  >
                    {statusCopy.action.label}
                  </button>
                )
              ) : null}
            </div>
            {status === "idle" ? (
              <p className="text-sm text-neo-text-secondary">Escribe una palabra clave para preparar tu speech.</p>
            ) : status === "loading" ? (
              <p className="text-sm text-neo-text-secondary">Buscando…</p>
            ) : term ? (
              <div className="space-y-6">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-semibold text-neo-text-primary">{term.term}</h2>
                    <p className="text-sm text-neo-text-secondary">{term.translation}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {showingSuggestion ? (
                      <span className="rounded-full border border-neo-border bg-neo-surface px-3 py-2 font-semibold text-neo-text-secondary">
                        Ejemplo sugerido
                      </span>
                    ) : null}
                    <button
                      className="rounded-2xl border border-neo-border bg-white px-4 py-2 font-semibold text-neo-text-primary transition hover:border-neo-primary hover:text-neo-primary"
                      type="button"
                      onClick={() => copyResponse("es")}
                    >
                      Copiar ES
                    </button>
                    <button
                      className="rounded-2xl border border-neo-border bg-white px-4 py-2 font-semibold text-neo-text-primary transition hover:border-neo-primary hover:text-neo-text-primary"
                      type="button"
                      onClick={() => copyResponse("en")}
                    >
                      Copy EN
                    </button>
                  </div>
                </header>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                      term.hasInterviewUseCase
                        ? "border border-emerald-400/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-500/10 dark:text-emerald-200"
                        : "border border-amber-400/60 bg-amber-50 text-amber-800 dark:border-amber-500/60 dark:bg-amber-500/10 dark:text-amber-100"
                    }`}
                  >
                    {term.hasInterviewUseCase ? "Caso aprobado para entrevistas" : "Sugerencia general"}
                  </span>
                  {!term.hasInterviewUseCase && interviewFallback ? (
                    <span className="text-xs text-amber-700 dark:text-amber-200">Resultado de fallback general</span>
                  ) : null}
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-neo-border bg-neo-surface p-3 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Significado (ES)</p>
                    <p className="text-sm text-neo-text-primary/90">{meaning.es}</p>
                  </div>
                  <div className="rounded-2xl border border-neo-border bg-neo-surface p-3 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Meaning (EN)</p>
                    <p className="text-sm text-neo-text-primary/90">{meaning.en}</p>
                  </div>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-neo-border bg-neo-surface p-3">
                    <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Cómo lo usé</p>
                    <p className="text-sm text-neo-text-primary/90">{usage.es}</p>
                  </div>
                  <div className="rounded-2xl border border-neo-border bg-neo-surface p-3">
                    <p className="text-xs uppercase tracking-wide text-neo-text-secondary">How I pitch it</p>
                    <p className="text-sm text-neo-text-primary/90">{usage.en}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-neo-border bg-neo-surface/70 p-3 text-sm text-neo-text-primary/90 dark:border-slate-800 dark:bg-slate-900/70 dark:text-white/80">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Snippet base</p>
                    <button
                      type="button"
                      className="text-[11px] text-neo-primary underline-offset-2 hover:underline dark:text-emerald-300"
                      onClick={copySnippet}
                    >
                      Copiar
                    </button>
                  </div>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-md border border-neo-border bg-white/60 p-2 text-xs dark:border-slate-800 dark:bg-slate-900/80">
                    {preferredSnippet || "// No hay snippet"}
                  </pre>
                </div>
                {followUpQuestions.length ? (
                  <section className="space-y-2 rounded-2xl border border-neo-border bg-neo-surface p-4 text-xs text-neo-text-secondary shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-[11px] uppercase tracking-[0.4em] text-neo-text-secondary">Preguntas de seguimiento</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {followUpQuestions.map((question, index) => (
                        <div
                          key={`${question}-${index}`}
                          className="rounded-2xl border border-neo-border bg-white/80 p-3 text-justify text-[13px] font-medium text-neo-text-primary dark:border-slate-800 dark:bg-slate-900/80"
                        >
                          {question}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
                {summaryCards.length ? (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.4em] text-neo-text-secondary">Contextos clave</p>
                      <span className="text-xs text-neo-text-secondary">máx 3 tarjetas</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {summaryCards.map((card) => (
                        <div
                          key={card.id}
                          className="rounded-2xl border border-neo-border bg-white/90 p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
                        >
                          <p className="text-[11px] uppercase tracking-[0.4em] text-neo-text-secondary">{card.label}</p>
                          <h3 className="mt-1 text-lg font-semibold text-neo-text-primary">{card.heading}</h3>
                          <ul className="mt-2 space-y-1 text-xs text-neo-text-secondary">
                            {card.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-neo-text-primary/80">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
                <section className="mt-5 rounded-2xl border border-neo-border bg-neo-surface/80 p-4 transition-colors duration-500 dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-xs uppercase tracking-[0.4em] text-neo-text-secondary">Timeline de uso</p>
                  <div className="mt-3 grid gap-4 md:grid-cols-3">
                    {timelineSteps.map((step, index) => (
                      <div
                        key={step.label}
                        className="flex flex-col gap-1 rounded-2xl border border-neo-border p-3 text-sm text-neo-text-primary transition duration-500 hover:border-neo-primary hover:bg-neo-surface/60 dark:hover:border-emerald-300 dark:hover:bg-slate-900/60"
                      >
                        <div className="text-[11px] uppercase tracking-[0.4em] text-neo-text-secondary">{step.label}</div>
                        <p className="text-xs text-neo-text-primary/90">{step.detail}</p>
                        <div
                          className={`h-1 w-full rounded-full ${
                            index === 0
                              ? "bg-linear-to-r from-neo-primary to-neo-accent-purple"
                              : "bg-linear-to-r from-emerald-400 to-emerald-600"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </section>
                {contextBullets.length ? (
                  <section className="mt-6 rounded-2xl border border-neo-border bg-white/90 p-4 text-sm text-neo-text-primary shadow-sm transition-colors duration-500 dark:border-slate-800 dark:bg-slate-900/80">
                    <p className="text-xs uppercase tracking-[0.4em] text-neo-text-secondary">Más contexto</p>
                    <ul className="mt-3 space-y-2 text-[13px] text-neo-text-secondary">
                      {contextBullets.map((bullet, index) => (
                        <li key={`${bullet}-${index}`} className="flex items-start gap-2">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-neo-primary" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                <section className="mt-6 rounded-2xl border border-neo-border bg-neo-surface/90 p-4 transition-colors duration-500 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.4em] text-neo-text-secondary">Training mode</p>
                    <button
                      type="button"
                      onClick={() => {
                        setTrainingModeActive((prev) => {
                          if (prev) return false;
                          setTrainingIndex(0);
                          return true;
                        });
                      }}
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                        trainingModeActive
                          ? "border-emerald-400 bg-emerald-500/10 text-emerald-500"
                          : "border-neo-border bg-transparent text-neo-text-secondary hover:border-neo-primary/40 hover:text-neo-text-primary"
                      }`}
                    >
                      {trainingModeActive ? "Detener rotación" : "Activar training"}
                    </button>
                  </div>
                  {currentTraining ? (
                    <div className="mt-3 space-y-2 text-sm text-neo-text-primary">
                      <p className="text-[12px] uppercase tracking-[0.4em] text-neo-text-secondary">{currentTraining.label}</p>
                      <p className="font-semibold">{currentTraining.question}</p>
                      <p className="text-[13px] text-neo-text-secondary">{currentTraining.answer}</p>
                      {currentTraining.snippet ? (
                        <pre className="rounded-2xl border border-neo-border bg-white/80 p-3 text-[12px] leading-relaxed dark:border-slate-800 dark:bg-slate-900/80">
                          {currentTraining.snippet}
                        </pre>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-neo-text-secondary">Busca un término para generar entrenamiento inmediato.</p>
                  )}
                </section>
                {hint ? <p className="text-xs text-neo-primary">{hint}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-neo-text-secondary">No encontramos coincidencias. Ajusta la búsqueda.</p>
            )}
          </article>
          <aside className="space-y-4">
            <section className="rounded-2xl border border-neo-border bg-neo-surface p-4 text-xs text-neo-text-secondary dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Atajos rápidos</p>
              <ul className="mt-2 space-y-1">
                <li>⌘/Ctrl + B · Copiar snippet</li>
                <li>⌘/Ctrl + 1 · Copiar speech ES</li>
                <li>⌘/Ctrl + 2 · Copy speech EN</li>
              </ul>
            </section>
            {term ? (
              <SoftSkillsPanel tags={term.tags ?? []} variant={resolvedTheme === "dark" ? "dark" : "light"} />
            ) : null}
          </aside>
        </section>
      </div>
    </div>
  );
}

function buildInterviewResponse(
  term: TermDTO,
  meaning: { es: string; en: string },
  usage: { es: string; en: string },
  language: "es" | "en",
  options: ResponseTemplateOptions = {},
) {
  const template = responseTemplates[language];
  const replacements: Record<string, string> = {
    term: term.term,
    meaningEs: meaning.es,
    meaningEn: meaning.en,
    usageEs: usage.es,
    usageEn: usage.en,
    category: term.category,
    roleContext: options.roleContext ?? "profesional técnico",
    impactMetric: options.impactMetric ?? "impacto positivo en métricas clave",
  };
  return template.replace(/\{(\w+)\}/g, (_, key) => replacements[key] ?? "");
}

function useDebounce<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}
