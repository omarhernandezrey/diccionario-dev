"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Github, Home, Linkedin, Twitter } from "lucide-react";
import { LuLayers, LuSearch, LuSparkles, LuMenu, LuX, LuGlobe, LuCpu, LuPuzzle } from "react-icons/lu";
import SearchBox from "./SearchBox";
import TechStrip from "./TechStrip";
import ThemeToggle from "./ThemeToggle";
import ExtensionsShowcase from "./ExtensionsShowcase";
import Footer from "./Footer";
import { AuthActions } from "./AuthActions";
import { NotificationBell } from "./NotificationBell";
import { ThemeLogo } from "./ThemeLogo";

const navLinks = [
  { label: "Inicio", href: "#hero", icon: Home },
  { label: "Buscar", href: "#search", icon: LuSearch },
  { label: "Tecnologías", href: "#tech", icon: LuCpu },
  { label: "Extensiones", href: "#extensions", icon: LuPuzzle },
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
      <ExtensionsShowcase variant="neo" />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-12 text-center sm:px-6 lg:px-8 lg:pt-20 lg:pb-16">
      <div className="absolute top-1/2 left-1/2 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neo-primary/10 blur-[60px] md:h-[600px] md:w-[600px] md:blur-[100px]" />

      <div className="relative mx-auto max-w-5xl rounded-4xl border border-neo-border/50 bg-neo-card/30 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl ring-1 ring-white/10 md:rounded-[2.5rem] md:p-16">
        <div className="flex flex-col items-center gap-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-neo-primary/30 bg-neo-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neo-primary shadow-[0_0_15px_rgba(77,154,255,0.3)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-neo-primary shadow-[0_0_10px_#4d9aff]" />
            Diccionario Dev v2.0
          </span>

          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-b from-white via-white to-white/60 sm:text-5xl md:text-7xl">
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
            <div className="absolute inset-0 bg-linear-to-br from-neo-primary/5 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-neo-primary to-neo-accent-purple shadow-lg shadow-neo-primary/20">
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-neo-text-primary">{item.title}</h3>
              <p className="text-base leading-relaxed text-neo-text-secondary">{item.text}</p>
            </div>
          </div>
        ))}
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

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="sticky top-4 z-30 px-4 animate-slide-down">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-neo-border/60 bg-neo-bg/90 px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 lg:gap-4">
          <ThemeLogo 
            width={56} 
            height={56} 
            className="h-9 w-9 shrink-0 md:h-10 md:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 transition-transform duration-300 hover:scale-105" 
          />
	            <div className="flex flex-col justify-center">
	              <p className="text-[9px] uppercase tracking-[0.2em] text-indigo-400 font-bold leading-none mb-0.5">Diccionario</p>
	              <span className="text-base font-bold tracking-tight text-neo-text-primary leading-none">
	              <span className="text-indigo-500">Dev</span>
	              </span>
	            </div>
	        </div>          {/* Desktop Nav Links */}
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
                    <span className="absolute inset-0 -z-10 rounded-full bg-linear-to-r from-neo-primary/0 via-neo-primary/5 to-neo-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <NotificationBell size="sm" className="inline-flex" />
            <ThemeToggle />
            <a
              href="/admin"
              className="hidden group md:flex items-center gap-2 rounded-full bg-linear-to-r from-neo-primary to-neo-accent-purple px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-neo-primary/30 transition-all hover:shadow-xl hover:shadow-neo-primary/40 hover:scale-105"
            >
              <span>Admin</span>
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neo-border bg-neo-surface text-neo-text-primary md:hidden"
            >
              <LuMenu />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer (Twitter Style) */}
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Drawer */}
	      <div 
	        className={`fixed top-2 bottom-2 left-0 z-50 w-[78vw] max-w-80 rounded-2xl bg-linear-to-b from-neo-bg via-neo-bg/95 to-neo-surface border border-neo-border shadow-2xl overflow-hidden transform transition-transform duration-300 ease-out md:hidden ${
	          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
	        }`}
	      >
	        <div className="flex flex-col h-full p-4 gap-3">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neo-border/60">
                 <div className="flex items-center gap-3">
                    <ThemeLogo 
                        width={36} 
                        height={36} 
                        className="shrink-0" 
                    />
	                    <div className="flex flex-col justify-center">
	                        <p className="text-[9px] uppercase tracking-[0.2em] text-indigo-400 font-bold leading-none mb-0.5">Diccionario</p>
	                        <span className="text-base font-bold tracking-tight text-neo-text-primary leading-none">
	                            <span className="text-indigo-500">Dev</span>
	                        </span>
	                    </div>
	                 </div>
                 <div className="flex items-center gap-2">
                   <NotificationBell size="sm" />
                   <ThemeToggle />
                   <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-neo-surface text-neo-text-secondary transition-colors">
                    <LuX className="w-6 h-6" />
                   </button>
                 </div>
            </div>

	            {/* Links */}
	            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
	                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em] text-neo-text-secondary px-1">
	                  <span>Menú</span>
	                  <span className="inline-block h-px flex-1 mx-3 bg-neo-border/70" />
	                </div>
                <div className="space-y-2">
                  {navLinks.map((link) => {
                    const isActive = activeHash === link.href;
                    const Icon = link.icon;
                    return (
                        <a 
                            href={link.href} 
                            key={link.label} 
                            onClick={() => setIsMobileMenuOpen(false)} 
                            className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all ${
                              isActive
                                ? "border-neo-primary/50 bg-neo-primary/10 text-neo-primary"
                                : "border-neo-border bg-neo-card/70 text-neo-text-primary hover:border-neo-primary/40 hover:bg-neo-card"
                            }`}
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neo-surface text-neo-text-secondary">
                              <Icon className="w-5 h-5" />
                            </span>
                            {link.label}
                        </a>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-neo-border bg-neo-card/70 p-3 shadow-sm space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-neo-text-secondary">Acceso</p>
                  <AuthActions variant="compact" layout="stacked" />
                </div>

	                <a
	                  href="/admin"
	                  className="flex items-center justify-between rounded-2xl border border-neo-border bg-neo-card/60 px-4 py-2 text-sm font-semibold text-neo-text-primary transition hover:border-neo-primary/50 hover:bg-neo-card"
	                >
	                  <span className="flex items-center gap-2">
	                    <LuGlobe className="h-4 w-4 text-neo-primary" />
	                    Panel Admin
	                  </span>
	                  <span className="text-neo-primary">→</span>
	                </a>
	            </div>

	            <div className="pt-4 border-t border-neo-border/70">
	              <div className="flex items-center justify-between gap-3">
	                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neo-text-secondary">Redes</span>
	                <div className="flex items-center gap-2">
	                  <a
	                    href="https://github.com"
	                    aria-label="GitHub"
	                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neo-border bg-neo-card/60 text-neo-text-secondary transition hover:-translate-y-0.5 hover:border-neo-primary/60 hover:text-neo-primary"
	                  >
	                    <Github className="h-5 w-5" />
	                  </a>
	                  <a
	                    href="https://twitter.com"
	                    aria-label="Twitter"
	                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neo-border bg-neo-card/60 text-neo-text-secondary transition hover:-translate-y-0.5 hover:border-neo-primary/60 hover:text-neo-primary"
	                  >
	                    <Twitter className="h-5 w-5" />
	                  </a>
	                  <a
	                    href="https://linkedin.com"
	                    aria-label="LinkedIn"
	                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neo-border bg-neo-card/60 text-neo-text-secondary transition hover:-translate-y-0.5 hover:border-neo-primary/60 hover:text-neo-primary"
	                  >
	                    <Linkedin className="h-5 w-5" />
	                  </a>
	                </div>
	              </div>
	            </div>

	        </div>
	      </div>
	    </>
	  );
}


function FeaturePairs() {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-32">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neo-primary/10 via-neo-bg to-neo-bg" />
      <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neo-accent-purple/5 blur-[120px]" />

      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-neo-border bg-neo-surface/50 px-4 py-1 text-xs font-bold uppercase tracking-widest text-neo-primary">
            Contexto Vivo
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-neo-text-primary sm:text-5xl">
            Búsqueda semántica <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-neo-primary to-neo-accent-cyan">bilingüe</span>
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
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
