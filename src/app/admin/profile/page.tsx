"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

type SessionUser = {
  id: number;
  username: string;
  role: "admin" | "user";
  email?: string | null;
};

const sanitize = (value: string | null | undefined) => value?.trim() || "No especificado";

export default function AdminProfilePage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("Omar Hernandez Rey");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth", { cache: "no-store" })
      .then((res) => res.json())
      .then((payload) => {
        if (cancelled) return;
        if (payload?.user) {
          setSession(payload.user as SessionUser);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = () => {
    setStatus(null);
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("Perfil actualizado (solo visual, sin persistir en backend).");
    });
  };

  const copyId = () => {
    if (!session) return;
    navigator.clipboard.writeText(String(session.id)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="space-y-8 text-neo-text-primary">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-8 shadow-glow-card">
        <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-3 shadow-glow-card">
              <Icon library="lucide" name="User" className="h-7 w-7 text-accent-secondary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">Cuenta</p>
            <h1 className="text-3xl font-semibold">Perfil de Omar Hernandez Rey</h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-neo-text-secondary">Verifica tus datos, renombra tu visor y copia identificadores para soporte.</p>
        {status ? <p className="mt-4 text-sm text-accent-secondary">{status}</p> : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6 rounded-3xl border border-white/10 bg-ink-900/60 p-6 shadow-glow-card">
          <header>
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Identidad</p>
            <h2 className="text-lg font-semibold">Datos principales</h2>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard label="Usuario" value={sanitize(session?.username)} icon={<Icon library="lucide" name="User" className="h-4 w-4 text-accent-secondary" />} loading={loading} />
            <InfoCard label="Rol" value={session?.role === "admin" ? "Administrador" : "Usuario"} icon={<Icon library="lucide" name="ShieldCheck" className="h-4 w-4 text-accent-emerald" />} loading={loading} />
            <InfoCard label="Email" value={sanitize(session?.email)} icon={<Icon library="lucide" name="Mail" className="h-4 w-4 text-accent-secondary" />} loading={loading} />
            <InfoCard
              label="ID interno"
              value={session ? `#${session.id}` : "-"}
            icon={<Icon library="lucide" name="KeyRound" className="h-4 w-4 text-accent-secondary" />}
            loading={loading}
            action={
              <button className="flex items-center gap-1 text-xs text-accent-secondary hover:text-accent-secondary" type="button" onClick={copyId} disabled={!session}>
                  {copied ? (
                    <Icon library="lucide" name="Check" className="h-4 w-4" />
                  ) : (
                    <Icon library="lucide" name="Copy" className="h-4 w-4" />
                  )}
                  {copied ? "Copiado" : "Copiar"}
                </button>
              }
            />
          </div>

          <label className="block text-sm text-neo-text-secondary">
            Nombre público
            <input
              className="mt-2 w-full rounded-2xl border border-white/15 bg-ink-950 px-4 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <button className="btn-primary" type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Icon library="lucide" name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                "Guardar ajustes"
              )}
            </button>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-white/10 bg-ink-900/60 p-6 shadow-glow-card">
          <header>
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Actividades recientes</p>
            <h2 className="text-lg font-semibold">Timeline personal</h2>
          </header>
          <ul className="space-y-4 text-sm text-neo-text-secondary">
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-semibold text-neo-text-primary">Último acceso</p>
              <p className="text-xs text-neo-text-secondary">Hace 3 minutos desde WSL2</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-semibold text-neo-text-primary">Término editado</p>
              <p className="text-xs text-neo-text-secondary">Actualizaste “CSS Grid” ayer</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="font-semibold text-neo-text-primary">Puntos de contribución</p>
              <p className="text-xs text-neo-text-secondary">198 pts · Nivel Senior Curator</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

type InfoCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  loading: boolean;
  action?: ReactNode;
};

function InfoCard({ label, value, icon, loading, action }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-neo-text-secondary">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-neo-text-primary">
          {icon}
          {loading ? "Cargando…" : value}
        </div>
        {action}
      </div>
    </div>
  );
}
