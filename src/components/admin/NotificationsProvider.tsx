"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "@/components/admin/SessionProvider";

export type AdminNotification = {
  id: number;
  title: string;
  detail: string;
  type: "alert" | "info";
  timestamp: string;
  read: boolean;
};

type NotificationsContextValue = {
  notifications: AdminNotification[];
  unreadCount: number;
  loading: boolean;
  requireLogin: boolean;
  markAsRead: (id: number) => void;
  markAllRead: () => void;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const FALLBACK_NOTIFICATIONS: AdminNotification[] = [];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const storageKey = session ? `diccionario.notifications:${session.username}` : "diccionario.notifications:guest";
  const [notifications, setNotifications] = useState<AdminNotification[]>(FALLBACK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);
  const [requireLogin, setRequireLogin] = useState(false);

  const persist = useCallback((next: AdminNotification[]) => {
    setNotifications(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // noop
      }
    }
  }, [storageKey]);

  const refresh = useCallback(async () => {
    if (!session) {
      setNotifications([]);
      setRequireLogin(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (res.status === 401) {
        setRequireLogin(true);
        setNotifications([]);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Request falló");
      const payload = await res.json();
      if (Array.isArray(payload?.items)) {
        const stored = (() => {
          try {
            const ls = localStorage.getItem(storageKey);
            return ls ? (JSON.parse(ls) as AdminNotification[]) : [];
          } catch {
            return [];
          }
        })();

        const merged = payload.items.map((item: AdminNotification, idx: number) => {
          const existing = stored.find((n) => n.id === item.id);
          return {
            ...item,
            id: Number(item.id ?? idx + 1),
            read: existing?.read ?? false,
          };
        });
        persist(merged);
        setRequireLogin(false);
      } else {
        persist(FALLBACK_NOTIFICATIONS);
      }
    } catch {
      persist(FALLBACK_NOTIFICATIONS);
    } finally {
      setLoading(false);
    }
  }, [persist, session, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setNotifications([]);
    setRequireLogin(!session);
    refresh();
  }, [refresh, session, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue) as AdminNotification[];
          setNotifications(parsed);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [storageKey]);

  const markAsRead = useCallback(
    (id: number) => {
      persist(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)));
    },
    [notifications, persist],
  );

  const markAllRead = useCallback(() => {
    persist(notifications.map((notif) => ({ ...notif, read: true })));
  }, [notifications, persist]);

  const unreadCount = useMemo(() => notifications.filter((notif) => !notif.read).length, [notifications]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      requireLogin,
      markAsRead,
      markAllRead,
      refresh,
    }),
    [notifications, unreadCount, loading, requireLogin, markAsRead, markAllRead, refresh],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  }
  return context;
}
