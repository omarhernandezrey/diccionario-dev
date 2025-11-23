"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { QuizAttemptDTO, QuizTemplateDTO } from "@/types/quiz";

export default function TrainingPage() {
  const [quizzes, setQuizzes] = useState<QuizTemplateDTO[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [attempts, setAttempts] = useState<QuizAttemptDTO[]>([]);
  const [selected, setSelected] = useState<QuizTemplateDTO | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "ready">("idle");
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoadingQuizzes(true);
    fetch("/api/quizzes?limit=8", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        const items = Array.isArray(payload?.items) ? (payload.items as QuizTemplateDTO[]) : [];
        setQuizzes(items);
      })
      .catch((err) => setError(err?.message || "No se pudieron cargar los retos"))
      .finally(() => setLoadingQuizzes(false));
  }, []);

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
    const next: Record<number, number | null> = {};
    selected.items.forEach((_, index) => {
      next[index] = null;
    });
    setAnswers(next);
    setResult(null);
  }, [selected]);

  const allAnswered = useMemo(() => {
    if (!selected) return false;
    return selected.items.every((_, index) => typeof answers[index] === "number");
  }, [selected, answers]);

  async function refreshAttempts() {
    try {
      const res = await fetch("/api/quizzes/attempts?limit=5", { cache: "no-store" });
      if (!res.ok) throw new Error("Historial no disponible");
      const payload = await res.json();
      setAttempts(Array.isArray(payload?.items) ? (payload.items as QuizAttemptDTO[]) : []);
    } catch (err) {
      console.warn(err);
    }
  }

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
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-neo-bg px-4 py-10 text-neo-text-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
        <section className="w-full rounded-3xl border border-neo-border bg-neo-card p-6 shadow-xl lg:w-1/3">
          <header className="mb-4">
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Modo entrenamiento</p>
            <h1 className="text-2xl font-bold text-accent-rose">PRUEBA DE NUEVA VISTA</h1>
            <p className="text-sm text-neo-text-secondary">Selecciona un quiz y responde acompañado de explicaciones.</p>
          </header>
          {error ? <p className="text-xs text-accent-danger">{error}</p> : null}
          <ul className="space-y-3">
            {loadingQuizzes ? (
              Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="h-20 w-full animate-pulse rounded-2xl bg-neo-surface" />
              ))
            ) : (
              quizzes.map((quiz) => {
                const active = selected?.id === quiz.id;
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
                      <p className="font-semibold text-neo-text-primary">{quiz.title}</p>
                      <p className="text-xs text-neo-text-secondary">{quiz.description}</p>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <section className="mt-6 rounded-2xl border border-neo-border bg-neo-surface p-4">
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Historial</p>
            <ul className="mt-3 space-y-2 text-xs text-neo-text-secondary">
              {attempts.length ? (
                attempts.map((attempt) => (
                  <li key={attempt.id} className="flex items-center justify-between">
                    <span className="truncate pr-2">{attempt.templateTitle}</span>
                    <span>
                      {attempt.score}/{attempt.totalQuestions}
                    </span>
                  </li>
                ))
              ) : (
                <li>No hay intentos recientes.</li>
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
};

function QuizDetail({ quiz, answers, onSelect, onSubmit, disabled, result, onRetry }: QuizDetailProps) {
  const answeredCount = Object.keys(answers).filter((k) => answers[Number(k)] !== null).length;
  const progress = Math.round((answeredCount / quiz.items.length) * 100);

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">{quiz.difficulty.toUpperCase()} · {quiz.tags.join(", ")}</p>
          <div className="flex items-center gap-2 text-xs font-medium text-neo-text-secondary">
            <span>{answeredCount} / {quiz.items.length}</span>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-neo-surface border border-neo-border">
              <div className="h-full bg-gradient-to-r from-neo-primary to-accent-secondary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
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
                    optionClass = "border-2 border-accent-emerald bg-accent-emerald/15 text-accent-emerald font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                  } else if (isSelected && !isCorrect) {
                    optionClass = "border-2 border-accent-rose bg-accent-rose/15 text-accent-rose font-medium";
                  } else {
                    optionClass = "border border-neo-border bg-neo-card text-neo-text-secondary opacity-40 grayscale";
                  }
                } else if (isSelected) {
                  optionClass = "border-2 border-neo-primary bg-neo-primary-light text-neo-text-primary shadow-md shadow-neo-primary/20 transform scale-[1.01]";
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
              <div className={`mt-3 rounded-lg p-3 text-xs ${answers[index] === item.answerIndex ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-rose/10 text-accent-rose"}`}>
                <p className="font-semibold mb-1">{answers[index] === item.answerIndex ? "¡Correcto!" : "Incorrecto"}</p>
                <p>{item.explanationEs}</p>
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
            Enviar respuestas
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={onRetry}
          >
            Intentar de nuevo
          </button>
        )}

        {result ? (
          <span className="text-sm font-medium text-neo-text-primary">
            Resultado: <span className={result.score === result.total ? "text-accent-emerald" : "text-neo-primary"}>{result.score}/{result.total}</span> aciertos.
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
