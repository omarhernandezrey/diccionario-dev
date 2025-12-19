"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/Icon";

type SystemConfig = {
  appName: string;
  language: "es" | "en";
  theme: "system" | "light" | "dark";
  notifications: boolean;
  newsletter: boolean;
  ipLockdown: boolean;
  shareTelemetry: boolean;
};

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig>({
    appName: "Diccionario Dev",
    language: "es",
    theme: "system",
    notifications: true,
    newsletter: false,
    ipLockdown: false,
    shareTelemetry: true,
  });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiKey, setApiKey] = useState("dicc_live_xxxxx");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (key: keyof SystemConfig) => {
    if (typeof config[key] === "boolean") {
      setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSave = () => {
    setStatus(null);
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("Configuración del sistema actualizada correctamente");
    });
  };

  const regenerateKey = () => {
    setApiKey(`dicc_live_${Math.random().toString(36).slice(2, 10)}`);
    setStatus("Nuevo token generado. Actualiza tus integraciones.");
  };

  return (
    <div className="space-y-8 text-neo-text-primary">
      <section className="relative overflow-hidden rounded-4xl border border-neo-border bg-neo-card p-5 sm:p-8 shadow-glow-card">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-linear-to-l from-neo-primary/10 to-transparent blur-3xl lg:block" />
        <div className="relative flex flex-wrap items-center gap-4">
          <div className="rounded-3xl border border-neo-border bg-neo-surface p-3 shadow-glow-card">
            <Icon library="lucide" name="Settings" className="h-7 w-7 text-neo-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">Administración</p>
            <h1 className="text-2xl font-semibold sm:text-3xl">Configuración General</h1>
          </div>
        </div>
        <p className="relative mt-4 w-full text-sm text-neo-text-secondary">
          Define la identidad de la aplicación, apariencia global y políticas de seguridad.
        </p>
        {status ? (
          <div className="relative mt-4 flex items-center gap-2 text-sm text-accent-emerald">
            <Icon library="lucide" name="CheckCircle" className="h-4 w-4" />
            {status}
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="space-y-6 rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
            <header>
              <p className="text-xs uppercase tracking-wide text-neo-text-secondary">General</p>
              <h2 className="text-lg font-semibold">Identidad y Apariencia</h2>
            </header>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neo-text-primary mb-2">Nombre de la Aplicación</label>
                <input
                  type="text"
                  value={config.appName}
                  onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                  className="w-full rounded-xl border border-neo-border bg-neo-bg px-4 py-2 text-sm text-neo-text-primary focus:border-neo-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-neo-text-primary mb-2">Idioma por defecto</label>
                  <select
                    value={config.language}
                    onChange={(e) => setConfig({ ...config, language: e.target.value as "es" | "en" })}
                    className="w-full rounded-xl border border-neo-border bg-neo-bg px-4 py-2 text-sm text-neo-text-primary focus:border-neo-primary focus:outline-none"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neo-text-primary mb-2">Tema Global</label>
                  <div className="flex rounded-xl border border-neo-border bg-neo-bg p-1">
                    {(["system", "light", "dark"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setConfig({ ...config, theme: t })}
                        className={`flex-1 rounded-lg py-1 text-xs capitalize transition-colors ${
                          config.theme === t
                            ? "bg-neo-primary text-white shadow-sm"
                            : "text-neo-text-secondary hover:text-neo-text-primary"
                        }`}
                      >
                        {t === "system" ? "Auto" : t === "light" ? "Claro" : "Oscuro"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
            <header>
              <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Seguridad</p>
              <h2 className="text-lg font-semibold">Políticas de Acceso</h2>
            </header>
            <div className="space-y-4">
              <PreferenceToggle
                iconName="ShieldCheck"
                title="Modo IP Lockdown"
                description="Limita el acceso al panel de administración únicamente a subredes aprobadas."
                checked={config.ipLockdown}
                onChange={() => handleToggle("ipLockdown")}
              />
              <PreferenceToggle
                iconName="Database"
                title="Compartir telemetría"
                description="Envía estadísticas de uso anónimas para mejorar el rendimiento."
                checked={config.shareTelemetry}
                onChange={() => handleToggle("shareTelemetry")}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-6 rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
            <header>
              <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Comunicaciones</p>
              <h2 className="text-lg font-semibold">Notificaciones del Sistema</h2>
            </header>
            <div className="space-y-4">
              <PreferenceToggle
                iconName="Bell"
                title="Alertas Globales"
                description="Habilitar sistema de notificaciones push para todos los usuarios."
                checked={config.notifications}
                onChange={() => handleToggle("notifications")}
              />
              <PreferenceToggle
                iconName="Mail"
                title="Newsletter Semanal"
                description="Envío automático de resumen de actividad los lunes."
                checked={config.newsletter}
                onChange={() => handleToggle("newsletter")}
              />
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
            <header>
              <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Integraciones</p>
              <h2 className="text-lg font-semibold">Webhooks & API</h2>
            </header>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neo-text-primary mb-2">
                  Webhook de sincronización
                </label>
                <input
                  className="w-full rounded-xl border border-neo-border bg-neo-bg px-4 py-2 text-sm text-neo-text-primary focus:border-neo-primary focus:outline-none"
                  placeholder="https://automation.n8n.app/hooks/diccionario"
                  value={webhookUrl}
                  onChange={(event) => setWebhookUrl(event.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neo-text-primary mb-2">
                  Token de servicio
                </label>
                <div className="flex rounded-xl border border-neo-border bg-neo-bg overflow-hidden">
                  <input
                    className="flex-1 bg-transparent px-4 py-2 text-sm text-neo-text-primary focus:outline-none font-mono"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                  />
                  <button 
                    type="button" 
                    className="border-l border-neo-border px-4 text-xs font-medium text-neo-primary hover:bg-neo-primary/10 transition-colors" 
                    onClick={regenerateKey}
                  >
                    Regenerar
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          <div className="flex justify-end pt-4">
            <button className="btn-primary w-full justify-center" type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Icon library="lucide" name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <Icon library="lucide" name="Save" className="mr-2 h-4 w-4" />
                  Guardar Configuración
                </>
              )}
            </button>
          </div>
        </div>
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
    <label className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all ${
      checked 
        ? "border-neo-primary/50 bg-neo-primary/5 shadow-sm" 
        : "border-neo-border bg-neo-card hover:border-neo-primary/30"
    }`}>
      <div className={`mt-1 flex h-5 w-5 items-center justify-center rounded border transition-colors ${
        checked ? "border-neo-primary bg-neo-primary text-white" : "border-neo-border bg-neo-bg"
      }`}>
        {checked && <Icon library="lucide" name="Check" className="h-3 w-3" />}
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-neo-text-primary">
          <Icon library={iconLibrary} name={iconName} className={`h-4 w-4 ${checked ? "text-neo-primary" : "text-neo-text-secondary"}`} size={16} /> 
          {title}
        </div>
        <p className="text-xs text-neo-text-secondary leading-relaxed">{description}</p>
      </div>
    </label>
  );
}
