"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useUser, type SessionUser } from "@/hooks/useUser";
import { mutate } from "swr";

type SessionContextType = {
    session: SessionUser | null;
    loading: boolean;
    refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoading, mutate: mutateUser } = useUser();

    // Escuchar eventos personalizados de cambio de sesión para compatibilidad
    useEffect(() => {
        const handleSessionChange = () => {
            mutateUser();
        };

        window.addEventListener("session-changed", handleSessionChange);
        return () => {
            window.removeEventListener("session-changed", handleSessionChange);
        };
    }, [mutateUser]);

    return (
        <SessionContext.Provider value={{ session: user || null, loading: isLoading, refreshSession: mutateUser }}>
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
// Ahora también invalida la caché de SWR globalmente para /api/auth
export function notifySessionChange() {
    mutate("/api/auth"); // Invalida SWR directamente
    window.dispatchEvent(new Event("session-changed")); // Mantiene compatibilidad
}
