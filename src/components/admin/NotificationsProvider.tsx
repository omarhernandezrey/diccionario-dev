"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

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
  markAsRead: (id: number) => void;
  markAllRead: () => void;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

const STORAGE_KEY = "diccionario.notifications";
const FALLBACK_NOTIFICATIONS: AdminNotification[] = [
  { id: 1, title: "Sincronización completada", detail: "Se indexaron 12 términos nuevos.", type: "info", timestamp: new Date().toISOString(), read: false },
  { id: 2, title: "Revisión pendiente", detail: "3 términos requieren aprobación.", type: "alert", timestamp: new Date().toISOString(), read: false },
];

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(FALLBACK_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((next: AdminNotification[]) => {
    setNotifications(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // noop
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) throw new Error("Request falló");
      const payload = await res.json();
      if (Array.isArray(payload?.items)) {
        persist(
          payload.items.map((item: AdminNotification, idx: number) => ({
            ...item,
            id: Number(item.id ?? idx + 1),
            read: Boolean(item.read),
          })),
        );
      }
    } catch {
      persist(FALLBACK_NOTIFICATIONS);
    }
    setLoading(false);
  }, [persist]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AdminNotification[];
        setNotifications(parsed);
        setLoading(false);
      } else {
        refresh();
      }
    } catch {
      refresh();
    }
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
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
  }, []);

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
      markAsRead,
      markAllRead,
      refresh,
    }),
    [notifications, unreadCount, loading, markAsRead, markAllRead, refresh],
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
