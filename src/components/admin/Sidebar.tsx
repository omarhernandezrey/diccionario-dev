"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useSession } from "@/components/admin/SessionProvider";
import { ThemeLogo } from "@/components/ThemeLogo";

type NavSection = {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
  requiresAuth?: boolean;
};

const sections: NavSection[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", adminOnly: true },
  { href: "/admin/terms", label: "Términos", icon: "BookOpen", adminOnly: true },
  { href: "/training", label: "Training", icon: "Dumbbell", requiresAuth: false },
  { href: "/interview/live", label: "Interview Live", icon: "Video", requiresAuth: false },
  { href: "/admin/profile", label: "Perfil", icon: "User", requiresAuth: true },
  { href: "/admin/settings", label: "Configuración", icon: "Settings", requiresAuth: true },
  { href: "/admin/access", label: "Autenticación", icon: "ShieldCheck", requiresAuth: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const currentPath = pathname || "";
  const [collapsed, setCollapsed] = useState(true);
  const { session, loading: sessionLoading } = useSession();
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const avatarStorageKey = `user_avatar_override:${session?.username || "guest"}`;

  useEffect(() => {
    const readOverride = () => {
      if (typeof window === "undefined") return;
      try {
        const stored = window.localStorage.getItem(avatarStorageKey);
        setAvatarOverride(stored ? (JSON.parse(stored) as string) : null);
      } catch {
        setAvatarOverride(null);
      }
    };
    readOverride();
    const handler = (e: StorageEvent) => {
      if (e.key === avatarStorageKey) readOverride();
    };
    window.addEventListener("storage", handler);
    window.addEventListener("avatar-updated", readOverride as EventListener);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("avatar-updated", readOverride as EventListener);
    };
  }, [avatarStorageKey]);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(href);
  };

  // Filtrar secciones según permisos
  const visibleSections = sections.filter((section) => {
    // Si es solo para admin y el usuario no es admin, ocultar
    if (section.adminOnly && session?.role !== "admin") {
      return false;
    }
    // Si requiere autenticación y no hay sesión, ocultar
    if (section.requiresAuth && !session) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Cerrar menú"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-neo-border bg-neo-card transition-all duration-300 ease-out lg:sticky lg:translate-x-0 ${collapsed ? "-translate-x-full" : "translate-x-0"
          }`}
      >
          <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neo-border bg-neo-bg/80 p-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <ThemeLogo
                width={56}
                height={56}
                className="h-10 w-10 shrink-0 rounded-lg lg:h-12 lg:w-12 xl:h-14 xl:w-14"
              />
              <div className="hidden sm:block leading-tight">
                <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Diccionario</div>
                <div className="text-sm font-bold text-neo-text-primary">Dev</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="rounded p-1 text-neo-text-secondary hover:bg-neo-surface lg:hidden"
              aria-label="Cerrar menú"
            >
              <Icon library="lucide" name="X" className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
            {sessionLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-neo-surface animate-pulse" />
                ))}
              </div>
            ) : visibleSections.length > 0 ? (
              visibleSections.map((section) => {
                const active = isActive(section.href);
                return (
                  <Link
                    key={section.href}
                    href={section.href}
                    onClick={() => setCollapsed(true)}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${active
                      ? "bg-linear-to-r from-neo-primary to-neo-accent-purple text-white shadow-lg shadow-neo-primary/30"
                      : "text-neo-text-secondary hover:bg-neo-surface hover:text-neo-text-primary"
                      }`}
                  >
                    <Icon library="lucide" name={section.icon} className="h-5 w-5 shrink-0" />
                    <span className="text-sm font-medium">{section.label}</span>
                    {active && <Icon library="lucide" name="ChevronRight" className="ml-auto h-4 w-4" />}
                  </Link>
                );
              })
            ) : (
              <div className="rounded-lg border border-neo-border bg-neo-bg p-4 text-center text-xs text-neo-text-secondary">
                <p>Inicia sesión para ver más opciones</p>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t border-neo-border p-4 space-y-3">
            {session && (
              <div className="rounded-lg border border-neo-border bg-neo-surface p-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0">
                    {avatarOverride || session.avatarUrl ? (
                      <Image
                        src={avatarOverride || session.avatarUrl || ""}
                        alt={session.username}
                        width={40}
                        height={40}
                        className="h-full w-full rounded-full object-cover border border-white/70 ring-2 ring-white/20"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-neo-primary to-neo-accent-purple text-sm font-bold text-white border border-white/70 ring-2 ring-white/20">
                        {session.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
	                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-accent-emerald ring-2 ring-neo-surface"></span>
	                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neo-text-primary truncate">{session.displayName || session.username}</p>
                    <p className="text-[11px] text-neo-text-secondary truncate">● {session.role}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="fixed left-4 top-4 z-50 rounded-lg bg-neo-primary p-2 text-white shadow-lg shadow-neo-primary/30 lg:hidden"
          aria-label="Abrir menú"
        >
          <Icon library="lucide" name="Menu" className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
