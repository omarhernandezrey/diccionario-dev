"use client";

import { useEffect } from "react";

// Detecta errores de carga de chunks (por cambios de build o caché) y fuerza un reload suave.
export default function ChunkRecovery() {
  useEffect(() => {
    const flagKey = "chunk-reload-attempted";

    // Limpiar el flag al montar para permitir un nuevo intento limpio
    try {
      window.sessionStorage.removeItem(flagKey);
    } catch {
      /* noop */
    }

    const triggerReload = () => {
      try {
        const alreadyTried = window.sessionStorage.getItem(flagKey);
        if (alreadyTried) return;
        window.sessionStorage.setItem(flagKey, "1");
      } catch {
        /* noop */
      }
      window.location.reload();
    };

    const isChunkError = (err: unknown): boolean => {
      if (!err) return false;
      const name = typeof err === "object" && "name" in err ? (err as { name?: string }).name : undefined;
      const message = typeof err === "string" ? err : typeof err === "object" && "message" in err ? (err as { message?: string }).message : "";
      return Boolean(name === "ChunkLoadError" || message?.includes("ChunkLoadError") || message?.includes("Loading chunk"));
    };

    const handleError = (event: ErrorEvent) => {
      if (isChunkError(event?.error) || isChunkError(event?.message)) {
        triggerReload();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isChunkError(event?.reason)) {
        triggerReload();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
