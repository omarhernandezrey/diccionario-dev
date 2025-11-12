'use client';

import Link from "next/link";
import { FaDocker, FaNodeJs, FaReact } from "react-icons/fa";
import { MdOutlineSecurity, MdSpeed } from "react-icons/md";
import { SiNextdotjs, SiTailwindcss } from "react-icons/si";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import SearchBox from "@/components/SearchBox";
import TermsExplorer from "@/components/TermsExplorer";
import { useI18n } from "@/lib/i18n";

const heroStats = [
  { key: "hero.stats.curated", value: "400+" },
  { key: "hero.stats.updates", value: "120+" },
  { key: "hero.stats.coverage", value: "5+" },
];

const techStack = [
  { label: "React", Icon: FaReact },
  { label: "Next.js", Icon: SiNextdotjs },
  { label: "Node.js", Icon: FaNodeJs },
  { label: "Tailwind", Icon: SiTailwindcss },
  { label: "Docker", Icon: FaDocker },
];

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
    <div className="min-h-screen bg-gradient-to-b from-ink-900 via-ink-800/70 to-ink-900">
      <header className="relative isolate overflow-hidden px-6 pb-24 pt-16 sm:px-12">
        <div className="absolute inset-0 -z-10 opacity-60 blur-3xl">
          <div className="absolute left-1/3 top-0 h-64 w-64 rounded-full bg-accent-primary/40" />
          <div className="absolute right-10 top-10 h-48 w-48 rounded-full bg-accent-secondary/30" />
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <nav className="flex flex-wrap items-center justify-between gap-4 text-sm text-white/80">
            <span className="font-semibold tracking-wide">Diccionario Dev</span>
            <LanguageSwitcher />
          </nav>
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <span className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                {t("hero.badge")}
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                  {t("hero.title")}
                </span>
              </h1>
              <p className="text-lg text-white/70">{t("hero.subtitle")}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="#explorer" className="btn-primary text-sm">
                  {t("hero.primaryCta")}
                </Link>
                <Link href="/admin" className="btn-ghost text-sm">
                  {t("hero.secondaryCta")}
                </Link>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.key} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <dt className="text-xs uppercase tracking-wide text-white/60">{t(stat.key)}</dt>
                    <dd className="text-2xl font-semibold text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="glass-panel h-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-card">
              <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Stack confiable</p>
              <div className="mt-4 flex flex-wrap gap-4">
                {techStack.map(({ label, Icon }) => (
                  <div key={label} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/80">
                    <Icon aria-hidden size={20} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-4">
                {featureHighlights.map(({ titleKey, descriptionKey, Icon }) => (
                  <div key={titleKey} className="rounded-2xl border border-white/10 bg-ink-900/60 p-4">
                    <div className="flex items-center gap-3 text-white">
                      <Icon aria-hidden className="text-accent-secondary" size={22} />
                      <p className="font-semibold">{t(titleKey)}</p>
                    </div>
                    <p className="mt-2 text-sm text-white/70">{t(descriptionKey)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 sm:px-12">
        <SearchBox />
        <TermsExplorer />
        <AdminPreview />
      </main>
    </div>
  );
}

function AdminPreview() {
  const { t } = useI18n();
  return (
    <section className="glass-panel flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-900 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="badge-pill">{t("landing.admin.badge")}</p>
          <h2 className="text-2xl font-semibold text-white">{t("landing.admin.title")}</h2>
          <p className="text-sm text-white/70">{t("landing.admin.description")}</p>
        </div>
        <Link href="/admin" className="btn-primary text-sm">
          {t("landing.admin.cta")}
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard title={t("landing.admin.feature1Title")} description={t("landing.admin.feature1Description")} />
        <FeatureCard title={t("landing.admin.feature2Title")} description={t("landing.admin.feature2Description")} />
      </div>
    </section>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-lg font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-white/70">{description}</p>
    </div>
  );
}
