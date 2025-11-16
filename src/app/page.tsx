'use client';

import Link from "next/link";
import { MdOutlineSecurity, MdSpeed } from "react-icons/md";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import SearchBox from "@/components/SearchBox";
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
];

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-linear-to-b from-ink-900 via-ink-800/70 to-ink-900">
      <header className="relative isolate overflow-hidden px-4 pb-16 pt-12 sm:px-8 lg:px-12">
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
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">{t("search.title")}</h1>
            <p className="text-lg text-white/70">{t("search.subtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="#search" className="btn-primary text-sm">
                {t("hero.primaryCta")}
              </Link>
              <Link href="/admin" className="btn-ghost text-sm">
                {t("hero.secondaryCta")}
              </Link>
            </div>
          </div>
          <div className="mt-10">
            <SearchBox />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-16 sm:px-8 lg:px-12">
        <Highlights />
      </main>
    </div>
  );
}

function Highlights() {
  const { t } = useI18n();
  return (
    <section className="grid gap-6 md:grid-cols-2">
      {featureHighlights.map(({ titleKey, descriptionKey, Icon }) => (
        <article key={titleKey} className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3 text-white">
            <Icon aria-hidden className="text-accent-secondary" size={22} />
            <h3 className="text-lg font-semibold">{t(titleKey)}</h3>
          </div>
          <p className="mt-2 text-sm text-white/70">{t(descriptionKey)}</p>
        </article>
      ))}
      <article className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="badge-pill mb-2">{t("landing.admin.badge")}</p>
            <h3 className="text-lg font-semibold text-white">{t("landing.admin.title")}</h3>
            <p className="text-sm text-white/70">{t("landing.admin.description")}</p>
          </div>
          <Link href="/admin" className="btn-primary text-sm">
            {t("landing.admin.cta")}
          </Link>
        </div>
      </article>
    </section>
  );
}
