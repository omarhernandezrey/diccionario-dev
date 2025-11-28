"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VscVscode } from "react-icons/vsc";
import { LuGlobe, LuLayers, LuSearch, LuSparkles, LuMenu, LuX } from "react-icons/lu";
import SearchBox from "./SearchBox";
import TechStrip from "./TechStrip";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Inicio", href: "#hero" },
  { label: "Buscar", href: "#search" },
  { label: "Tecnologías", href: "#tech" },
  { label: "Extensiones", href: "#extensions" },
];

export default function MarketingLanding() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="space-y-24 scroll-smooth">
      <PageNav />

      <Hero />
      <TechStrip />
      <AppOverview />
      <FeaturePairs />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-12 text-center sm:px-6 lg:px-8 lg:pt-20 lg:pb-16">
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neo-primary/10 blur-[60px] md:h-[600px] md:w-[600px] md:blur-[100px]" />

      <div className="relative mx-auto max-w-5xl rounded-[2rem] border border-neo-border/50 bg-neo-card/30 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl ring-1 ring-white/10 md:rounded-[2.5rem] md:p-16">
        <div className="flex flex-col items-center gap-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-neo-primary/30 bg-neo-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neo-primary shadow-[0_0_15px_rgba(77,154,255,0.3)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-neo-primary shadow-[0_0_10px_#4d9aff]" />
            Diccionario Dev v2.0
          </span>

          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 sm:text-5xl md:text-7xl">
            El diccionario técnico para <span className="text-neo-primary">desarrolladores</span>
          </h1>

          <p className="max-w-2xl text-lg font-medium leading-relaxed text-neo-text-secondary md:text-xl">
            Busca, comprende y domina la terminología del desarrollo web con contexto bilingüe y semántico.
          </p>

          <div className="w-full max-w-3xl">
            <SearchBox />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="#search" className="btn-primary text-sm shadow-lg shadow-neo-primary/25">
              Explorar términos
            </Link>
            <Link
              href="/admin"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-neo-border bg-white/5 px-6 py-3 text-sm font-semibold text-neo-text-primary backdrop-blur-sm transition hover:bg-white/10 hover:border-neo-primary/50"
            >
              Ir al panel admin
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppOverview() {
  const highlights = [
    {
      title: "Busca, comprende y actúa",
      text: "Accede a definiciones claras y precisas para tomar decisiones informadas rápidamente.",
      icon: LuSearch,
    },
    {
      title: "Contexto inteligente",
      text: "Obtén explicaciones que se adaptan al contexto de tu búsqueda para una mayor comprensión.",
      icon: LuLayers,
    },
    {
      title: "Traducción estructural",
      text: "Entiende no solo el qué, sino el cómo, con traducciones que respetan la estructura técnica.",
      icon: LuSparkles,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neo-text-primary sm:text-4xl">Características Principales</h2>
        <p className="mt-4 text-lg text-neo-text-secondary max-w-2xl mx-auto">
          DiccionarioDev está diseñado para integrarse perfectamente en tu entorno, proporcionando la información que necesitas, cuando la necesitas.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-3xl border border-neo-border/50 bg-neo-card/40 p-8 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-neo-primary/50 hover:shadow-2xl hover:shadow-neo-primary/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neo-primary/5 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-neo-primary to-neo-accent-purple shadow-lg shadow-neo-primary/20">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-neo-text-primary">{item.title}</h3>
              <p className="text-base leading-relaxed text-neo-text-secondary">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Extensions Section - MacOS Tiles */}
      <div className="mt-20 lg:mt-32">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neo-text-primary sm:text-4xl">Intégralo en tu flujo de trabajo</h2>
          <p className="mt-4 text-lg text-neo-text-secondary">Accede a DiccionarioDev directamente desde donde trabajas.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* VS Code Tile */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-neo-border/50 bg-[#1e1e1e] p-10 shadow-2xl transition duration-500 hover:shadow-neo-primary/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#2d2d2d] shadow-xl ring-1 ring-white/10">
                <VscVscode className="h-14 w-14 text-[#007ACC]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Extensión para VS Code</h3>
              <p className="mt-4 mb-8 max-w-md text-gray-400">Busca términos sin salir de tu editor de código. Aumenta tu productividad y mantén el foco.</p>
              <button className="w-full rounded-xl bg-[#007ACC] py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0063a5] hover:scale-[1.02]">
                Instalar ahora
              </button>
            </div>
          </div>

          {/* Browser Tile */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-neo-border/50 bg-[#1e1e1e] p-10 shadow-2xl transition duration-500 hover:shadow-neo-primary/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#2d2d2d] shadow-xl ring-1 ring-white/10">
                <LuGlobe className="h-14 w-14 text-neo-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white">Extensión para Navegador</h3>
              <p className="mt-4 mb-8 max-w-md text-gray-400">Obtén definiciones al instante mientras navegas. Compatible con Chrome, Firefox y Edge.</p>
              <button className="w-full rounded-xl bg-neo-primary py-4 text-sm font-bold text-white shadow-lg shadow-neo-primary/25 transition hover:bg-neo-primary-dark hover:scale-[1.02]">
                Añadir a Chrome
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PageNav() {
  const [activeHash, setActiveHash] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => setActiveHash(window.location.hash);
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <nav className="sticky top-4 z-30 px-4 animate-slide-down">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-neo-border/60 bg-neo-bg/90 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-neo-primary to-neo-accent-purple shadow-lg shadow-neo-primary/30" />
          <span className="text-sm font-bold tracking-tight text-neo-text-primary">
            Diccionario<span className="text-neo-primary">Dev</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const isActive = activeHash === link.href || (link.href === "#hero" && !activeHash);
            return (
              <a
                key={link.label}
                href={link.href}
                className={`group relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-300 ${isActive
                  ? "bg-neo-primary text-white shadow-lg shadow-neo-primary/30"
                  : "text-neo-text-secondary hover:bg-neo-surface hover:text-neo-primary"
                  }`}
              >
                {link.label}
                {!isActive && (
                  <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-neo-primary/0 via-neo-primary/5 to-neo-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </a>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/admin"
            className="hidden group md:flex items-center gap-2 rounded-full bg-gradient-to-r from-neo-primary to-neo-accent-purple px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-neo-primary/30 transition-all hover:shadow-xl hover:shadow-neo-primary/40 hover:scale-105"
          >
            <span>Admin</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neo-border bg-neo-surface text-neo-text-primary md:hidden"
          >
            {isMobileMenuOpen ? <LuX /> : <LuMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 px-4 md:hidden">
          <div className="rounded-3xl border border-neo-border/60 bg-neo-bg/95 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = activeHash === link.href;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isActive
                      ? "bg-neo-primary/10 text-neo-primary"
                      : "text-neo-text-secondary hover:bg-neo-surface hover:text-neo-text-primary"
                      }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="my-2 h-px bg-neo-border/50" />
              <a
                href="/admin"
                className="flex items-center justify-center gap-2 rounded-xl bg-neo-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-neo-primary/20"
              >
                Ir al panel admin
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


function FeaturePairs() {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neo-primary/10 via-neo-bg to-neo-bg" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neo-accent-purple/5 blur-[120px]" />

      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-neo-border bg-neo-surface/50 px-4 py-1 text-xs font-bold uppercase tracking-widest text-neo-primary">
            Contexto Vivo
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-neo-text-primary sm:text-5xl">
            Búsqueda semántica <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neo-primary to-neo-accent-cyan">bilingüe</span>
          </h2>
          <p className="text-lg leading-relaxed text-neo-text-secondary">
            Nuestro IA no solo traduce, sino que interpreta la intención y el contexto técnico detrás de cada término. Obtén resultados que entienden la diferencia entre &apos;state&apos; en React y &apos;state&apos; en una máquina de estados.
          </p>
        </div>

        {/* Visual Representation */}
        <div className="relative rounded-3xl border border-neo-border/50 bg-neo-card/30 p-2 shadow-2xl backdrop-blur-xl">
          <div className="aspect-video overflow-hidden rounded-2xl bg-neo-bg/50 relative">
            {/* Abstract Mesh Visual */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-neo-primary blur-[50px] animate-pulse-slow" />
              <div className="absolute bottom-1/4 right-1/4 h-40 w-40 rounded-full bg-neo-accent-purple blur-[60px] animate-float" />
            </div>
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>
        </div>
      </div>
    </section>
  );
}



function SiteFooter() {
  return (
    <footer className="border-t border-neo-border bg-neo-bg pt-10 pb-8 md:pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:gap-12 grid-cols-2 md:grid-cols-4 mb-12 md:mb-16">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold text-neo-text-primary">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-neo-primary to-neo-accent-purple" />
              DiccionarioDev
            </div>
            <p className="text-sm text-neo-text-secondary max-w-xs">
              El diccionario técnico inteligente para la próxima generación de desarrolladores.
            </p>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neo-text-primary">
              <LuLayers className="text-neo-primary" /> Producto
            </h4>
            <ul className="space-y-3 text-sm text-neo-text-secondary">
              <li><a href="#" className="hover:text-neo-primary transition">Features</a></li>
              <li><a href="#" className="hover:text-neo-primary transition">Integraciones</a></li>
              <li><a href="#" className="hover:text-neo-primary transition">Precios</a></li>
              <li><a href="#" className="hover:text-neo-primary transition">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neo-text-primary">
              <LuGlobe className="text-neo-accent-purple" /> Comunidad
            </h4>
            <ul className="space-y-3 text-sm text-neo-text-secondary">
              <li><a href="#" className="hover:text-neo-primary transition">Discord</a></li>
              <li><a href="#" className="hover:text-neo-primary transition">Twitter</a></li>
              <li><a href="#" className="hover:text-neo-primary transition">GitHub</a></li>
              <li><a href="#" className="hover:text-neo-primary transition">Blog</a></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-neo-text-primary">Estadísticas</h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neo-primary to-neo-accent-cyan">10k+</div>
                <div className="text-xs text-neo-text-secondary uppercase tracking-wide">Usuarios Activos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neo-accent-purple to-neo-accent-pink">5k+</div>
                <div className="text-xs text-neo-text-secondary uppercase tracking-wide">Términos Definidos</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-neo-border pt-8 text-center text-xs text-neo-text-secondary">
          &copy; {new Date().getFullYear()} DiccionarioDev. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
