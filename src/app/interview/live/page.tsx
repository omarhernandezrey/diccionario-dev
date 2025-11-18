"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TermDTO } from "@/types/term";
import SoftSkillsPanel from "@/components/SoftSkillsPanel";

export default function InterviewLivePage() {
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState<TermDTO | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "empty">("idle");
  const [hint, setHint] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(query, 200);

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
      setStatus("idle");
      setTerm(null);
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
        setTerm(item ?? null);
        setStatus(item ? "ready" : "empty");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setStatus("empty");
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

  function copyResponse(lang: "es" | "en") {
    if (!term) return;
    const text = buildInterviewResponse(term, meaning, usage, lang);
    navigator.clipboard.writeText(text).then(() => {
      setHint(lang === "es" ? "Respuesta copiada en español" : "Answer copied in English");
      setTimeout(() => setHint(null), 2000);
    });
  }

  function copySnippet() {
    if (!term) return;
    const snippet = term.variants?.[0]?.snippet ?? term.examples?.[0]?.code ?? "";
    if (!snippet) return;
    navigator.clipboard.writeText(snippet).then(() => {
      setHint("Snippet copiado");
      setTimeout(() => setHint(null), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-ink-950 via-ink-900 to-ink-950 p-6 text-white">
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Modo entrevista en vivo</p>
            <h1 className="text-3xl font-semibold">Respuestas instantáneas</h1>
          </div>
          <div className="text-right text-xs text-white/60">
            <p>⌘/Ctrl + K · Enfocar</p>
            <p>⌘/Ctrl + 1 · Copiar ES</p>
            <p>⌘/Ctrl + 2 · Copy EN</p>
          </div>
        </header>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <input
            ref={inputRef}
            className="w-full bg-transparent text-2xl font-semibold placeholder:text-white/40 focus:outline-none"
            placeholder="Busca un término o pega código"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
            {status === "idle" ? (
              <p className="text-sm text-white/60">Escribe una palabra clave para preparar tu speech.</p>
            ) : status === "loading" ? (
              <p className="text-sm text-white/60">Buscando…</p>
            ) : term ? (
              <div className="space-y-4">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-semibold">{term.term}</h2>
                    <p className="text-sm text-white/60">{term.translation}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button className="btn-ghost" type="button" onClick={() => copyResponse("es")}>
                      Copiar ES
                    </button>
                    <button className="btn-ghost" type="button" onClick={() => copyResponse("en")}>
                      Copy EN
                    </button>
                  </div>
                </header>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-white/60">Significado (ES)</p>
                    <p className="text-sm text-white/80">{meaning.es}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-white/60">Meaning (EN)</p>
                    <p className="text-sm text-white/80">{meaning.en}</p>
                  </div>
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-white/60">Cómo lo usé</p>
                    <p className="text-sm text-white/80">{usage.es}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-white/60">How I pitch it</p>
                    <p className="text-sm text-white/80">{usage.en}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-wide text-white/60">Snippet base</p>
                    <button type="button" className="text-[11px] underline-offset-2 hover:underline" onClick={copySnippet}>
                      Copiar
                    </button>
                  </div>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs">{term.variants?.[0]?.snippet ?? term.examples?.[0]?.code ?? "// No hay snippet"}</pre>
                </div>
                {hint ? <p className="text-xs text-accent-secondary">{hint}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-white/60">No encontramos coincidencias. Ajusta la búsqueda.</p>
            )}
          </article>
          <aside className="space-y-4">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
              <p className="text-xs uppercase tracking-wide text-white/60">Atajos rápidos</p>
              <ul className="mt-2 space-y-1">
                <li>⌘/Ctrl + B · Copiar snippet</li>
                <li>⌘/Ctrl + 1 · Copiar speech ES</li>
                <li>⌘/Ctrl + 2 · Copy speech EN</li>
              </ul>
            </section>
            {term ? <SoftSkillsPanel tags={term.tags ?? []} /> : null}
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
) {
  if (language === "es") {
    return `Cuando me preguntan por ${term.term} respondo que ${meaning.es}. Lo uso así: ${usage.es}. Ese enfoque me ayudó en ${term.category}.`;
  }
  return `When I'm asked about ${term.term} I explain that ${meaning.en}. My go-to usage is ${usage.en}, especially in ${term.category} contexts.`;
}

function useDebounce<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}
