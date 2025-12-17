"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, User, AtSign, Loader2, Shield } from "lucide-react";
import { notifySessionChange } from "@/components/admin/SessionProvider";

type Mode = "login" | "register";

export function AuthModal({ open, onClose, defaultMode = "login" }: { open: boolean; onClose: () => void; defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const openRef = useRef(open);
  const onCloseRef = useRef(onClose);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const googleEnabled = !!(googleClientId && !googleClientId.includes("TU_CLIENT_ID_DE_GOOGLE"));
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleInitializedRef = useRef(false);

  openRef.current = open;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setError(null);
      setSuccess(null);
      setLoading(false);
      setGoogleReady(false);
    }
  }, [open, defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string> = { username, password };
      if (mode === "register" && email) body.email = email;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (mode === "register" && adminToken.trim()) headers["x-admin-token"] = adminToken.trim();

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudo autenticar.");
        return;
      }

      setSuccess(mode === "login" ? "Sesión iniciada." : "Usuario creado.");
      await notifySessionChange();
      onCloseRef.current();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const loadGoogleScript = () =>
    new Promise<void>((resolve, reject) => {
      const googleScriptId = "google-identity";
      if (document.getElementById(googleScriptId)) return resolve();
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = googleScriptId;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar Google Identity"));
      document.head.appendChild(script);
    });

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data?.error || "Error con Google");
      setLoading(false);
      return;
    }
    await notifySessionChange();
    onCloseRef.current();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!open || !googleEnabled) return;
    let cancelled = false;

    const start = async () => {
      try {
        await loadGoogleScript();
        if (cancelled) return;
        // @ts-expect-error global GIS
        const google = window.google;
        if (!google?.accounts?.id) {
          if (!cancelled) setError("Google Identity no disponible.");
          return;
        }

        if (!googleInitializedRef.current) {
          google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response: { credential?: string }) => {
              if (!response?.credential) {
                if (openRef.current) setError("No se obtuvo credencial de Google.");
                return;
              }
              void handleGoogleCredential(response.credential);
            },
          });
          googleInitializedRef.current = true;
        }

        if (cancelled) return;
        if (googleButtonRef.current) {
          googleButtonRef.current.innerHTML = "";
          google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: 320,
          });
          if (!cancelled) setGoogleReady(true);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se pudo cargar Google.");
      }
    };

    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let scheduledWithIdle = false;
    let scheduledId = 0;

    if (typeof w.requestIdleCallback === "function") {
      scheduledWithIdle = true;
      scheduledId = w.requestIdleCallback(() => void start(), { timeout: 1500 });
    } else {
      scheduledId = window.setTimeout(() => void start(), 250);
    }

    return () => {
      cancelled = true;
      if (scheduledWithIdle && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(scheduledId);
      } else {
        window.clearTimeout(scheduledId);
      }
      try {
        // @ts-expect-error global GIS
        const google = window.google;
        google?.accounts?.id?.cancel?.();
      } catch {
        // noop
      }
    };
  }, [open, googleClientId, googleEnabled, handleGoogleCredential]);

  if (!open) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ fontFamily: "var(--font-ui, system-ui, sans-serif)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-neo-border bg-neo-card shadow-2xl shadow-black/40 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neo-border px-6 py-4">
          <div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-neo-text-secondary">Acceso</p>
            <h2 className="text-xl font-bold text-neo-text-primary">{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neo-border bg-neo-surface text-neo-text-secondary transition-colors hover:border-neo-primary/40 hover:text-neo-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5">
          <div className="flex rounded-2xl border border-neo-border bg-neo-surface p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                mode === "login" 
                  ? "bg-neo-primary text-white shadow-sm" 
                  : "text-neo-text-secondary hover:text-neo-text-primary"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                mode === "register" 
                  ? "bg-neo-primary text-white shadow-sm" 
                  : "text-neo-text-secondary hover:text-neo-text-primary"
              }`}
            >
              Registrarse
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold text-neo-text-secondary">Usuario</label>
            <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
              <User className="h-4 w-4 shrink-0 text-neo-text-secondary" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 bg-transparent text-sm text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                placeholder="tu_usuario"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-neo-text-secondary">Contraseña</label>
            <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
              <Lock className="h-4 w-4 shrink-0 text-neo-text-secondary" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-sm text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                placeholder="••••••••"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          </div>

          {mode === "register" && (
            <>
              <div>
                <label className="mb-2 block text-xs font-semibold text-neo-text-secondary">Correo (opcional)</label>
                <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                  <AtSign className="h-4 w-4 shrink-0 text-neo-text-secondary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                    placeholder="tu@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-neo-text-secondary">Admin token (opcional)</label>
                <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                  <Shield className="h-4 w-4 shrink-0 text-neo-text-secondary" />
                  <input
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                    placeholder="Si existe otro admin"
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-2xl border border-accent-danger/40 bg-accent-danger/10 px-4 py-3">
              <p className="text-sm font-semibold text-accent-danger">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-neo-primary px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-neo-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>

          {googleEnabled ? (
            <div className="pt-2">
              <div className="relative flex items-center py-2">
                <div className="flex-1 border-t border-neo-border"></div>
                <span className="px-3 text-xs font-semibold text-neo-text-secondary">o continúa con</span>
                <div className="flex-1 border-t border-neo-border"></div>
              </div>
              <div className="flex justify-center rounded-2xl border border-neo-border bg-neo-surface p-3">
                <div ref={googleButtonRef} className="flex justify-center" />
              </div>
              {!googleReady && (
                <p className="mt-2 text-center text-[11px] font-medium text-neo-text-secondary">Cargando Google…</p>
              )}
            </div>
          ) : (
            <p className="pt-2 text-center text-[11px] font-medium text-neo-text-secondary">
              Configura NEXT_PUBLIC_GOOGLE_CLIENT_ID para habilitar Google.
            </p>
          )}
        </form>
      </div>
    </div>
  );

  // Usar portal para renderizar fuera del DOM padre y evitar overflow:hidden
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
