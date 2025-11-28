"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useSession } from "@/components/admin/SessionProvider";

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
  const [collapsed, setCollapsed] = useState(false);
  const { session, loading: sessionLoading } = useSession();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
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
          onClick={() => setCollapsed(true)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-neo-border bg-neo-card transition-all duration-300 ease-out lg:sticky lg:translate-x-0 ${collapsed ? "-translate-x-full" : "translate-x-0"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neo-border bg-neo-bg p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-neo-primary to-neo-accent-purple text-white">
                <Icon library="lucide" name="BookOpen" className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-neo-text-primary">Diccionario</div>
                <div className="text-xs text-neo-text-secondary">Admin Panel</div>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="rounded p-1 text-neo-text-secondary hover:bg-neo-surface lg:hidden"
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
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${active
                      ? "bg-gradient-to-r from-neo-primary to-neo-accent-purple text-white shadow-lg shadow-neo-primary/30"
                      : "text-neo-text-secondary hover:bg-neo-surface hover:text-neo-text-primary"
                      }`}
                  >
                    <Icon library="lucide" name={section.icon} className="h-5 w-5 flex-shrink-0" />
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
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative h-8 w-8 flex-shrink-0">
                    {session.avatarUrl ? (
                      <Image
                        src={session.avatarUrl}
                        alt={session.username}
                        width={32}
                        height={32}
                        className="h-full w-full rounded-full object-cover border border-neo-border"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-neo-primary to-neo-accent-purple text-xs font-bold text-white">
                        {session.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {/* Indicador "en línea" - bolita verde */}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10b981] ring-2 ring-neo-surface"></span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-neo-text-primary truncate">{session.username}</p>
                      <span className="text-[10px] text-[#10b981] font-medium uppercase">● {session.role}</span>
                    </div>
                    {session.bio && (
                      <div className="rounded bg-neo-bg/50 px-1.5 py-0.5 border border-neo-border/50">
                        <p className="text-[10px] text-neo-text-secondary line-clamp-2 leading-tight italic" title={session.bio}>
                          {session.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-lg border border-neo-border bg-neo-bg p-3 text-center text-xs text-neo-text-secondary">
              <div>© {new Date().getFullYear()}</div>
              <div className="font-semibold text-neo-text-primary">Diccionario Dev</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(false)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-neo-primary p-2 text-white shadow-lg shadow-neo-primary/30 lg:hidden"
      >
        <Icon library="lucide" name="Menu" className="h-5 w-5" />
      </button>
    </>
  );
}
