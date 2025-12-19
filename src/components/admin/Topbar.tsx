"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { useSession, notifySessionChange } from "@/components/admin/SessionProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";

export default function Topbar() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const { session, loading: sessionLoading } = useSession();
  const [avatarOverride, setAvatarOverride] = useState<string | null>(null);
  const avatarStorageKey = `user_avatar_override:${session?.username || "guest"}`;

  // Sync avatar override (localStorage) to keep parity with home uploads
  React.useEffect(() => {
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
      <div className="flex items-center justify-between px-4 py-2 sm:px-6 sm:py-3">
        {/* Left side - espacio vacío para balance */}
        <div className="flex flex-1 items-center gap-3" />

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full border border-neo-primary/50 bg-linear-to-r from-neo-primary/80 to-neo-accent-purple/80 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-neo-primary/30 transition hover:-translate-y-px hover:shadow-neo-primary/40 sm:px-4"
            onClick={() => router.push("/")}
            title="Ir al Home"
            aria-label="Ir al Home"
          >
            <Icon library="lucide" name="Home" className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
          <NotificationBell />
          <ThemeToggle variant="admin" />

          {/* Settings */}
          {/* Divider */}
          <div className="hidden h-6 w-px bg-neo-border sm:block" />

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
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/70 ring-2 ring-white/20 bg-linear-to-br from-neo-primary to-neo-accent-purple text-xs font-bold text-white">
                    {avatarOverride || session.avatarUrl ? (
                      <Image src={avatarOverride || session.avatarUrl || ""} alt={session.displayName || session.username} width={36} height={36} className="h-full w-full object-cover rounded-full" />
	                    ) : (
	                      <span className="flex h-full w-full items-center justify-center">
	                        {session.displayName?.substring(0, 2).toUpperCase() || session.username.substring(0, 2).toUpperCase()}
	                      </span>
	                    )}
	                    {/* Indicador "en línea" - bolita verde */}
	                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-accent-emerald ring-2 ring-white dark:ring-neo-bg"></span>
	                  </div>
	                  <div className="hidden sm:flex lg:hidden flex-col leading-tight">
	                    <span className="text-sm font-semibold text-neo-text-primary">{session.displayName || session.username}</span>
	                    <span className="text-[10px] text-accent-emerald font-medium">● En línea</span>
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
                        router.push("/admin/profile");
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
