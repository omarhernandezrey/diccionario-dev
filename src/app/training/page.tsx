"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "@/components/admin/SessionProvider";
import type { QuizAttemptDTO, QuizTemplateDTO } from "@/types/quiz";

export default function TrainingPage() {
  const pathname = usePathname() || "";
  const { session, loading: sessionLoading } = useSession();
  const [quizzes, setQuizzes] = useState<QuizTemplateDTO[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttemptDTO[]>([]);
  const [selected, setSelected] = useState<QuizTemplateDTO | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "ready">("idle");
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const containerRef = useRef<HTMLDivElement>(null);
  const hasFilters = filterDifficulty !== "all" || filterTag !== "all";

  useEffect(() => {
    fetchQuizzes(0);
  }, []);

  // Persistencia de respuestas
  useEffect(() => {
    if (!selected) return;
    const key = `quiz_progress_${selected.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed);
      } catch {
        // Ignorar error de parseo
      }
    }
  }, [selected]);

  useEffect(() => {
    if (!selected || Object.keys(answers).length === 0) return;
    const key = `quiz_progress_${selected.id}`;
    localStorage.setItem(key, JSON.stringify(answers));
  }, [answers, selected]);

  async function fetchQuizzes(currentOffset: number) {
    if (currentOffset === 0) setLoadingQuizzes(true);
    else setLoadingMore(true);

    try {
      const res = await fetch(`/api/quizzes?limit=8&offset=${currentOffset}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      const items = Array.isArray(payload?.items) ? (payload.items as QuizTemplateDTO[]) : [];

      setQuizzes((prev) => (currentOffset === 0 ? items : [...prev, ...items]));
      setHasMore(items.length === 8);
      setOffset(currentOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los retos");
    } finally {
      setLoadingQuizzes(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!selected && quizzes.length) {
      setSelected(quizzes[0]);
    }
  }, [quizzes, selected]);

  useEffect(() => {
    refreshAttempts();
  }, []);

  useEffect(() => {
    if (!selected) {
      setAnswers({});
      setResult(null);
      return;
    }
    // Solo inicializar si no hay respuestas cargadas (la persistencia se encarga de cargar)
    setResult(null);
  }, [selected]);

  const allAnswered = useMemo(() => {
    if (!selected) return false;
    return selected.items.every((_, index) => typeof answers[index] === "number");
  }, [selected, answers]);

  async function refreshAttempts() {
    try {
      // Fetch more attempts to calculate best scores client-side
      const res = await fetch(`/api/quizzes/attempts?limit=50&t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Historial no disponible");
      const payload = await res.json();
      setAttempts(Array.isArray(payload?.items) ? (payload.items as QuizAttemptDTO[]) : []);
    } catch (err) {
      console.warn(err);
    }
  }

  const bestScores = useMemo(() => {
    const scores: Record<number, number> = {};
    attempts.forEach((attempt) => {
      const currentBest = scores[attempt.templateId] || 0;
      const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
      if (percentage > currentBest) {
        scores[attempt.templateId] = percentage;
      }
    });
    return scores;
  }, [attempts]);

  async function submit() {
    if (!selected || !allAnswered) return;
    setStatus("submitting");

    // Prepare simple payload with just the selected indices
    const userAnswers = selected.items.map((_, index) => answers[index]);

    const payload = {
      templateId: selected.id,
      userAnswers,
    };

    try {
      const res = await fetch("/api/quizzes/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("No se pudo registrar el intento");

      const data = await res.json();
      const attempt = data.item as QuizAttemptDTO;

      setResult({ score: attempt.score, total: attempt.totalQuestions });
      await refreshAttempts();
      setStatus("ready");
      // Limpiar progreso guardado al finalizar con éxito
      localStorage.removeItem(`quiz_progress_${selected.id}`);
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Intento fallido");
      setStatus("idle");
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
    setStatus("idle");
    if (selected) {
      localStorage.removeItem(`quiz_progress_${selected.id}`);
    }
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchDiff = filterDifficulty === "all" || q.difficulty === filterDifficulty;
      const matchTag =
        filterTag === "all" || q.tags.some((t) => t.toLowerCase() === filterTag.toLowerCase());
      return matchDiff && matchTag;
    });
  }, [quizzes, filterDifficulty, filterTag]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    quizzes.forEach((q) => q.tags.forEach((t) => tags.add(t.toLowerCase())));
    return Array.from(tags).sort();
  }, [quizzes]);

  const emptyQuizzesCopy = !quizzes.length
    ? "Todavia no hay quizzes disponibles. Recarga en unos segundos."
    : hasFilters
      ? "No hay quizzes que coincidan con los filtros."
      : "No hay quizzes disponibles en este momento.";

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

  return (
    <main className="min-h-screen bg-neo-bg px-4 py-10 text-neo-text-primary">
      <nav className="mx-auto mb-6 flex w-full max-w-6xl flex-wrap items-center gap-2">
        {quickLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${active
                ? "border-neo-primary bg-linear-to-r from-neo-primary to-neo-accent-purple text-white shadow-lg shadow-neo-primary/30"
                : "border-neo-border bg-neo-surface text-neo-text-secondary hover:border-neo-primary/40 hover:text-neo-text-primary"
                }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
        <section className="w-full rounded-3xl border border-neo-border bg-neo-card p-6 shadow-xl lg:w-1/3">
          <header className="mb-4">
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Modo entrenamiento</p>
            <h1 className="text-2xl font-semibold text-neo-text-primary">Quizzes de Entrenamiento</h1>
            <p className="text-sm text-neo-text-secondary">Selecciona un quiz y responde acompañado de explicaciones.</p>
          </header>

          {/* Filtros */}
          <div className="mb-4 flex flex-wrap gap-2">
            <select
              className="rounded-xl border border-neo-border bg-neo-surface px-3 py-2 text-xs text-neo-text-primary focus:outline-none"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
            >
              <option value="all">Dificultad: Todas</option>
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
            <select
              className="rounded-xl border border-neo-border bg-neo-surface px-3 py-2 text-xs text-neo-text-primary focus:outline-none"
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
            >
              <option value="all">Tema: Todos</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag} className="capitalize">
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {error ? <p className="text-xs text-accent-danger">{error}</p> : null}
          <ul className="space-y-3">
            {loadingQuizzes ? (
              Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="h-20 w-full animate-pulse rounded-2xl bg-neo-surface" />
              ))
            ) : filteredQuizzes.length > 0 ? (
              <>
                {filteredQuizzes.map((quiz) => {
                  const active = selected?.id === quiz.id;
                  const bestScore = bestScores[quiz.id];

                  return (
                    <li key={quiz.id}>
                      <button
                        type="button"
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${active
                          ? "border-neo-primary bg-neo-primary-light text-neo-text-primary shadow-lg shadow-neo-primary/25"
                          : "border-neo-border hover:border-neo-primary hover:bg-neo-surface"
                          }`}
                        onClick={() => setSelected(quiz)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-neo-text-primary">{quiz.title}</p>
                          {bestScore !== undefined && (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                              Mejor: {bestScore}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neo-text-secondary">{quiz.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {quiz.tags.map((t) => (
                            <span key={t} className="rounded bg-neo-surface px-1.5 py-0.5 text-[10px] text-neo-text-secondary border border-neo-border">
                              {t}
                            </span>
                          ))}
                        </div>
                      </button>
                    </li>
                  );
                })}
                {hasMore && filterDifficulty === "all" && filterTag === "all" && (
                  <li>
                    <button
                      onClick={() => fetchQuizzes(offset + 8)}
                      disabled={loadingMore}
                      className="w-full rounded-xl border border-dashed border-neo-border p-3 text-xs font-medium text-neo-text-secondary hover:border-neo-primary hover:text-neo-primary disabled:opacity-50"
                    >
                      {loadingMore ? "Cargando..." : "Cargar más quizzes"}
                    </button>
                  </li>
                )}
              </>
            ) : (
              <li className="rounded-2xl border border-dashed border-neo-border p-8 text-center">
                <p className="text-sm text-neo-text-secondary">{emptyQuizzesCopy}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {hasFilters ? (
                    <button
                      type="button"
                      className="rounded-full border border-neo-border bg-neo-surface px-3 py-1 text-xs font-semibold text-neo-text-secondary transition hover:border-neo-primary hover:text-neo-primary"
                      onClick={() => {
                        setFilterDifficulty("all");
                        setFilterTag("all");
                      }}
                    >
                      Limpiar filtros
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full border border-neo-border bg-neo-surface px-3 py-1 text-xs font-semibold text-neo-text-secondary transition hover:border-neo-primary hover:text-neo-primary"
                    onClick={() => fetchQuizzes(0)}
                  >
                    Reintentar
                  </button>
                </div>
              </li>
            )}
          </ul>
          <section className="mt-6 rounded-2xl border border-neo-border bg-neo-surface p-4">
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Historial</p>
            <ul className="mt-3 space-y-2 text-xs text-neo-text-secondary">
              {attempts.length ? (
                attempts.slice(0, 5).map((attempt) => (
                  <li key={attempt.id} className="flex items-center justify-between">
                    <span className="truncate pr-2">{attempt.templateTitle}</span>
                    <span>
                      {attempt.score}/{attempt.totalQuestions}
                    </span>
                  </li>
                ))
              ) : (
                <li>No hay intentos recientes. Completa un quiz para que aparezcan aqui.</li>
              )}
            </ul>
          </section>
        </section>
        <section className="flex-1 rounded-3xl border border-neo-border bg-neo-card p-6 shadow-xl" ref={containerRef}>
          {selected ? (
            <QuizDetail
              quiz={selected}
              answers={answers}
              onSelect={(questionIndex, optionIndex) =>
                setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }))
              }
              onSubmit={submit}
              disabled={!allAnswered || status === "submitting"}
              result={result}
              onRetry={handleRetry}
              status={status}
            />
          ) : (
            <p className="text-sm text-neo-text-secondary">Selecciona un quiz para comenzar.</p>
          )}
        </section>
      </div>
    </main>
  );
}

type QuizDetailProps = {
  quiz: QuizTemplateDTO;
  answers: Record<number, number | null>;
  onSelect: (questionIndex: number, optionIndex: number) => void;
  onSubmit: () => void;
  disabled: boolean;
  result: { score: number; total: number } | null;
  onRetry: () => void;
  status: "idle" | "submitting" | "ready";
};

function QuizDetail({ quiz, answers, onSelect, onSubmit, disabled, result, onRetry, status }: QuizDetailProps) {
  const answeredCount = useMemo(() => {
    if (!quiz || !quiz.items) return 0;
    return quiz.items.reduce((count, _, index) => {
      const val = answers[index];
      return val !== null && val !== undefined ? count + 1 : count;
    }, 0);
  }, [answers, quiz]);

  const progress = useMemo(() => {
    if (!quiz || !quiz.items.length) return 0;
    const pct = Math.round((answeredCount / quiz.items.length) * 100);
    return Math.min(100, Math.max(0, pct));
  }, [answeredCount, quiz]);

  const submitting = status === "submitting";

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">
            {quiz.difficulty.toUpperCase()} · {quiz.tags.join(", ")}
          </p>
          <div className="flex items-center gap-3 text-xs font-medium text-neo-text-secondary">
            <span>
              {answeredCount} / {quiz.items.length} ({progress}%)
            </span>
            <div className="h-3 w-32 overflow-hidden rounded-full bg-neo-surface border border-neo-border">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-neo-text-primary">{quiz.title}</h2>
        <p className="text-sm text-neo-text-secondary">{quiz.description}</p>
      </header>
      <ol className="space-y-4">
        {quiz.items.map((item, index) => (
          <li key={`${quiz.id}-${index}`} className="rounded-2xl border border-neo-border bg-neo-surface p-4">
            <p className="text-sm font-semibold text-neo-text-primary">{index + 1}. {item.questionEs}</p>
            <div className="mt-3 space-y-2 text-sm text-neo-text-secondary">
              {item.options.map((option, optionIndex) => {
                const isSelected = answers[index] === optionIndex;
                const isCorrect = item.answerIndex === optionIndex;

                let optionClass = "border-neo-border bg-neo-card text-neo-text-secondary hover:bg-neo-surface";

                if (result) {
                  if (isCorrect) {
                    optionClass = "border-2 border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold shadow-sm";
                  } else if (isSelected && !isCorrect) {
                    optionClass = "border-2 border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 font-medium shadow-sm";
                  } else {
                    optionClass = "border border-neo-border bg-white dark:bg-neo-card text-neo-text-secondary opacity-50 grayscale transition-opacity";
                  }
                } else if (isSelected) {
                  optionClass = "border-2 border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300 shadow-md shadow-blue-100 dark:shadow-blue-500/20 transform scale-[1.005]";
                }

                return (
                  <label
                    key={`${quiz.id}-${index}-${optionIndex}`}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 transition-all duration-200 ${optionClass}`}
                  >
                    <input
                      type="radio"
                      className="accent-neo-primary"
                      checked={isSelected}
                      onChange={() => !result && onSelect(index, optionIndex)}
                      disabled={!!result}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {result ? (
              <div className={`mt-3 rounded-xl p-4 text-sm border shadow-sm ${answers[index] === item.answerIndex ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-800" : "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200 dark:border-rose-800"}`}>
                <p className="font-bold mb-2 flex items-center gap-2 text-base">
                  {answers[index] === item.answerIndex ? (
                    <>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-sm shadow-sm">✓</span>
                      <span className="text-emerald-800 dark:text-emerald-100">¡Correcto!</span>
                    </>
                  ) : (
                    <>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white text-sm shadow-sm">✕</span>
                      <span className="text-rose-800 dark:text-rose-100">Incorrecto</span>
                    </>
                  )}
                </p>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium">{item.explanationEs}</p>
              </div>
            ) : null}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-neo-border">
        {!result ? (
          <button
            type="button"
            className="btn-primary"
            onClick={onSubmit}
            disabled={disabled}
          >
            {submitting ? "Enviando..." : "Enviar respuestas"}
          </button>
        ) : (
          <button
            type="button"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            onClick={onRetry}
          >
            Intentar de nuevo
          </button>
        )}

        {result ? (
          <span className="text-sm font-medium text-neo-text-primary">
            Resultado: <span className={result.score === result.total ? "text-accent-emerald" : "text-neo-primary"}>{result.score}/{result.total}</span> aciertos.
          </span>
        ) : submitting ? (
          <span className="text-xs text-neo-text-secondary" aria-live="polite">
            Calificando respuestas…
          </span>
        ) : (
          <span className="text-xs text-neo-text-secondary">
            {disabled ? "Responde todas las preguntas para enviar." : "¡Listo para enviar!"}
          </span>
        )}
      </div>
    </div>
  );
}
