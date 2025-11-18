"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { QuizAttemptDTO, QuizTemplateDTO } from "@/types/quiz";

export default function TrainingPage() {
  const [quizzes, setQuizzes] = useState<QuizTemplateDTO[]>([]);
  const [attempts, setAttempts] = useState<QuizAttemptDTO[]>([]);
  const [selected, setSelected] = useState<QuizTemplateDTO | null>(null);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "ready">("idle");
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/quizzes?limit=8", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        const items = Array.isArray(payload?.items) ? (payload.items as QuizTemplateDTO[]) : [];
        setQuizzes(items);
        if (!selected && items.length) {
          setSelected(items[0]);
        }
      })
      .catch((err) => setError(err?.message || "No se pudieron cargar los retos"));
  }, [selected]);

  useEffect(() => {
    refreshAttempts();
  }, []);

  useEffect(() => {
    if (selected) {
      const next: Record<number, number | null> = {};
      selected.items.forEach((_, index) => {
        next[index] = null;
      });
      setAnswers(next);
      setResult(null);
    }
  }, [selected?.id]);

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
    const total = selected.items.length;
    const score = selected.items.reduce((acc, item, index) => {
      return acc + (item.answerIndex === answers[index] ? 1 : 0);
    }, 0);
    const payload = {
      templateId: selected.id,
      score,
      totalQuestions: total,
      answers: selected.items.map((item, index) => ({
        question: item.questionEs,
        selectedIndex: answers[index],
        correctIndex: item.answerIndex,
      })),
    };
    try {
      const res = await fetch("/api/quizzes/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("No se pudo registrar el intento");
      setResult({ score, total });
      await refreshAttempts();
      setStatus("ready");
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Intento fallido");
      setStatus("idle");
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-ink-950 via-ink-900 to-ink-950 px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
        <section className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 lg:w-1/3">
          <header className="mb-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Modo entrenamiento</p>
            <h1 className="text-2xl font-semibold">Quizzes guiados</h1>
            <p className="text-sm text-white/60">Selecciona un quiz y responde acompañado de explicaciones.</p>
          </header>
          {error ? <p className="text-xs text-accent-danger">{error}</p> : null}
          <ul className="space-y-3">
            {quizzes.map((quiz) => {
              const active = selected?.id === quiz.id;
              return (
                <li key={quiz.id}>
                  <button
                    type="button"
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      active ? "border-accent-secondary/70 bg-white/10" : "border-white/10 hover:border-white/30"
                    }`}
                    onClick={() => setSelected(quiz)}
                  >
                    <p className="font-semibold">{quiz.title}</p>
                    <p className="text-xs text-white/60">{quiz.description}</p>
                  </button>
                </li>
              );
            })}
          </ul>
          <section className="mt-6 rounded-2xl border border-white/10 bg-ink-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">Historial</p>
            <ul className="mt-3 space-y-2 text-xs text-white/70">
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
        <section className="flex-1 rounded-3xl border border-white/10 bg-ink-900/60 p-6" ref={containerRef}>
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
            />
          ) : (
            <p className="text-sm text-white/60">Selecciona un quiz para comenzar.</p>
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
};

function QuizDetail({ quiz, answers, onSelect, onSubmit, disabled, result }: QuizDetailProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-white/60">{quiz.difficulty.toUpperCase()} · {quiz.tags.join(", ")}</p>
        <h2 className="text-2xl font-semibold">{quiz.title}</h2>
        <p className="text-sm text-white/60">{quiz.description}</p>
      </header>
      <ol className="space-y-4">
        {quiz.items.map((item, index) => (
          <li key={`${quiz.id}-${index}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">{index + 1}. {item.questionEs}</p>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              {item.options.map((option, optionIndex) => {
                const checked = answers[index] === optionIndex;
                return (
                  <label key={`${quiz.id}-${index}-${optionIndex}`} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-ink-900/40 px-3 py-2">
                    <input
                      type="radio"
                      className="accent-accent-secondary"
                      checked={checked}
                      onChange={() => onSelect(index, optionIndex)}
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {result ? (
              <p className="mt-3 text-xs text-white/60">
                Correcta: {item.options[item.answerIndex]} · {item.explanationEs}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={onSubmit}
          disabled={disabled}
        >
          Enviar respuestas
        </button>
        {result ? (
          <span className="text-sm text-white/80">
            Obtuviste {result.score} de {result.total} respuestas correctas.
          </span>
        ) : (
          <span className="text-xs text-white/50">Responde todas las preguntas para habilitar el envío.</span>
        )}
      </div>
    </div>
  );
}
