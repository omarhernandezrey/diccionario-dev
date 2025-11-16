"use client";

import { availableLocales, useI18n } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-ink-900/70 px-4 py-2 text-sm text-white/80 shadow-inner">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/60">
        <span aria-hidden="true">🌐</span>
        <span className="hidden sm:inline">{t("language.label")}</span>
        <span className="sm:hidden">{locale.toUpperCase()}</span>
      </span>
      <div role="radiogroup" className="flex rounded-xl bg-white/5 p-1 text-xs" aria-label={t("language.label")}>
        {availableLocales.map(({ code, label }) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={active}
              className={`min-w-[90px] rounded-lg px-3 py-1 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-secondary ${
                active ? "bg-white/90 text-slate-900 shadow-lg" : "text-white/70 hover:bg-white/10"
              }`}
              onClick={() => setLocale(code)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
