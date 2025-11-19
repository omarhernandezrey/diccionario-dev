'use client';

import Link from "next/link";
import { MdOutlineSecurity, MdSpeed } from "react-icons/md";
import { TbCloudLock, TbStack } from "react-icons/tb";
import { useMemo, useState, useEffect } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SearchBox from "@/components/SearchBox";
import MarketingLanding from "@/components/MarketingLanding";
import { useI18n } from "@/lib/i18n";

const featureHighlights = [
  {
    titleKey: "landing.highlights.rate.title",
    descriptionKey: "landing.highlights.rate.description",
    Icon: MdSpeed,
  },
  {
    titleKey: "landing.highlights.history.title",
    descriptionKey: "landing.highlights.history.description",
    Icon: MdOutlineSecurity,
  },
  {
    titleKey: "landing.highlights.stack.title",
    descriptionKey: "landing.highlights.stack.description",
    Icon: TbStack,
  },
  {
    titleKey: "landing.highlights.ops.title",
    descriptionKey: "landing.highlights.ops.description",
    Icon: TbCloudLock,
  },
];

export default function HomePage() {
  const { t } = useI18n();
  const [activePulse, setActivePulse] = useState(0);
const pulses = useMemo(
  () => [
    { label: t("landing.pulse.users"), value: "8.2K" },
    { label: t("landing.pulse.terms"), value: "1.5K" },
    { label: t("landing.pulse.response"), value: "30ms" },
  ],
  [t],
);

const heroTags = ["#fetch", "#REST", "#GraphQL", "#semántica", "#devtools"];

const benefitCards = [
  { title: "Observabilidad inmediata", description: "Mapea intentos fallidos y performance en <20ms.", gradient: "bg-grad-1" },
  { title: "Colección verificada", description: "Cada término revisado con reseñas, snippets y variantes.", gradient: "bg-grad-2" },
  { title: "Automatización segura", description: "Webhooks, role-based access y auditoría distribuida.", gradient: "bg-grad-3" },
];

  const [hasQuery, setHasQuery] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q")?.trim() || "";
    setHasQuery(q.length > 1);
    const handler = () => {
      const p = new URLSearchParams(window.location.search);
      const nq = p.get("q")?.trim() || "";
      setHasQuery(nq.length > 1);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const containerClass = hasQuery
    ? "min-h-screen bg-gradient-to-b from-ink-900 via-ink-800/70 to-ink-900 text-white"
    : "min-h-screen bg-neo-bg text-neo-text-primary";

  return (
    <div className={containerClass}>
      {!hasQuery ? (
        <div className="relative isolate overflow-hidden bg-gradient-to-b from-white via-neo-surface to-neo-bg">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-[-5%] top-10 h-64 w-64 rounded-full bg-neo-accent-pink/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-neo-accent-cyan/30 blur-3xl" />
            <div className="absolute inset-x-0 top-40 mx-auto h-64 w-64 rounded-full bg-neo-primary/15 blur-3xl" />
          </div>
          <div className="relative pt-24">
            <MarketingLanding />
            <div className="mx-auto mt-20 max-w-4xl px-4">
              <SearchBox variant="light" />
            </div>
            <div className="mx-auto mt-10 max-w-4xl px-4">
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-neo-text-primary">
                {heroTags.map((tag) => (
                  <span key={tag} className="motion-elevate cursor-default rounded-full border border-white/20 bg-white/90 px-3 py-1 text-sm text-ink-900 shadow-sm transition">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <section className="mx-auto mt-10 max-w-6xl px-4 motion-fade-up">
              <div className="grid gap-4 md:grid-cols-3">
                {pulses.map((pulse, index) => (
                  <article
                    key={pulse.label}
                    className={`motion-card border border-white/10 bg-white/70 text-ink-900 shadow-xl transition ${activePulse === index ? "border-accent-secondary/60" : ""}`}
                    onMouseEnter={() => setActivePulse(index)}
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-ink-600">{pulse.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{pulse.value}</p>
                    <p className="text-xs text-ink-500">Actualizado hace segundos</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="mx-auto mt-12 max-w-6xl px-4 motion-fade-up">
              <div className="grid gap-6 md:grid-cols-3">
                {benefitCards.map((card) => (
                  <article
                    key={card.title}
                    className={`motion-card border-0 bg-gradient-to-br ${card.gradient} text-white shadow-lg`}
                  >
                    <p className="text-xs uppercase tracking-[0.4em]">Beneficio</p>
                    <h3 className="mt-2 text-xl font-semibold">{card.title}</h3>
                    <p className="mt-1 text-sm text-white/90">{card.description}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="mx-auto mt-16 max-w-6xl px-4">
              <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-8 motion-elevate">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-white/70">Panel Admin</p>
                    <h3 className="text-2xl font-semibold text-white">Muestra mínima</h3>
                    <p className="text-sm text-white/70">
                      Acceso seguro, métricas limpias y un layout minimalista listo para operar sin distracciones.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/admin" className="btn-primary text-sm">
                      Acceder
                    </Link>
                    <Link href="/admin/access" className="btn-ghost text-sm">
                      Seguridad
                    </Link>
                  </div>
                </div>
              </div>
            </section>
            <footer className="mx-auto mt-16 max-w-6xl px-4">
              <div className="rounded-3xl border border-black/30 bg-black bg-opacity-60 p-6 text-white/80 shadow-2xl">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold">Diccionario Dev</span>
                  <p className="text-xs text-white/60">Diseñado con precisión para equipos de producto exigentes. Inspirado en Raycast.</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        <>
          <header className="relative isolate overflow-hidden px-4 pb-16 pt-12 sm:px-8">
            <div className="absolute inset-0 -z-10 opacity-60 blur-3xl">
              <div className="absolute left-1/3 top-0 h-64 w-64 rounded-full bg-accent-primary/40" />
              <div className="absolute right-10 top-10 h-48 w-48 rounded-full bg-accent-secondary/30" />
            </div>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
              <nav className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/80">
                <span className="font-semibold tracking-wide">Diccionario Dev</span>
                <LanguageSwitcher />
              </nav>
              <div className="space-y-6">
                <span className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                  {t("hero.badge")}
                </span>
                <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">{t("search.title")}</h1>
                <p className="text-lg text-white/70">{t("search.subtitle")}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="#search" className="btn-primary text-sm">
                    {t("hero.primaryCta")}
                  </Link>
                  <Link href="/admin" className="btn-ghost text-sm">
                    {t("hero.secondaryCta")}
                  </Link>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-white/60">
                  {pulses.map((pulse, index) => (
                    <button
                      key={pulse.label}
                      type="button"
                      onMouseEnter={() => setActivePulse(index)}
                      className={`rounded-full border px-3 py-1 transition ${
                        activePulse === index ? "border-accent-secondary/80 bg-accent-secondary/20 text-white" : "border-white/10 bg-white/5"
                      }`}
                    >
                      <strong className="mr-1 text-white/90">{pulse.value}</strong> {pulse.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-10">
                <SearchBox />
              </div>
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-16 sm:px-8">
            <Highlights />
          </main>
        </>
      )}
    </div>
  );
}

function Highlights() {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const cards = useMemo(
    () =>
      featureHighlights.map(({ titleKey, descriptionKey, Icon }, index) => ({
        title: t(titleKey),
        description: t(descriptionKey),
        Icon,
        active: index === activeIndex,
      })),
    [activeIndex, t],
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wide text-white/60">{t("landing.highlights.header")}</p>
        <h2 className="text-2xl font-semibold text-white">{t("landing.highlights.title")}</h2>
      </header>
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map(({ title, description, Icon, active }, index) => (
            <article
              key={title}
              onMouseEnter={() => setActiveIndex(index)}
              className={`rounded-3xl border p-5 transition ${
                active ? "border-accent-secondary/70 bg-accent-secondary/10 shadow-glow-card" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3 text-white">
                <Icon aria-hidden className={active ? "text-accent-secondary" : "text-white/60"} size={24} />
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <p className="mt-2 text-sm text-white/70">{description}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-6 shadow-glow-card">
          <p className="badge-pill w-fit">{t("landing.admin.badge")}</p>
          <h3 className="text-2xl font-semibold text-white">{t("landing.admin.title")}</h3>
          <p className="text-sm text-white/70">{t("landing.admin.description")}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="btn-primary text-sm">
              {t("landing.admin.cta")}
            </Link>
            <Link href="/admin/access" className="btn-ghost text-sm">
              {t("landing.admin.secondCta")}
            </Link>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            <p className="font-semibold text-white">{t("landing.admin.metrics")}</p>
            <p className="text-xs">{t("landing.admin.metricsDescription")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
