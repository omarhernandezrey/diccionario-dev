"use client";

import { availableLocales, useI18n } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      <span className="hidden sm:inline">{t("language.label")}</span>
      <div role="group" className="inline-flex overflow-hidden rounded-full" aria-label={t("language.label")}>
        {availableLocales.map(({ code, label }) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              className={`px-3 py-1 text-xs font-semibold transition ${
                active ? "bg-white/90 text-ink-900" : "text-white/70 hover:bg-white/10"
              }`}
              aria-pressed={active}
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
