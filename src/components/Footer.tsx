"use client";

import React from "react";
import { ArrowRight, Github, Heart, Link2, Linkedin, Twitter } from "lucide-react";
import { ThemeLogo } from "./ThemeLogo";

type FooterVariant = "neo" | "slate";

type FooterProps = {
  variant?: FooterVariant;
};

export default function Footer({ variant = "neo" }: FooterProps) {
  const isNeo = variant === "neo";

  return (
    <footer
      className={`relative overflow-hidden mt-16 2xl:mt-20 pt-12 ${isNeo
        ? "border-t border-neo-border/50 bg-neo-bg/95"
        : "border-t border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-950 dark:bg-[radial-gradient(circle_at_20%_-20%,rgba(16,185,129,0.14),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.14),transparent_60%)]"
        }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-px ${isNeo ? "bg-linear-to-r from-transparent via-neo-primary/50 to-transparent" : "bg-gradient-to-r from-transparent via-slate-900/10 dark:via-emerald-500/40 to-transparent"
          }`}
      />
      <div
        className={`absolute -top-48 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-[110px] ${isNeo ? "bg-neo-primary/10" : "hidden dark:block bg-emerald-500/10"
          }`}
      />

      <div className="relative mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8 2xl:px-12">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 2xl:gap-16 items-start">
          {/* Left Section - Branding & Info */}
          <div className="space-y-4 w-full min-w-0">
            {/* Logo & Title */}
            <div
              className={`inline-flex items-center gap-4 rounded-3xl px-5 py-3 backdrop-blur-xl ${isNeo
                ? "border border-neo-border/70 bg-neo-card/70 shadow-inner shadow-black/10"
                : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-none dark:shadow-inner dark:shadow-black/30 ring-1 ring-slate-100 dark:ring-white/10"
                }`}
            >
              <ThemeLogo
                width={64}
                height={64}
                className="h-11 w-11 shrink-0 lg:h-14 lg:w-14 xl:h-16 xl:w-16"
              />
              <div className="min-w-0">
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300 font-bold leading-none mb-0.5">
                    Diccionario
                  </p>
	                  <span className={`text-xl font-bold tracking-tight leading-none ${isNeo ? "text-neo-text-primary" : "text-slate-900 dark:text-white"}`}>
	                    <span className={isNeo ? "text-neo-primary" : "text-emerald-600 dark:text-indigo-300"}>Dev</span>
	                  </span>
	                </div>
                <p className={`text-xs lg:text-sm font-bold mt-1 ${isNeo ? "text-neo-text-secondary" : "text-slate-600 dark:text-slate-400"}`}>IA semántica para shipping serio</p>
              </div>
            </div>

            {/* Description */}
            <p className={`text-sm lg:text-base font-medium leading-relaxed ${isNeo ? "text-neo-text-secondary" : "text-slate-700 dark:text-slate-400"}`}>
              Respuestas accionables con contexto bilingüe y snippets listos para producción.
            </p>

            {/* Feature Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 2xl:gap-3 text-[11px] lg:text-xs">
              {["Semántico ES/EN", "Snippets auditados", "Previews de código", "Modos: Concepto / Entrevista / Debug"].map((chip) => (
                <span
                  key={chip}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-bold ${isNeo ? "border-neo-border/70 bg-neo-card/60 text-neo-text-secondary" : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300"
                    } w-full justify-start`}
                >
	                  <span
	                    className={`h-1.5 w-1.5 rounded-full ${isNeo ? "bg-neo-primary" : "bg-emerald-500 dark:bg-emerald-400"
	                      } shrink-0`}
	                  />
	                  <span className="break-words">{chip}</span>
	                </span>
	              ))}
            </div>
          </div>

          {/* Right Section - CTA Buttons */}
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Primary CTA */}
	              <a
	                href="/"
	                className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm lg:text-base font-semibold text-white shadow-none dark:shadow-lg transition-all hover:-translate-y-0.5 ${isNeo
	                  ? "bg-linear-to-r from-neo-primary to-neo-accent-purple"
	                  : "bg-gradient-to-r from-emerald-500 to-indigo-500"
	                  } active:scale-[0.98] whitespace-nowrap sm:col-span-2`}
	              >
	                Abrir app
	                <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
	              </a>

              {/* Secondary CTAs */}
              <a
                href="#extensions"
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm lg:text-base font-bold transition-all ${isNeo
                  ? "border-neo-border bg-neo-card/60 text-neo-text-primary hover:border-neo-primary/50 hover:bg-neo-card/80 hover:text-white"
                  : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-200 hover:border-slate-900 dark:hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-black dark:hover:text-white"
                  } active:scale-[0.98] dark:hover:shadow-lg dark:hover:shadow-black/20 whitespace-nowrap`}
              >
                Ver extensiones
              </a>

              <a
                href="/docs"
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm lg:text-base font-bold transition-all ${isNeo
                  ? "border-neo-border/70 text-neo-text-primary hover:border-neo-primary/60 hover:bg-neo-card/80 hover:text-white"
                  : "border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-slate-900 dark:text-slate-200 hover:border-slate-900 dark:hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-black dark:hover:text-white"
                  } active:scale-[0.98] dark:hover:shadow-lg dark:hover:shadow-black/20 whitespace-nowrap`}
              >
                Documentación
              </a>

              {/* API Docs - Full Width */}
              <a
                href="/api/docs"
                className={`flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-xs lg:text-sm font-bold uppercase tracking-[0.14em] transition-all ${isNeo
                  ? "border-neo-border/70 text-neo-text-secondary hover:border-neo-primary/50 hover:text-neo-primary"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-300 hover:border-slate-900 dark:hover:border-emerald-500/50 hover:text-slate-900 dark:hover:text-emerald-200"
                  } active:scale-[0.98] dark:hover:shadow-lg dark:hover:shadow-black/20 whitespace-nowrap sm:col-span-2`}
              >
                <Link2 className="h-4 w-4 lg:h-5 lg:w-5" />
                API Docs
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright & Social */}
        <div
          className={`mt-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 border-t pt-6 pb-6 text-sm lg:text-base font-medium ${isNeo ? "border-neo-border/30 text-neo-text-secondary" : "border-slate-200 dark:border-slate-800/70 text-slate-600 dark:text-slate-400"
            } items-center`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 justify-center md:justify-start">
            <span className="flex items-center gap-2">
              <Heart className={`h-4 w-4 lg:h-5 lg:w-5 shrink-0 ${isNeo ? "text-neo-accent-pink" : "text-rose-400"}`} />
              <span className="text-center sm:text-left">&copy; {new Date().getFullYear()} Diccionario Dev</span>
            </span>
            <span className="hidden sm:inline text-slate-600">—</span>
            <span className="text-center sm:text-left">IA semántica para shipping serio.</span>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-3">
            <SocialLink variant={variant} href="https://github.com" label="GitHub" icon={<Github className="h-4 w-4 sm:h-5 sm:w-5" />} />
            <SocialLink variant={variant} href="https://twitter.com" label="Twitter" icon={<Twitter className="h-4 w-4 sm:h-5 sm:w-5" />} />
            <SocialLink variant={variant} href="https://linkedin.com" label="LinkedIn" icon={<Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />} />
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ variant = "neo", href, icon, label }: { variant?: FooterVariant; href: string; icon: React.ReactNode; label: string }) {
  const isNeo = variant === "neo";
  return (
    <a
      href={href}
      aria-label={label}
      className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition hover:-translate-y-0.5 ${isNeo
        ? "border-neo-border bg-neo-card/60 text-neo-text-secondary hover:border-neo-primary/60 hover:text-neo-primary"
        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-slate-500 dark:text-slate-300 hover:border-slate-900 dark:hover:border-emerald-500/50 hover:text-slate-900 dark:hover:text-emerald-200"
        }`}
    >
      {icon}
    </a>
  );
}
