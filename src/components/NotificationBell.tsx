"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCircle2, AlertTriangle, Loader2, LogIn } from "lucide-react";
import { useNotifications } from "@/components/admin/NotificationsProvider";
import { useSession } from "@/components/admin/SessionProvider";

type NotificationBellProps = {
  size?: "sm" | "md";
  align?: "left" | "right" | "center";
  className?: string;
};

export function NotificationBell({ size = "md", align = "center", className }: NotificationBellProps) {
  const { notifications, unreadCount, loading, requireLogin, markAsRead, markAllRead, refresh } = useNotifications();
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 320 });
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const btnClasses =
    size === "sm"
      ? "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neo-primary/40 bg-neo-card text-neo-primary shadow-sm hover:bg-neo-surface"
      : "relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neo-primary/40 bg-neo-card text-neo-primary shadow-sm hover:bg-neo-surface";

  const badge =
    unreadCount > 0 ? (
      <span className="absolute -top-1 -right-1 min-w-[18px] rounded-full bg-emerald-500 px-1 text-[11px] lg:text-xs font-bold text-emerald-950">
        {unreadCount}
      </span>
    ) : null;

  const computePosition = useCallback(() => {
    if (!btnRef.current || typeof window === "undefined") return;
    const rect = btnRef.current.getBoundingClientRect();
    const desiredWidth = Math.min(320, window.innerWidth - 16);
    const baseLeft = align === "right" ? rect.right - desiredWidth : align === "left" ? rect.left : rect.left - (desiredWidth - rect.width) / 2;
    const clampedLeft = Math.max(8, Math.min(baseLeft, window.innerWidth - desiredWidth - 8));
    const top = rect.bottom + 8;
    setPosition({ top, left: clampedLeft, width: desiredWidth });
  }, [align]);

  useEffect(() => {
    if (!open) return;
    computePosition();
    const handleResize = () => computePosition();
    const handleScroll = () => computePosition();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, computePosition]);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 768px)");
    const handleChange = () => setIsMobile(mql.matches);
    handleChange();
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const toggleOpen = () => {
    if (typeof window !== "undefined") {
      const mql = window.matchMedia("(max-width: 768px)");
      setIsMobile(mql.matches);
    }
    const next = !open;
    if (next) {
      computePosition();
      if (!requireLogin && !loading) {
        refresh();
      }
    }
    setOpen(next);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={toggleOpen}
        className={`${btnClasses} transition hover:border-neo-primary/50 hover:text-neo-primary`}
        aria-label="Notificaciones"
        ref={btnRef}
      >
        <Bell className="h-5 w-5" />
        {badge}
      </button>

      {open && mounted
        ? createPortal(
            isMobile ? (
              <div className="fixed inset-0 z-999 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar notificaciones"
                />
                <div className="dd-notifications-modal relative w-[92vw] max-w-sm overflow-hidden rounded-2xl border border-neo-border/80 bg-neo-card/95 font-sans backdrop-blur-xl shadow-2xl shadow-black/40">
                  <div className="flex items-center justify-between border-b border-neo-border px-4 py-2">
                    <span className="text-sm lg:text-base font-semibold text-neo-text-primary">Notificaciones</span>
                    <div className="flex items-center gap-2">
                      {!requireLogin && notifications.length > 0 ? (
                        <button
                          type="button"
                          className="text-[11px] lg:text-xs text-neo-primary hover:underline"
                          onClick={() => {
                            markAllRead();
                          }}
                        >
                          Marcar todo leído
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-neo-border bg-neo-surface px-3 py-1 text-[11px] lg:text-xs font-semibold text-neo-text-primary transition hover:border-neo-primary/50 hover:text-neo-primary"
                        onClick={() => setOpen(false)}
                        aria-label="Cerrar panel de notificaciones"
                      >
                        ✕ Cerrar
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-neo-border bg-neo-surface px-3 py-4 text-sm lg:text-base text-neo-text-secondary">
                        <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" /> Cargando…
                      </div>
                    ) : requireLogin || !session ? (
                      <div className="flex items-center gap-3 rounded-xl border border-neo-border bg-neo-surface px-3 py-3 text-sm lg:text-base text-neo-text-secondary">
                        <LogIn className="h-4 w-4 lg:h-5 lg:w-5 text-neo-primary" />
                        <div>
                          <p className="font-semibold text-neo-text-primary text-sm lg:text-base">Inicia sesión</p>
                          <p className="text-xs lg:text-sm">Accede para ver tus notificaciones.</p>
                        </div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="rounded-xl border border-neo-border bg-neo-surface px-3 py-4 text-sm lg:text-base text-neo-text-secondary text-center">
                        No hay notificaciones.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            markAsRead(notif.id);
                            setOpen(false);
                          }}
                          className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left text-sm lg:text-base transition ${
                            notif.read
                              ? "border-neo-border bg-neo-surface text-neo-text-secondary"
                              : "border-neo-primary/50 bg-neo-primary/5 text-neo-text-primary"
                          }`}
                        >
                          <span className="mt-1">
                            {notif.type === "alert" ? (
                              <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-accent-rose" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400" />
                            )}
                          </span>
                          <span className="flex-1 min-w-0">
                            <div className="font-semibold">{notif.title}</div>
                            <div className="text-xs lg:text-sm text-neo-text-secondary leading-snug">{notif.detail}</div>
                            <div className="text-[11px] lg:text-xs text-neo-text-secondary/80 mt-1">{new Date(notif.timestamp).toLocaleString()}</div>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="dd-notifications-modal fixed z-999 overflow-hidden rounded-2xl border border-neo-border/80 bg-neo-card/95 font-sans backdrop-blur-xl shadow-xl shadow-black/40"
                style={{ top: position.top, left: position.left, width: position.width, maxWidth: "90vw" }}
              >
                <div className="flex items-center justify-between border-b border-neo-border px-4 py-2">
                  <span className="text-sm lg:text-base font-semibold text-neo-text-primary">Notificaciones</span>
                  <div className="flex items-center gap-2">
                    {!requireLogin && notifications.length > 0 ? (
                      <button
                        type="button"
                        className="text-[11px] lg:text-xs text-neo-primary hover:underline"
                        onClick={() => {
                          markAllRead();
                        }}
                      >
                        Marcar todo leído
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-neo-border bg-neo-surface px-3 py-1 text-[11px] lg:text-xs font-semibold text-neo-text-primary transition hover:border-neo-primary/50 hover:text-neo-primary"
                      onClick={() => setOpen(false)}
                      aria-label="Cerrar panel de notificaciones"
                    >
                      ✕ Cerrar
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-neo-border bg-neo-surface px-3 py-4 text-sm lg:text-base text-neo-text-secondary">
                      <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" /> Cargando…
                    </div>
                  ) : requireLogin || !session ? (
                    <div className="flex items-center gap-3 rounded-xl border border-neo-border bg-neo-surface px-3 py-3 text-sm lg:text-base text-neo-text-secondary">
                      <LogIn className="h-4 w-4 lg:h-5 lg:w-5 text-neo-primary" />
                      <div>
                        <p className="font-semibold text-neo-text-primary text-sm lg:text-base">Inicia sesión</p>
                        <p className="text-xs lg:text-sm">Accede para ver tus notificaciones.</p>
                      </div>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="rounded-xl border border-neo-border bg-neo-surface px-3 py-4 text-sm lg:text-base text-neo-text-secondary text-center">
                      No hay notificaciones.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id);
                          setOpen(false);
                        }}
                        className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left text-sm lg:text-base transition ${
                          notif.read
                            ? "border-neo-border bg-neo-surface text-neo-text-secondary"
                            : "border-neo-primary/50 bg-neo-primary/5 text-neo-text-primary"
                        }`}
                      >
                        <span className="mt-1">
                          {notif.type === "alert" ? (
                            <AlertTriangle className="h-4 w-4 lg:h-5 lg:w-5 text-accent-rose" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400" />
                          )}
                        </span>
                        <span className="flex-1 min-w-0">
                          <div className="font-semibold">{notif.title}</div>
                          <div className="text-xs lg:text-sm text-neo-text-secondary leading-snug">{notif.detail}</div>
                          <div className="text-[11px] lg:text-xs text-neo-text-secondary/80 mt-1">{new Date(notif.timestamp).toLocaleString()}</div>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ),
            document.body
          )
        : null}
    </div>
  );
}
