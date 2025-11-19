"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

export default function MarketingLanding() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="space-y-24">
      <Hero />
      <LogoStrip />
      <FeaturePairs />
      <InfoColumns />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-neo-border bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-neo-text-secondary">
        <span className="h-2 w-2 rounded-full bg-neo-primary" />
        Diccionario Dev
      </span>
      <h1 className="text-4xl font-semibold tracking-tight text-neo-text-primary sm:text-5xl">
        Diccionario técnico hecho para desarrolladores web
      </h1>
      <p className="max-w-2xl text-base text-neo-text-secondary">
        Traducciones, significados, snippets y respuestas instantáneas alineadas al dataset Prisma. Todo el contenido proviene del Diccionario Dev, listo para entrevistas, pair programming y documentación bilingüe.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="#search" className="btn-primary text-sm">
          Explorar términos
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-2xl border border-neo-border bg-white px-5 py-2 text-sm font-semibold text-neo-text-primary shadow-sm transition hover:border-neo-primary hover:text-neo-primary"
        >
          Ir al panel admin
        </Link>
      </div>
      <div className="mt-12 w-full rounded-[32px] bg-gradient-to-r from-neo-primary via-neo-accent-purple to-neo-accent-pink p-1 shadow-2xl shadow-neo-primary/30">
        <div className="flex h-full flex-col justify-between rounded-[28px] bg-white/95 p-6 text-left">
          <div className="text-sm font-semibold uppercase tracking-[0.35em] text-neo-text-secondary">Resumen Diccionario</div>
          <div className="mt-6 flex flex-col gap-2 text-left">
            <p className="text-3xl font-semibold text-neo-text-primary">+228%</p>
            <p className="text-sm text-neo-text-secondary">crecimiento semanal en consultas con la nueva interfaz</p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-left text-xs text-neo-text-secondary">
            <div>
              <p className="text-neo-text-primary">8.2K</p>
              <p>Usuarios activos</p>
            </div>
            <div>
              <p className="text-neo-text-primary">1.5K</p>
              <p>Términos</p>
            </div>
            <div>
              <p className="text-neo-text-primary">30ms</p>
              <p>Tiempo respuesta</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 text-center">
      <p className="text-sm uppercase tracking-wide text-neo-text-secondary">Equipos que confían en esta base</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-neo-text-secondary">
        {["Next.js", "Prisma", "Redis", "Expo", "Docker", "n8n"].map((logo) => (
          <span key={logo} className="text-xs font-semibold tracking-[0.35em] text-neo-text-secondary/70">
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}

function FeaturePairs() {
  return (
    <section className="mx-auto max-w-6xl space-y-16 px-4">
      <div className="grid items-center gap-10 rounded-[32px] border border-neo-border bg-white/80 p-8 shadow-lg shadow-neo-primary/5 md:grid-cols-2">
        <div className="space-y-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-neo-text-secondary">Contexto vivo</p>
          <h2 className="text-2xl font-semibold text-neo-text-primary">Buscador semántico bilingüe</h2>
          <p className="text-sm text-neo-text-secondary">
            Tipes, snippets y respuestas listas en español o inglés con un solo click. Perfecto para entrevistas, pair programming o documentación.
          </p>
          <Link
            href="#search"
            className="inline-flex items-center justify-center rounded-2xl bg-neo-primary px-5 py-2 text-sm font-semibold text-white shadow hover:bg-neo-primary-dark"
          >
            Probar ahora
          </Link>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-neo-primary-light via-white to-neo-accent-cyan/20 p-6 text-left text-sm text-neo-text-secondary">
          <p className="font-semibold text-neo-text-primary">Insights de búsqueda</p>
          <ul className="mt-4 space-y-2 text-xs">
            <li className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2">
              <span>Integraciones</span>
              <span className="font-semibold text-neo-primary">+68%</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2">
              <span>Soft skills</span>
              <span className="font-semibold text-neo-accent-purple">+34%</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2">
              <span>Command Palette</span>
              <span className="font-semibold text-neo-accent-cyan">+12%</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="grid items-center gap-10 rounded-[32px] border border-neo-border bg-white/80 p-8 shadow-lg shadow-neo-accent-orange/10 md:grid-cols-2">
        <div className="rounded-3xl bg-gradient-to-br from-neo-accent-orange/30 via-neo-primary-light to-white/90 p-6 text-left text-sm text-neo-text-secondary">
            <p className="font-semibold text-neo-text-primary">Salud del diccionario</p>
          <p className="mt-3 text-xs">
            Controla sincronizaciones, pipeline de términos y salud del dataset directamente desde el tablero de Diccionario Dev.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3">
              <p className="text-neo-text-secondary/70">Términos moderados</p>
              <p className="text-lg font-semibold text-neo-text-primary">128</p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3">
              <p className="text-neo-text-secondary/70">Ejercicios creados</p>
              <p className="text-lg font-semibold text-neo-text-primary">64</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-neo-text-secondary">Operaciones</p>
          <h2 className="text-2xl font-semibold text-neo-text-primary">Panel de control consciente</h2>
          <p className="text-sm text-neo-text-secondary">
            Métricas, alertas y edición avanzada con un layout pensado para Omar Hernandez Rey. Todo conectado al dataset Prisma y listo para CI/CD.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl border border-neo-border bg-white px-5 py-2 text-sm font-semibold text-neo-text-primary shadow-sm transition hover:border-neo-primary hover:text-neo-primary"
          >
            Ver tablero
          </Link>
        </div>
      </div>
    </section>
  );
}

function InfoColumns() {
  return (
    <section className="mx-auto max-w-6xl border-t border-neo-border/70 px-4 pt-16">
      <div className="grid gap-6 md:grid-cols-3">
        <InfoBlock
          title="Stack favorito"
          body="Next.js + Prisma + Redis + Docker, optimizado con Vite y testing Vitest. Todo listo para despliegues en cuestión de minutos."
        />
        <InfoBlock
          title="Capa semántica"
          body="Traducciones estructurales, snippets bilingües y respuestas con un solo click, pensadas para entrevistas y pair programming."
        />
        <InfoBlock
          title="Modo entrenamiento"
          body="Quizzes guiados, historial de intentos y paneles de performance para medir progreso del equipo técnico."
        />
      </div>
    </section>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-3 rounded-2xl border border-neo-border bg-white/80 p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-neo-text-secondary">{title}</h3>
      <p className="text-sm leading-relaxed text-neo-text-primary/80">{body}</p>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl border-t border-neo-border px-4 pb-16 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-6 text-sm text-neo-text-secondary">
        <div className="flex items-center gap-2 font-semibold text-neo-text-primary">
          <span className="h-5 w-5 rounded-md bg-neo-primary" /> Diccionario Dev
        </div>
        <nav className="flex flex-wrap gap-6">
          <Link href="#features" className="transition hover:text-neo-primary">Features</Link>
          <Link href="#learn" className="transition hover:text-neo-primary">Casos</Link>
          <Link href="#support" className="transition hover:text-neo-primary">Soporte</Link>
        </nav>
        <div className="flex items-center gap-4 text-neo-text-secondary">
          <Link href="https://instagram.com" aria-label="Instagram" className="transition hover:text-neo-primary"><FaInstagram /></Link>
          <Link href="https://linkedin.com" aria-label="LinkedIn" className="transition hover:text-neo-primary"><FaLinkedin /></Link>
          <Link href="https://x.com" aria-label="X / Twitter" className="transition hover:text-neo-primary"><FaXTwitter /></Link>
        </div>
      </div>
    </footer>
  );
}
