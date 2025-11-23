"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useNotifications } from "@/components/admin/NotificationsProvider";
import { useSession, notifySessionChange } from "@/components/admin/SessionProvider";
import ThemeToggle from "@/components/ThemeToggle";

export default function Topbar() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { session, loading: sessionLoading } = useSession();
  const { notifications, unreadCount, markAsRead, markAllRead, refresh, loading } = useNotifications();

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth", { method: "DELETE", credentials: "include" });
      setDropdownOpen(false);
      notifySessionChange(); // Notificar a todos los componentes
      router.push("/admin");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-neo-border bg-neo-bg/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Search */}
        <div className="flex flex-1 items-center gap-4">
          <div className="relative hidden md:block">
            <Icon library="lucide" name="Search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neo-text-secondary" />
            <input
              type="text"
              placeholder="Buscar términos..."
              className="rounded-lg border border-neo-border bg-neo-bg py-1.5 pl-10 pr-3 text-sm text-neo-text-primary placeholder:text-neo-text-secondary transition focus:border-neo-primary focus:outline-none focus:ring-2 focus:ring-neo-primary/20"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Notifications */}
          <div className="relative">
            <button
              className="relative rounded-lg p-2 text-neo-text-secondary transition hover:bg-neo-surface hover:text-neo-text-primary"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Icon library="lucide" name="Bell" className="h-5 w-5" />
              {unreadCount ? (
                <span className="absolute right-1 top-1 h-4 min-w-[1rem] rounded-full bg-accent-rose px-1 text-center text-[10px] font-bold leading-4 text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-neo-border bg-neo-card p-3 shadow-xl animate-slide-up">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neo-text-primary">Notificaciones</p>
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-neo-primary" type="button" onClick={() => { markAllRead(); setNotificationsOpen(false); }}>
                      Marcar todo leído
                    </button>
                    <button className="inline-flex items-center gap-1 text-xs text-neo-text-secondary" type="button" onClick={refresh} aria-label="Sincronizar notificaciones">
                      <Icon library="lucide" name="RotateCcw" className="h-3.5 w-3.5" />
                      Sync
                    </button>
                  </div>
                </div>
                <ul className="mt-3 space-y-2">
                  {loading ? (
                    <li className="rounded-xl border border-neo-border bg-neo-bg px-3 py-4 text-center text-xs text-neo-text-secondary">
                      Cargando notificaciones…
                    </li>
                  ) : notifications.length ? (
                    notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`flex gap-3 rounded-xl border px-3 py-2 text-sm ${notif.read
                          ? "border-neo-border bg-neo-surface text-neo-text-secondary"
                          : "border-neo-primary bg-neo-primary-light/70 text-neo-text-primary"
                          }`}
                      >
                        <button
                          type="button"
                          className="text-left flex-1"
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
                            {notif.type === "alert" ? (
                              <Icon library="lucide" name="AlertTriangle" className="h-3.5 w-3.5 text-accent-rose" />
                            ) : (
                              <Icon library="lucide" name="CheckCircle2" className="h-3.5 w-3.5 text-accent-emerald" />
                            )}
                            <span>{notif.title}</span>
                          </div>
                          <p className="mt-1 text-sm font-medium text-neo-text-primary">{notif.detail}</p>
                          <p className="text-xs text-neo-text-secondary">{notif.timestamp}</p>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-neo-border bg-neo-bg px-3 py-4 text-center text-xs text-neo-text-secondary">
                      Todo en orden; no hay alertas.
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Settings */}
          <button className="rounded-lg p-2 text-neo-text-secondary transition hover:bg-neo-surface hover:text-neo-text-primary" onClick={() => router.push("/admin/settings")}>
            <Icon library="lucide" name="Settings" className="h-5 w-5" />
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-neo-border" />

          {/* User Menu */}
          <div className="relative">
            {sessionLoading ? (
              <div className="flex items-center gap-2 rounded-lg px-3 py-1.5">
                <Icon library="lucide" name="Loader2" className="h-5 w-5 animate-spin text-neo-text-secondary" />
                <span className="text-sm text-neo-text-secondary">Cargando...</span>
              </div>
            ) : session ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-neo-text-secondary transition hover:bg-neo-surface hover:text-neo-text-primary"
                >
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-neo-primary to-neo-accent-purple text-xs font-bold text-white">
                    {session.username.substring(0, 2).toUpperCase()}
                    {/* Indicador "en línea" - bolita verde */}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10b981] ring-2 ring-white dark:ring-neo-bg"></span>
                  </div>
                  <div className="hidden sm:flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-neo-text-primary">{session.username}</span>
                    <span className="text-[10px] text-[#10b981] font-medium">● En línea</span>
                  </div>
                  <Icon
                    library="lucide"
                    name="ChevronDown"
                    className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neo-border bg-neo-card shadow-xl animate-slide-up">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-neo-text-secondary transition hover:bg-neo-surface hover:text-neo-text-primary"
                      onClick={() => {
                        router.push("/admin/settings");
                        setDropdownOpen(false);
                      }}
                    >
                      <Icon library="lucide" name="Settings" className="h-4 w-4" />
                      Preferencias
                    </button>
                    <div className="border-t border-neo-border" />
                    <button
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-accent-rose transition hover:bg-neo-surface disabled:opacity-60"
                      onClick={handleSignOut}
                      disabled={signingOut}
                    >
                      {signingOut ? (
                        <Icon library="lucide" name="Loader2" className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon library="lucide" name="LogOut" className="h-4 w-4" />
                      )}
                      {signingOut ? "Saliendo…" : "Salir"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => router.push("/admin/access")}
                className="flex items-center gap-2 rounded-lg bg-neo-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-neo-primary/90"
              >
                <Icon library="lucide" name="LogIn" className="h-4 w-4" />
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
