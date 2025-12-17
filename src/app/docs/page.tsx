import { ArrowRight, BookOpen, CheckCircle2, CloudLightning, Code2, GitBranch, Globe2, Plug, Rocket, ShieldCheck, Sparkles, Terminal } from "lucide-react";

const codeBlock = `
// Búsqueda básica desde tu frontend
fetch("/api/terms?q=react%20context&context=concept&mode=app")
  .then(res => res.json())
  .then(({ items }) => {
    // items: TermDTO[]
    console.log(items[0].term, items[0].meaningEs);
  });

// Ejemplo de payload de un término
{
  "term": "useEffect",
  "translation": "efecto",
  "meaningEs": "Hook que sincroniza efectos secundarios con el ciclo de render.",
  "category": "frontend",
  "tags": ["react", "hooks", "lifecycle"],
  "variants": [{ "language": "ts", "snippet": "useEffect(() => {...}, [deps]);" }]
}
`;

const endpointTable = [
  { name: "GET /api/terms", desc: "Búsqueda semántica con filtros y paginación", params: "q, context, mode, tag, page, pageSize" },
  { name: "GET /api/terms/:id", desc: "Detalle completo de un término", params: "id" },
  { name: "POST /api/translate", desc: "Traducción estructural de fragmentos de código", params: "code, language" },
  { name: "GET /api/extensions/browser", desc: "Descarga de la extensión de navegador (.crx)", params: "-" },
  { name: "GET /api/extensions/vscode", desc: "Descarga de la extensión VS Code (.vsix)", params: "-" },
];

const modes = [
  { title: "Concepto", desc: "Definición bilingüe, alias, tags y snippet auditado.", color: "text-emerald-300" },
  { title: "Entrevista", desc: "Speech corto, cuándo usarlo y ejemplo express.", color: "text-amber-300" },
  { title: "Debug", desc: "Errores comunes, quick fixes y referencia a buenas prácticas.", color: "text-rose-300" },
  { title: "Traducción", desc: "Equivalentes ES/EN y uso correcto en contexto técnico.", color: "text-blue-300" },
];

export const metadata = {
  title: "Documentación | DiccionarioDev",
  description: "Guía completa para usar DiccionarioDev en la app, extensiones y API.",
};

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(236,72,153,0.08),transparent_30%)]" />
        <section className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 lg:py-20 space-y-10">
          <div className="flex items-center justify-between gap-2 text-sm text-slate-300">
            <a
              href="/#buscar"
              className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-emerald-500/50 hover:text-white"
            >
              ← Volver a la app
            </a>
            <a
              href="/"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200 transition hover:border-emerald-500/50 hover:text-white"
            >
              Home
            </a>
          </div>

          <header className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
              <Sparkles className="h-4 w-4" />
              Documentación DiccionarioDev
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Pon el diccionario donde trabajas: app, extensiones y API unificadas.
              </h1>
              <p className="text-base text-slate-300 max-w-3xl">
                Busca términos bilingües, copia snippets auditados y usa el mismo historial en navegador, VS Code o integraciones custom.
                Esta guía resume cómo implementar en minutos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <DocButton href="/#buscar" icon={ArrowRight} label="Ir al buscador" variant="primary" />
              <DocButton href="/#extensions" icon={Plug} label="Instalar extensiones" />
              <DocButton href="/api/docs" icon={BookOpen} label="API OpenAPI" />
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-4">
            {[
              { title: "App", desc: "Búsqueda semántica, previews y modos con historial sincronizado.", icon: Code2 },
              { title: "Navegador", desc: "Selecciona texto y abre ficha con snippet listo para copiar.", icon: Globe2 },
              { title: "VS Code", desc: "Hover, comando Diccionario Dev: Buscar y panel lateral.", icon: Terminal },
              { title: "API", desc: "End points públicos para integrarlo en tus flows o dashboards.", icon: Plug },
            ].map((item) => (
              <Card key={item.title}>
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-emerald-300" />
                  <span className="text-sm font-semibold text-white">{item.title}</span>
                </div>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <BookOpen className="h-4 w-4 text-emerald-300" />
                Guía rápida de uso
              </div>
              <ol className="mt-4 space-y-3 text-sm text-slate-300 list-decimal list-inside">
                <li>Abre el buscador y elige un modo: Concepto, Entrevista, Debug o Traducción.</li>
                <li>Escribe el término o pega código; la detección ajusta el snippet y el preview.</li>
                <li>En extensiones, usa hover/selección o el comando rápido para no perder contexto.</li>
                <li>Si necesitas integrar, usa la API con los mismos parámetros de contexto.</li>
              </ol>
              <div className="mt-4 flex flex-wrap gap-2">
                {modes.map((mode) => (
                  <span key={mode.title} className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[12px] font-semibold text-slate-200">
                    <span className={`${mode.color}`}>●</span> {mode.title}
                  </span>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Calidad y seguridad
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Snippets revisados y listos para producción.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Rate limiting y logging granular en la API.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Cobertura ES/EN con detección automática de stack.</li>
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <MiniStat label="Latencia media" value="<120 ms" />
                <MiniStat label="Integraciones" value="Web · VS Code · API" />
                <MiniStat label="Modos" value="Concepto · Entrevista · Debug · Traducción" />
                <MiniStat label="Historial" value="Sincronizado" />
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Plug className="h-4 w-4 text-emerald-300" />
                Endpoints clave
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {endpointTable.map((ep) => (
                  <div key={ep.name} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                    <p className="text-xs font-mono text-emerald-300">{ep.name}</p>
                    <p className="text-sm text-slate-200">{ep.desc}</p>
                    <p className="text-[11px] text-slate-500">Parámetros: {ep.params}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Terminal className="h-4 w-4 text-emerald-300" />
                API rápida
              </div>
              <pre className="mt-4 rounded-2xl border border-slate-800 bg-[#0b1223] p-4 text-xs text-slate-200 overflow-x-auto">
{codeBlock}
              </pre>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Extensión Navegador",
                icon: Globe2,
                points: ["Selecciona texto y abre ficha instantánea", "Overlay ligero + historial sincronizado", "Descarga: /api/extensions/browser (.crx)"],
              },
              {
                title: "Extensión VS Code",
                icon: Terminal,
                points: ["Hover con definición y snippet", "Comando: Diccionario Dev: Buscar", "Descarga: /api/extensions/vscode (.vsix)"],
              },
              {
                title: "Buenas prácticas",
                icon: Rocket,
                points: ["Usa context=concept/interview/debug/translate", "Atajos CMD/CTRL+K para no perder foco", "Reutiliza historial unificado en todas las superficies"],
              },
            ].map((item) => (
              <Card key={item.title}>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <item.icon className="h-4 w-4 text-emerald-300" />
                  {item.title}
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {item.points.map((p) => (
                    <li key={p} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {p}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <GitBranch className="h-4 w-4 text-emerald-300" />
                Flow recomendado
              </div>
              <ol className="mt-4 space-y-2 text-sm text-slate-300 list-decimal list-inside">
                <li>Instala extensiones (navegador y VS Code) y fija sus atajos.</li>
                <li>Activa el modo adecuado (concept/interview/debug/translate) según tu tarea.</li>
                <li>Usa el buscador o la API con el mismo contexto para mantener respuestas coherentes.</li>
                <li>Revisa el snippet auditado y copia/pega con previews si aplica (HTML/CSS).</li>
              </ol>
            </Card>

            <Card>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CloudLightning className="h-4 w-4 text-emerald-300" />
                FAQs rápidas
              </div>
              <dl className="mt-4 space-y-3 text-sm text-slate-300">
                <div>
                  <dt className="font-semibold text-white">¿Qué pasa si pego código?</dt>
                  <dd>Detectamos el stack y abrimos el snippet/previews correctos en modo código.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">¿Los resultados cambian por modo?</dt>
                  <dd>Sí. Añadimos contexto para priorizar definición, speech de entrevista, debug o traducción.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-white">¿Puedo consumir la API sin app?</dt>
                  <dd>Sí, usa los endpoints públicos; compartes historial y calidad de respuestas.</dd>
                </div>
              </dl>
            </Card>
          </section>
        </section>
      </div>
    </main>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      {children}
    </div>
  );
}

function DocButton({
  href,
  icon: Icon,
  label,
  variant = "ghost",
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  variant?: "primary" | "ghost";
}) {
  const base = "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-neo-primary to-neo-accent-purple text-white shadow-lg shadow-neo-primary/25 hover:shadow-neo-primary/40 hover:-translate-y-0.5"
      : "border border-neo-border bg-neo-card/70 text-neo-text-primary hover:border-neo-primary/50 hover:text-white";
  return (
    <a href={href} className={`${base} ${styles}`}>
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
