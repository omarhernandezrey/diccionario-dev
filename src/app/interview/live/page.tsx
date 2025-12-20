"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "@/components/admin/SessionProvider";
import type { TermDTO } from "@/types/term";
import SoftSkillsPanel from "@/components/SoftSkillsPanel";

export default function InterviewLivePage() {
  const pathname = usePathname() || "";
  const { session, loading: sessionLoading } = useSession();
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
    <div className="min-h-screen bg-neo-bg p-6 text-neo-text-primary">
      <nav className="mx-auto mb-6 flex w-full max-w-5xl flex-wrap items-center gap-2">
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
      <div className="mx-auto w-full max-w-5xl rounded-3xl border border-neo-border bg-white p-6 shadow-2xl shadow-neo-primary/10">
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
        <div className="mt-6 rounded-2xl border border-neo-border bg-neo-surface p-4">
          <input
            ref={inputRef}
            className="w-full bg-transparent text-2xl font-semibold text-neo-text-primary placeholder:text-neo-text-secondary focus:outline-none"
            placeholder="Busca un término o pega código"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <article className="rounded-2xl border border-neo-border bg-white/95 p-5 shadow-inner">
            {status === "idle" ? (
              <p className="text-sm text-neo-text-secondary">Escribe una palabra clave para preparar tu speech.</p>
            ) : status === "loading" ? (
              <p className="text-sm text-neo-text-secondary">Buscando…</p>
            ) : term ? (
              <div className="space-y-4">
                <header className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-semibold text-neo-text-primary">{term.term}</h2>
                    <p className="text-sm text-neo-text-secondary">{term.translation}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      className="rounded-2xl border border-neo-border bg-white px-4 py-2 font-semibold text-neo-text-primary transition hover:border-neo-primary hover:text-neo-primary"
                      type="button"
                      onClick={() => copyResponse("es")}
                    >
                      Copiar ES
                    </button>
                    <button
                      className="rounded-2xl border border-neo-border bg-white px-4 py-2 font-semibold text-neo-text-primary transition hover:border-neo-primary hover:text-neo-primary"
                      type="button"
                      onClick={() => copyResponse("en")}
                    >
                      Copy EN
                    </button>
                  </div>
                </header>
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-neo-border bg-neo-surface p-3">
                    <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Significado (ES)</p>
                    <p className="text-sm text-neo-text-primary/90">{meaning.es}</p>
                  </div>
                  <div className="rounded-2xl border border-neo-border bg-neo-surface p-3">
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
                <div className="rounded-2xl border border-neo-border bg-neo-surface/70 p-3 text-sm text-neo-text-primary/90">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Snippet base</p>
                    <button type="button" className="text-[11px] text-neo-primary underline-offset-2 hover:underline" onClick={copySnippet}>
                      Copiar
                    </button>
                  </div>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs">{term.variants?.[0]?.snippet ?? term.examples?.[0]?.code ?? "// No hay snippet"}</pre>
                </div>
                {hint ? <p className="text-xs text-neo-primary">{hint}</p> : null}
              </div>
            ) : (
              <p className="text-sm text-neo-text-secondary">No encontramos coincidencias. Ajusta la búsqueda.</p>
            )}
          </article>
          <aside className="space-y-4">
            <section className="rounded-2xl border border-neo-border bg-neo-surface p-4 text-xs text-neo-text-secondary">
              <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Atajos rápidos</p>
              <ul className="mt-2 space-y-1">
                <li>⌘/Ctrl + B · Copiar snippet</li>
                <li>⌘/Ctrl + 1 · Copiar speech ES</li>
                <li>⌘/Ctrl + 2 · Copy speech EN</li>
              </ul>
            </section>
            {term ? <SoftSkillsPanel tags={term.tags ?? []} variant="light" /> : null}
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
