"use client";

import { useEffect, useMemo, useState } from "react";
import type { SoftSkillTemplateDTO } from "@/types/soft-skills";

type SoftSkillsPanelProps = {
  tags: string[];
  variant?: "dark" | "light";
};

export default function SoftSkillsPanel({ tags, variant = "dark" }: SoftSkillsPanelProps) {
  const isLight = variant === "light";
  const tone = (light: string, dark: string) => (isLight ? light : dark);
  const [items, setItems] = useState<SoftSkillTemplateDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tagQuery = useMemo(() => tags.map((tag) => tag.toLowerCase()).join(","), [tags]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (tagQuery) params.set("tags", tagQuery);
    params.set("limit", "3");
    fetch(`/api/soft-skills?${params.toString()}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        setItems(Array.isArray(payload?.items) ? (payload.items as SoftSkillTemplateDTO[]) : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Sin plantillas disponibles");
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tagQuery]);

  if (!loading && !items.length && !error) {
    return null;
  }

  return (
    <section className={`rounded-2xl border p-4 ${tone("border-neo-border bg-white", "border-white/10 bg-ink-900/50")}`}>
      <header className="flex items-center justify-between gap-2">
        <p className={`text-xs uppercase tracking-wide ${tone("text-neo-text-secondary", "text-white/60")}`}>Soft skills</p>
        {loading ? <span className={`text-[11px] ${tone("text-neo-text-secondary", "text-white/50")}`}>Carga…</span> : null}
      </header>
      {error ? <p className={`mt-2 text-xs ${tone("text-neo-text-secondary", "text-accent-danger")}`}>{error}</p> : null}
      <div className="mt-3 space-y-3">
        {items.map((template) => (
          <article
            key={template.id}
            className={`rounded-xl border p-3 text-sm ${tone("border-neo-border bg-neo-surface text-neo-text-secondary", "border-white/10 bg-white/5 text-white/80")}`}
          >
            <div className="flex items-center justify-between gap-2">
              <strong className={tone("text-neo-text-primary", "text-white")}>{template.title}</strong>
              {template.scenario ? (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${tone("border-neo-border text-neo-text-secondary", "border-white/20 text-white/60")}`}
                >
                  {template.scenario}
                </span>
              ) : null}
            </div>
            <p className={`mt-1 text-xs ${tone("text-neo-text-secondary", "text-white/70")}`}>{template.questionEs}</p>
            {template.answerStructure.length ? (
              <ul className={`mt-2 space-y-1 text-[11px] ${tone("text-neo-text-secondary", "text-white/60")}`}>
                {template.answerStructure.map((step) => (
                  <li key={`${template.id}-${step.title}`}>
                    <span className={`font-semibold ${tone("text-neo-text-primary", "text-white/70")}`}>{step.title}:</span> {step.es}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(template.sampleAnswerEs)}
                className={`rounded-full border px-3 py-0.5 transition ${tone("border-neo-border text-neo-text-secondary hover:bg-neo-surface", "border-white/20 text-white/70 hover:border-white/40")}`}
              >
                Copiar ES
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(template.sampleAnswerEn)}
                className={`rounded-full border px-3 py-0.5 transition ${tone("border-neo-border text-neo-text-secondary hover:bg-neo-surface", "border-white/20 text-white/70 hover:border-white/40")}`}
              >
                Copy EN
              </button>
            </div>
            {template.tipsEs ? <p className={`mt-2 text-[11px] ${tone("text-neo-text-secondary", "text-white/50")}`}>Tip: {template.tipsEs}</p> : null}
          </article>
        ))}
        {!items.length && !loading ? (
          <p className={`text-xs ${tone("text-neo-text-secondary", "text-white/60")}`}>Aún no hay plantillas alineadas a esta búsqueda.</p>
        ) : null}
      </div>
    </section>
  );
}
