"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";

type Preferences = {
  realtimeAlerts: boolean;
  nightlyDigest: boolean;
  ipLockdown: boolean;
  shareTelemetry: boolean;
};

export default function AdminSettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>({
    realtimeAlerts: true,
    nightlyDigest: false,
    ipLockdown: false,
    shareTelemetry: true,
  });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("dicc_live_xxxxx");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setStatus(null);
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("Preferencias sincronizadas correctamente");
    });
  };

  const regenerateKey = () => {
    setApiKey(`dicc_live_${Math.random().toString(36).slice(2, 10)}`);
    setStatus("Nuevo token generado. Actualiza tus integraciones.");
  };

  return (
    <div className="space-y-8 text-neo-text-primary">
      <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-8 shadow-glow-card">
        <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-3 shadow-glow-card">
              <Icon library="lucide" name="ShieldCheck" className="h-7 w-7 text-accent-emerald" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">Seguridad & Operaciones</p>
            <h1 className="text-3xl font-semibold">Ajustes avanzados</h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-neo-text-secondary">
          Define políticas, webhooks y automatizaciones para mantener el diccionario estable y auditado.
        </p>
        {status ? <p className="mt-4 text-sm text-accent-secondary">{status}</p> : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6 rounded-3xl border border-white/10 bg-ink-900/60 p-6 shadow-glow-card">
          <header>
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Alertas</p>
            <h2 className="text-lg font-semibold">Notificaciones críticas</h2>
          </header>
          <div className="space-y-4">
            <PreferenceToggle
              iconName="Bell"
              title="Alertas en tiempo real"
              description="Mensajes directos cuando un término cae o hay fallos de autenticación."
              checked={preferences.realtimeAlerts}
              onChange={() => handleToggle("realtimeAlerts")}
            />
            <PreferenceToggle
              iconName="Globe"
              title="Resumen nocturno"
              description="Correo consolidado con pendientes, nuevos términos y métricas clave."
              checked={preferences.nightlyDigest}
              onChange={() => handleToggle("nightlyDigest")}
            />
            <PreferenceToggle
              iconName="ShieldCheck"
              title="Modo IP Lockdown"
              description="Limita el panel admin a subredes aprobadas."
              checked={preferences.ipLockdown}
              onChange={() => handleToggle("ipLockdown")}
            />
            <PreferenceToggle
              iconName="Database"
              title="Compartir telemetría anónima"
              description="Ayuda a detectar consultas con mala salud de datos."
              checked={preferences.shareTelemetry}
              onChange={() => handleToggle("shareTelemetry")}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button className="btn-ghost" type="button" onClick={() => setPreferences({ realtimeAlerts: true, nightlyDigest: false, ipLockdown: false, shareTelemetry: true })}>
              Restaurar defaults
            </button>
            <button className="btn-primary" type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Icon library="lucide" name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <Icon library="lucide" name="Save" className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-white/10 bg-ink-900/60 p-6 shadow-glow-card">
          <header>
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Integraciones</p>
            <h2 className="text-lg font-semibold">Webhooks & API</h2>
          </header>
          <label className="block text-sm text-neo-text-secondary">
            Webhook de sincronización
            <input
              className="mt-2 w-full rounded-2xl border border-white/15 bg-ink-950 px-4 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
              placeholder="https://automation.n8n.app/hooks/diccionario"
              value={webhookUrl}
              onChange={(event) => setWebhookUrl(event.target.value)}
            />
          </label>
          <label className="block text-sm text-neo-text-secondary">
            Token de servicio
            <div className="mt-2 flex rounded-2xl border border-white/15 bg-ink-950">
              <input
                className="flex-1 bg-transparent px-4 py-2 text-neo-text-primary focus:outline-none"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
              />
              <button type="button" className="border-l border-white/10 px-4 text-sm text-accent-secondary hover:text-accent-secondary" onClick={regenerateKey}>
                Regenerar
              </button>
            </div>
            <p className="mt-1 text-xs text-neo-text-secondary">Actualiza tus workers cada vez que cambies este token.</p>
          </label>
        </section>
      </div>
    </div>
  );
}

type PreferenceToggleProps = {
  iconName: string;
  iconLibrary?: "lucide" | "phosphor" | "tabler";
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
};

function PreferenceToggle({ iconName, iconLibrary = "lucide", title, description, checked, onChange }: PreferenceToggleProps) {
  return (
    <label className={`flex items-start gap-4 rounded-2xl border px-4 py-3 transition ${checked ? "border-accent-secondary/50 bg-accent-secondary/5" : "border-white/10 bg-ink-950/60"}`}>
      <input type="checkbox" className="mt-1 h-4 w-4 accent-accent-secondary" checked={checked} onChange={onChange} />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon library={iconLibrary} name={iconName} className="h-4 w-4 text-accent-secondary" size={16} /> {title}
        </div>
        <p className="text-xs text-neo-text-secondary">{description}</p>
      </div>
    </label>
  );
}
