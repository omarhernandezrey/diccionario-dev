"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

type SessionUser = {
    id: number;
    username: string;
    role: "admin" | "user";
    email?: string | null;
};

type SessionContextType = {
    session: SessionUser | null;
    loading: boolean;
    refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Variable global para cachear la sesión entre componentes
let cachedSession: SessionUser | null = null;
let sessionFetched = false;

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<SessionUser | null>(cachedSession);
    const [loading, setLoading] = useState(!sessionFetched);
    const fetchingRef = useRef(false);

    const fetchSession = useCallback(async () => {
        // Evitar múltiples llamadas simultáneas
        if (fetchingRef.current) return;

        fetchingRef.current = true;
        setLoading(true);

        try {
            const res = await fetch("/api/auth", {
                credentials: "include",
                cache: "no-store",
                headers: {
                    'Cache-Control': 'no-cache',
                }
            });
            const data = await res.json().catch(() => ({}));

            const newSession = (res.ok && data?.user) ? data.user : null;

            // Actualizar cache global
            cachedSession = newSession;
            sessionFetched = true;

            setSession(newSession);
        } catch {
            cachedSession = null;
            sessionFetched = true;
            setSession(null);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    const refreshSession = useCallback(async () => {
        sessionFetched = false; // Forzar recarga
        await fetchSession();
    }, [fetchSession]);

    useEffect(() => {
        // Solo cargar si no se ha cargado antes
        if (!sessionFetched) {
            fetchSession();
        } else {
            // Si ya se cargó, usar la sesión cacheada inmediatamente
            setLoading(false);
        }
    }, [fetchSession]);

    // Escuchar eventos personalizados de cambio de sesión
    useEffect(() => {
        const handleSessionChange = () => {
            fetchSession();
        };

        window.addEventListener("session-changed", handleSessionChange);
        return () => {
            window.removeEventListener("session-changed", handleSessionChange);
        };
    }, [fetchSession]);

    return (
        <SessionContext.Provider value={{ session, loading, refreshSession }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
}

// Función helper para disparar el evento de cambio de sesión
export function notifySessionChange() {
    sessionFetched = false; // Invalidar cache
    window.dispatchEvent(new Event("session-changed"));
}
