"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Lock, User, AtSign, Loader2, Shield, Eye, EyeOff } from "lucide-react";
import { notifySessionChange } from "@/components/admin/SessionProvider";

type Mode = "login" | "register" | "recover";

export function AuthModal({ open, onClose, defaultMode = "login" }: { open: boolean; onClose: () => void; defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"request" | "confirm">("request");
  const [recoveryIdentifier, setRecoveryIdentifier] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
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

  const passwordRules = [
    { label: "8+ caracteres", test: (value: string) => value.length >= 8 },
    { label: "1 letra", test: (value: string) => /[a-zA-Z]/.test(value) },
    { label: "1 número", test: (value: string) => /\d/.test(value) },
  ];
  const passwordValid = passwordRules.every((rule) => rule.test(password));
  const resetPasswordValid = passwordRules.every((rule) => rule.test(resetPassword));
  const registerMismatch = mode === "register" && confirmPassword && password !== confirmPassword;
  const resetMismatch = resetConfirm && resetPassword !== resetConfirm;
  const isRecover = mode === "recover";
  const handleCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(event.getModifierState("CapsLock"));
  };

  openRef.current = open;
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");
      setAdminToken("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setCapsLockOn(false);
      setRecoveryStep("request");
      setRecoveryIdentifier("");
      setRecoveryToken("");
      setResetPassword("");
      setResetConfirm("");
      setShowResetPassword(false);
      setShowResetConfirm(false);
      setTokenCopied(false);
      setError(null);
      setSuccess(null);
      setLoading(false);
      setGoogleReady(false);
    }
  }, [open, defaultMode]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(null);
    setCapsLockOn(false);
    setTokenCopied(false);
  }, [mode, recoveryStep, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      if (!passwordValid) {
        setError("La contraseña no cumple los requisitos mínimos.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body: Record<string, string> = { username, password };
      if (mode === "register" && email) body.email = email;
      if (mode === "register" && adminToken.trim()) body.role = "admin";
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

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryIdentifier.trim()) {
      setError("Ingresa tu usuario o correo.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/auth/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: recoveryIdentifier }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudo iniciar la recuperación.");
        return;
      }
      setSuccess(data?.message || "Revisa tu correo para continuar.");
      if (data?.retryAfter) {
        setSuccess(`Revisa tu correo. Puedes intentarlo de nuevo en ${data.retryAfter}s.`);
      }
      if (data?.recoveryToken) {
        setRecoveryToken(String(data.recoveryToken));
        setRecoveryStep("confirm");
      } else {
        setRecoveryStep("confirm");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryToken.trim()) {
      setError("Ingresa el código de recuperación.");
      return;
    }
    if (!resetPasswordValid) {
      setError("La contraseña no cumple los requisitos mínimos.");
      return;
    }
    if (resetPassword !== resetConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/auth/recovery/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: recoveryToken, password: resetPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudo actualizar la contraseña.");
        return;
      }
      setSuccess(data?.message || "Contraseña actualizada.");
      setMode("login");
      setPassword("");
      setConfirmPassword("");
      setResetPassword("");
      setResetConfirm("");
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
    if (!open || !googleEnabled || mode === "recover") return;
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
  }, [open, googleClientId, googleEnabled, handleGoogleCredential, mode]);

  if (!open) return null;

  const modalTitle = mode === "login" ? "Iniciar sesión" : mode === "register" ? "Crear cuenta" : "Recuperar contraseña";
  const submitLabel = isRecover
    ? recoveryStep === "request"
      ? "Enviar instrucciones"
      : "Actualizar contraseña"
    : mode === "login"
      ? "Entrar"
      : "Crear cuenta";
  const submitDisabled = isRecover
    ? recoveryStep === "request"
      ? !recoveryIdentifier.trim() || loading
      : !recoveryToken.trim() || !resetPasswordValid || resetPassword !== resetConfirm || loading
    : mode === "login"
      ? !username.trim() || !password || loading
      : !username.trim() || !password || !confirmPassword || registerMismatch || !passwordValid || loading;

  const formSubmit = isRecover
    ? recoveryStep === "request"
      ? handleRecoveryRequest
      : handleRecoveryConfirm
    : handleSubmit;

  const modalContent = (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={modalTitle}
        className="dd-auth-modal relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-neo-border bg-neo-card font-sans shadow-2xl shadow-black/40 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neo-border px-6 py-4">
          <div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-neo-text-secondary">Acceso</p>
            <h2 className="text-xl lg:text-2xl font-bold text-neo-text-primary">{modalTitle}</h2>
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
        {mode !== "recover" ? (
          <div className="px-6 pt-5">
            <div className="flex rounded-2xl border border-neo-border bg-neo-surface p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-lg py-2.5 text-sm lg:text-base font-semibold transition-all ${
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
                className={`flex-1 rounded-lg py-2.5 text-sm lg:text-base font-semibold transition-all ${
                  mode === "register" 
                    ? "bg-neo-primary text-white shadow-sm" 
                    : "text-neo-text-secondary hover:text-neo-text-primary"
                }`}
              >
                Registrarse
              </button>
            </div>
          </div>
        ) : (
          <div className="px-6 pt-5">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-xs lg:text-sm font-semibold text-neo-text-secondary hover:text-neo-text-primary"
            >
              ← Volver a iniciar sesión
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={formSubmit} className="px-6 py-5 space-y-4">
          {!isRecover ? (
            <>
              <div>
                <label className="mb-2 block text-xs lg:text-sm font-semibold text-neo-text-secondary">
                  {mode === "login" ? "Usuario o correo" : "Usuario"}
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                  <User className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-neo-text-secondary" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 bg-transparent text-sm lg:text-base text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                    placeholder={mode === "login" ? "usuario o correo" : "tu_usuario"}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs lg:text-sm font-semibold text-neo-text-secondary">Contraseña</label>
                <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                  <Lock className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-neo-text-secondary" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={handleCapsLock}
                    className="flex-1 bg-transparent text-sm lg:text-base text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                    placeholder="••••••••"
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-neo-text-secondary hover:text-neo-text-primary"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {capsLockOn ? (
                  <p className="mt-1 text-[11px] font-semibold text-accent-danger">Caps Lock activado.</p>
                ) : null}
              </div>

              {mode === "login" ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode("recover");
                    setRecoveryStep("request");
                    setRecoveryIdentifier(username);
                  }}
                  className="text-xs font-semibold text-neo-text-secondary hover:text-neo-text-primary"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              ) : null}

              {mode === "register" && (
                <>
                  <div>
                    <label className="mb-2 block text-xs lg:text-sm font-semibold text-neo-text-secondary">Confirmar contraseña</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                      <Lock className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-neo-text-secondary" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyUp={handleCapsLock}
                        className="flex-1 bg-transparent text-sm lg:text-base text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="text-neo-text-secondary hover:text-neo-text-primary"
                        aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {registerMismatch ? (
                      <p className="mt-1 text-[11px] font-semibold text-accent-danger">Las contraseñas no coinciden.</p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-neo-border bg-neo-surface/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neo-text-secondary">Requisitos</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {passwordRules.map((rule) => {
                        const valid = rule.test(password);
                        return (
                          <span
                            key={rule.label}
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${valid
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "border-neo-border text-neo-text-secondary"
                              }`}
                          >
                            {rule.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs lg:text-sm font-semibold text-neo-text-secondary">Correo (opcional)</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                      <AtSign className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-neo-text-secondary" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-transparent text-sm lg:text-base text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                        placeholder="tu@email.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs lg:text-sm font-semibold text-neo-text-secondary">Admin token (opcional)</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                      <Shield className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-neo-text-secondary" />
                      <input
                        value={adminToken}
                        onChange={(e) => setAdminToken(e.target.value)}
                        className="flex-1 bg-transparent text-sm lg:text-base text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                        placeholder="Si existe otro admin"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {recoveryStep === "request" ? (
                <div>
                  <label className="mb-2 block text-xs lg:text-sm font-semibold text-neo-text-secondary">Usuario o correo</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                    <User className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-neo-text-secondary" />
                    <input
                      value={recoveryIdentifier}
                      onChange={(e) => setRecoveryIdentifier(e.target.value)}
                      className="flex-1 bg-transparent text-sm lg:text-base text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                      placeholder="usuario o correo"
                      required
                      autoComplete="username"
                    />
                  </div>
                  <p className="mt-2 text-xs text-neo-text-secondary">
                    Te enviaremos un enlace o código de recuperación si existe una cuenta asociada.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-2 block text-xs lg:text-sm font-semibold text-neo-text-secondary">Código de recuperación</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                      <Shield className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-neo-text-secondary" />
                      <input
                        value={recoveryToken}
                        onChange={(e) => setRecoveryToken(e.target.value)}
                        className="flex-1 bg-transparent text-sm lg:text-base text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                        placeholder="Pega el código"
                        required
                        autoComplete="one-time-code"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs lg:text-sm font-semibold text-neo-text-secondary">Nueva contraseña</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                      <Lock className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-neo-text-secondary" />
                      <input
                        type={showResetPassword ? "text" : "password"}
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        onKeyUp={handleCapsLock}
                        className="flex-1 bg-transparent text-sm lg:text-base text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword((prev) => !prev)}
                        className="text-neo-text-secondary hover:text-neo-text-primary"
                        aria-label={showResetPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {capsLockOn ? (
                      <p className="mt-1 text-[11px] font-semibold text-accent-danger">Caps Lock activado.</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs lg:text-sm font-semibold text-neo-text-secondary">Confirmar contraseña</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
                      <Lock className="h-4 w-4 lg:h-5 lg:w-5 shrink-0 text-neo-text-secondary" />
                      <input
                        type={showResetConfirm ? "text" : "password"}
                        value={resetConfirm}
                        onChange={(e) => setResetConfirm(e.target.value)}
                        onKeyUp={handleCapsLock}
                        className="flex-1 bg-transparent text-sm lg:text-base text-neo-text-primary placeholder:text-neo-text-secondary/70 focus:outline-none"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm((prev) => !prev)}
                        className="text-neo-text-secondary hover:text-neo-text-primary"
                        aria-label={showResetConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showResetConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {resetMismatch ? (
                      <p className="mt-1 text-[11px] font-semibold text-accent-danger">Las contraseñas no coinciden.</p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-neo-border bg-neo-surface/70 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neo-text-secondary">Requisitos</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {passwordRules.map((rule) => {
                        const valid = rule.test(resetPassword);
                        return (
                          <span
                            key={rule.label}
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${valid
                              ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "border-neo-border text-neo-text-secondary"
                              }`}
                          >
                            {rule.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between text-xs">
                {recoveryStep === "request" ? (
                  <button
                    type="button"
                    onClick={() => setRecoveryStep("confirm")}
                    className="font-semibold text-neo-text-secondary hover:text-neo-text-primary"
                  >
                    Ya tengo un código
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRecoveryStep("request")}
                    className="font-semibold text-neo-text-secondary hover:text-neo-text-primary"
                  >
                    Solicitar otro código
                  </button>
                )}
              </div>

              {recoveryToken ? (
                <div className="rounded-2xl border border-neo-border bg-neo-surface/70 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-neo-text-secondary">Código temporal (modo local)</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(recoveryToken);
                        setTokenCopied(true);
                      }}
                      className="text-xs font-semibold text-neo-primary"
                    >
                      {tokenCopied ? "Copiado" : "Copiar"}
                    </button>
                  </div>
                  <p className="mt-2 break-all text-xs font-mono text-neo-text-primary">{recoveryToken}</p>
                </div>
              ) : null}
            </>
          )}

          {error && (
            <div className="rounded-2xl border border-accent-danger/40 bg-accent-danger/10 px-4 py-3" role="alert">
              <p className="text-sm lg:text-base font-semibold text-accent-danger">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3" aria-live="polite">
              <p className="text-sm lg:text-base font-semibold text-emerald-600 dark:text-emerald-300">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitDisabled}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-neo-primary px-4 py-3.5 text-sm lg:text-base font-bold text-white transition-all hover:bg-neo-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
            ) : isRecover ? (
              <Shield className="h-4 w-4 lg:h-5 lg:w-5" />
            ) : (
              <Lock className="h-4 w-4 lg:h-5 lg:w-5" />
            )}
            {submitLabel}
          </button>

          {!isRecover && googleEnabled ? (
            <div className="pt-2">
              <div className="relative flex items-center py-2">
                <div className="flex-1 border-t border-neo-border"></div>
                <span className="px-3 text-xs lg:text-sm font-semibold text-neo-text-secondary">o continúa con</span>
                <div className="flex-1 border-t border-neo-border"></div>
              </div>
              <div className="flex justify-center rounded-2xl border border-neo-border bg-neo-surface p-3">
                <div ref={googleButtonRef} className="flex justify-center" />
              </div>
              {!googleReady && (
                <p className="mt-2 text-center text-[11px] lg:text-xs font-medium text-neo-text-secondary">Cargando Google…</p>
              )}
            </div>
          ) : !isRecover ? (
            <p className="pt-2 text-center text-[11px] lg:text-xs font-medium text-neo-text-secondary">
              Configura NEXT_PUBLIC_GOOGLE_CLIENT_ID para habilitar Google.
            </p>
          ) : null}
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
