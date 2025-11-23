"use client";

import { useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { notifySessionChange } from "@/components/admin/SessionProvider";

type SessionUser = {
  id: number;
  username: string;
  role: "admin" | "user";
  email?: string | null;
};

export default function AdminAccessPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allowBootstrap, setAllowBootstrap] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", password: "", email: "", role: "admin" as "admin" | "user" });

  const [isLoggingIn, startLoginTransition] = useTransition();
  const [isRegistering, startRegisterTransition] = useTransition();

  useEffect(() => {
    refreshSession();
  }, []);

  async function refreshSession() {
    setAuthLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      setAllowBootstrap(Boolean(data.allowBootstrap));
      if (res.ok && data?.user) {
        setSession(data.user);
      } else {
        setSession(null);
      }
    } catch {
      setError("No se pudo validar la sesión");
    } finally {
      setAuthLoading(false);
    }
  }

  const loginDisabled = !loginForm.username.trim() || !loginForm.password.trim() || isLoggingIn;
  const registerDisabled = !registerForm.username.trim() || !registerForm.password.trim() || isRegistering;

  function login() {
    if (loginDisabled) return;
    setError(null);
    setMessage(null);
    startLoginTransition(async () => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginForm),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || "Credenciales inválidas");
          return;
        }
        setLoginForm({ username: "", password: "" });
        setMessage(`Bienvenido ${data.user?.username || ""}`);
        notifySessionChange(); // Notificar cambio de sesión
        refreshSession();
      } catch {
        setError("No se pudo contactar el servidor");
      }
    });
  }

  function register() {
    if (registerDisabled) return;
    setError(null);
    startRegisterTransition(async () => {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ADMIN_TOKEN) {
        headers["x-admin-token"] = process.env.NEXT_PUBLIC_ADMIN_TOKEN as string;
      }
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          credentials: "include",
          headers,
          body: JSON.stringify(registerForm),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || "No se pudo registrar");
          return;
        }
        setMessage(`Cuenta ${data.user?.username || ""} creada`);
        if (allowBootstrap) {
          refreshSession();
        }
        setRegisterForm({ username: "", password: "", email: "", role: allowBootstrap ? "admin" : "user" });
      } catch {
        setError("No se pudo contactar el servidor");
      }
    });
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE", credentials: "include" });
    setSession(null);
    setMessage("Sesión cerrada");
    notifySessionChange(); // Notificar cambio de sesión
    refreshSession();
  }

  return (
    <div className="space-y-8 text-neo-text-primary">
      <section className="rounded-[32px] border border-neo-border bg-neo-card p-8 shadow-glow-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-3xl border border-neo-border bg-neo-surface p-3 shadow-glow-card">
            <Icon library="lucide" name="ShieldCheck" className="h-7 w-7 text-accent-emerald" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">Control de acceso</p>
            <h1 className="text-3xl font-semibold">Autenticación avanzada</h1>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-neo-border bg-neo-surface px-4 py-2 text-xs text-neo-text-secondary">
            {session ? (
              <Icon library="lucide" name="CheckCircle2" className="h-4 w-4 text-accent-emerald" />
            ) : authLoading ? (
              <Icon library="lucide" name="RefreshCw" className="h-4 w-4 animate-spin text-accent-secondary" />
            ) : (
              <Icon library="lucide" name="AlertTriangle" className="h-4 w-4 text-accent-danger" />
            )}
            <span>{authLoading ? "Verificando sesión…" : session ? `Activo: ${session.username} (${session.role})` : "Sin sesión activa"}</span>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-neo-text-secondary">
          Centraliza la creación de cuentas, el inicio de sesión y la auditoría de accesos administrativos. Esta vista funciona incluso si el resto del panel no está disponible.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <MetricPill label="Bootstrap" value={allowBootstrap ? "Disponible" : "Cerrado"} icon={<Icon library="lucide" name="KeyRound" className="h-4 w-4 text-accent-secondary" />} />
          <MetricPill label="ID de sesión" value={session ? `#${session.id}` : "-"} icon={<Icon library="lucide" name="UserCircle2" className="h-4 w-4 text-accent-secondary" />} />
          <MetricPill label="Estado" value={authLoading ? "Validando" : session ? "Autenticado" : "Invitado"} icon={<Icon library="lucide" name="Mail" className="h-4 w-4 text-accent-secondary" />} />
        </div>
        {message ? <p className="mt-4 text-sm text-accent-secondary">{message}</p> : null}
        {error ? <p className="mt-2 text-sm text-accent-danger">{error}</p> : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <AuthCard
          title="Iniciar sesión"
          description="Autentica un administrador existente."
          onSubmit={login}
          disabled={loginDisabled}
          isPending={isLoggingIn}
          actionLabel="Entrar"
        >
          <label className="text-sm text-neo-text-secondary">
            Usuario
            <input
              className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-neo-primary focus:outline-none"
              value={loginForm.username}
              onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })}
            />
          </label>
          <label className="text-sm text-neo-text-secondary">
            Contraseña
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-neo-primary focus:outline-none"
              value={loginForm.password}
              onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
            />
          </label>
        </AuthCard>

        <AuthCard
          title={allowBootstrap ? "Crear administrador inicial" : "Registrar usuario"}
          description={
            allowBootstrap ? "El primer usuario recibe rol administrador automáticamente." : "Solo un administrador autenticado puede generar nuevas cuentas."
          }
          onSubmit={register}
          disabled={registerDisabled}
          isPending={isRegistering}
          actionLabel={allowBootstrap ? "Crear administrador" : "Registrar usuario"}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-neo-text-secondary">
              Usuario
              <input
                className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-neo-primary focus:outline-none"
                value={registerForm.username}
                onChange={(event) => setRegisterForm({ ...registerForm, username: event.target.value })}
              />
            </label>
            <label className="text-sm text-neo-text-secondary">
              Correo (opcional)
              <input
                className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-neo-primary focus:outline-none"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-neo-text-secondary">
              Contraseña
              <input
                type="password"
                className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-neo-primary focus:outline-none"
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
              />
            </label>
            {!allowBootstrap && (
              <label className="text-sm text-neo-text-secondary">
                Rol
                <select
                  className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-4 py-2 text-neo-text-primary focus:border-neo-primary focus:outline-none"
                  value={registerForm.role}
                  onChange={(event) => setRegisterForm({ ...registerForm, role: event.target.value as "admin" | "user" })}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </label>
            )}
          </div>
        </AuthCard>
      </div>

      <section className="rounded-3xl border border-neo-border bg-neo-card p-6 shadow-glow-card">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Sesión actual</p>
            <h2 className="text-lg font-semibold">Estado y acciones</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-ghost text-sm" type="button" onClick={refreshSession}>
              Verificar sesión
            </button>
            {session ? (
              <button className="btn-ghost text-sm" type="button" onClick={logout}>
                Cerrar sesión
              </button>
            ) : null}
          </div>
        </header>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <StatusCard label="Usuario" value={session?.username || "-"} helper={session?.email || "Sin correo vinculado"} />
          <StatusCard label="Rol" value={session?.role || "Invitado"} helper={session ? "Acceso completo" : "Solo lectura"} />
          <StatusCard label="Último chequeo" value={new Date().toLocaleTimeString("es-ES")} helper="Hora local" />
        </div>
      </section>

      <section className="rounded-3xl border border-neo-border bg-neo-card p-6 shadow-glow-card">
        <header>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Playbook</p>
          <h2 className="text-lg font-semibold">Protocolos rápidos</h2>
        </header>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          <li className="rounded-2xl border border-neo-border bg-neo-surface p-4">
            <p className="text-sm font-semibold text-neo-text-primary">Bloquear acceso inmediato</p>
            <p className="mt-1 text-xs text-neo-text-secondary">Reinicia sesiones cerrando manualmente desde esta vista.</p>
          </li>
          <li className="rounded-2xl border border-neo-border bg-neo-surface p-4">
            <p className="text-sm font-semibold text-neo-text-primary">Bootstrap seguro</p>
            <p className="mt-1 text-xs text-neo-text-secondary">Utiliza el token `NEXT_PUBLIC_ADMIN_TOKEN` para validar la primera cuenta.</p>
          </li>
        </ul>
      </section>
    </div>
  );
}

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: () => void;
  actionLabel: string;
  disabled: boolean;
  isPending: boolean;
};

function AuthCard({ title, description, children, onSubmit, actionLabel, disabled, isPending }: AuthCardProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-neo-border bg-neo-card p-6 shadow-glow-card">
      <header>
        <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Autenticación</p>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-neo-text-secondary">{description}</p>
      </header>
      <div className="space-y-3">{children}</div>
      <button className="btn-primary w-full" type="button" onClick={onSubmit} disabled={disabled}>
        {isPending ? "Procesando…" : actionLabel}
      </button>
    </section>
  );
}

type MetricPillProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

function MetricPill({ label, value, icon }: MetricPillProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
      <span className="rounded-2xl bg-neo-bg p-2">{icon}</span>
      <div>
        <p className="text-xs uppercase tracking-wide text-neo-text-secondary">{label}</p>
        <p className="text-sm font-semibold text-neo-text-primary">{value}</p>
      </div>
    </div>
  );
}

type StatusCardProps = { label: string; value: string; helper?: string };

function StatusCard({ label, value, helper }: StatusCardProps) {
  return (
    <div className="rounded-2xl border border-neo-border bg-neo-surface px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-neo-text-secondary">{label}</p>
      <p className="text-sm font-semibold text-neo-text-primary" suppressHydrationWarning>{value}</p>
      {helper ? <p className="text-xs text-neo-text-secondary">{helper}</p> : null}
    </div>
  );
}
