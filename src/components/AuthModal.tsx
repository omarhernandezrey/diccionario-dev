"use client";

import { useEffect, useRef, useState } from "react";
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
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const googleEnabled = !!(googleClientId && !googleClientId.includes("TU_CLIENT_ID_DE_GOOGLE"));
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setError(null);
      setSuccess(null);
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
      onClose();
    } catch (err: any) {
      setError(err?.message || "Error inesperado");
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

  const handleGoogleCredential = async (credential: string) => {
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
    onClose();
    setLoading(false);
  };

  useEffect(() => {
    if (!open || !googleEnabled) return;
    let cancelled = false;
    (async () => {
      try {
        await loadGoogleScript();
        // @ts-expect-error global GIS
        const google = window.google;
        if (!google?.accounts?.id) {
          setError("Google Identity no disponible.");
          return;
        }
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (cancelled) return;
            if (!response?.credential) {
              setError("No se obtuvo credencial de Google.");
              return;
            }
            handleGoogleCredential(response.credential);
          },
        });
        if (googleButtonRef.current) {
          google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: 320,
          });
        }
      } catch (err: any) {
        setError(err?.message || "No se pudo cargar Google.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, googleClientId, googleEnabled]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex min-h-screen items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 shadow-[0_25px_80px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Acceso</p>
            <h2 className="text-lg font-bold text-white">{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-800 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900/60 p-1 text-xs font-semibold text-slate-300">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg px-3 py-2 transition-colors ${mode === "login" ? "bg-slate-800 text-white" : "hover:text-white"}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 rounded-lg px-3 py-2 transition-colors ${mode === "register" ? "bg-slate-800 text-white" : "hover:text-white"}`}
            >
              Registrarse
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-5 py-4">
          <label className="space-y-1 block">
            <span className="text-xs text-slate-400">Usuario</span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
              <User className="h-4 w-4 text-slate-500" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                placeholder="tu_usuario"
                required
              />
            </div>
          </label>

          <label className="space-y-1 block">
            <span className="text-xs text-slate-400">Contraseña</span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
              <Lock className="h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          {mode === "register" && (
            <>
              <label className="space-y-1 block">
                <span className="text-xs text-slate-400">Correo (opcional)</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <AtSign className="h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                    placeholder="tu@email.com"
                  />
                </div>
              </label>

              <label className="space-y-1 block">
                <span className="text-xs text-slate-400">Admin token (si existe otro admin)</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <Shield className="h-4 w-4 text-slate-500" />
                  <input
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
                    placeholder="Opcional"
                  />
                </div>
              </label>
            </>
          )}

          {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</p>}
          {success && <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>

          {googleEnabled ? (
            <div className="space-y-2">
              <div ref={googleButtonRef} className="flex justify-center" />
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  // @ts-expect-error global GIS
                  window.google?.accounts?.id?.prompt();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:border-emerald-500/50 hover:text-emerald-200 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-4 w-4" />}
                Usar Google (popup)
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 text-center">Configura NEXT_PUBLIC_GOOGLE_CLIENT_ID con un client ID válido para habilitar Google.</p>
          )}
        </form>
      </div>
    </div>
  );
}
