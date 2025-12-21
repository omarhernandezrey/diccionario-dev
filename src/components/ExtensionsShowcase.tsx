import { Chrome, Monitor, Check, Download, MousePointerClick } from "lucide-react";
import { VscVscode } from "react-icons/vsc";

type ExtensionsShowcaseProps = {
  variant?: "slate" | "neo";
};

export default function ExtensionsShowcase({ variant = "slate" }: ExtensionsShowcaseProps) {
  const isNeo = variant === "neo";
  const baseCard =
    isNeo
      ? "rounded-[2rem] border border-neo-border/50 bg-neo-card/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl"
      : "rounded-xl border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-none dark:shadow-[0_25px_60px_rgba(0,0,0,0.35)]";

  const sectionSpacing = isNeo ? "py-12 lg:py-16" : "py-0";

  return (
    <section id="extensions" className={`mx-auto w-full max-w-7xl px-4 lg:px-6 xl:px-8 ${sectionSpacing}`}>
      <div className={`${isNeo ? "mb-8 text-center" : "mb-6"} w-full min-w-0`}>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${isNeo
          ? "border border-neo-border/70 bg-neo-card text-neo-primary"
          : "border border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-emerald-200"
          }`}>
          {isNeo ? "Extensiones" : "Extensiones oficiales"}
        </span>
        <h3 className={`mt-3 text-xl sm:text-2xl md:text-3xl font-bold leading-tight ${isNeo ? "text-neo-text-primary" : "text-slate-900 dark:text-white"}`}>
          Lleva el buscador a tu navegador y a VS Code
        </h3>
        <p className={`${isNeo ? "text-neo-text-secondary" : "text-slate-700 dark:text-slate-400"} text-sm md:text-base mt-2 ${isNeo ? "mx-auto max-w-2xl" : ""}`}>
          Consulta términos en cualquier pestaña o dentro de tu editor sin perder el contexto. Copia snippets, abre previews y usa el historial con un clic.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 2xl:gap-6">
        <div className={`${baseCard} relative`}>
          {!isNeo && <div className="absolute -right-6 -top-10 hidden h-32 w-32 bg-emerald-500/10 blur-3xl dark:block" />}
          <div className="relative flex items-center gap-3 mb-3">
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${isNeo ? "bg-neo-primary/15 text-neo-primary" : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-transparent"}`}>
              <Chrome className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className={`${isNeo ? "text-neo-text-primary" : "text-slate-900 dark:text-white"} text-sm lg:text-base font-bold`}>Extensión de navegador</p>
              <p className={`${isNeo ? "text-neo-text-secondary" : "text-slate-700 dark:text-slate-400"} text-xs lg:text-sm font-medium`}>Chrome / Edge / Brave</p>
            </div>
          </div>
          <ul className={`${isNeo ? "text-neo-text-secondary" : "text-slate-900 dark:text-slate-300"} space-y-2 text-sm lg:text-base font-medium`}>
            <li className="flex items-center gap-2">
              <Check className={`${isNeo ? "text-neo-primary" : "text-emerald-600 dark:text-emerald-400"} h-4 w-4 lg:h-5 lg:w-5`} />
              Selecciona texto y abre la ficha al instante.
            </li>
            <li className="flex items-center gap-2">
              <Check className={`${isNeo ? "text-neo-primary" : "text-emerald-600 dark:text-emerald-400"} h-4 w-4 lg:h-5 lg:w-5`} />
              Autodetección de código y vista previa embebida.
            </li>
            <li className="flex items-center gap-2">
              <Check className={`${isNeo ? "text-neo-primary" : "text-emerald-600 dark:text-emerald-400"} h-4 w-4 lg:h-5 lg:w-5`} />
              Historial sincronizado con la app.
            </li>
          </ul>
          <a
            href="/api/extensions/browser"
            className={`mt-4 inline-flex items-center gap-2 text-xs lg:text-sm font-bold transition-colors ${isNeo ? "text-neo-primary hover:text-neo-primary-dark" : "text-emerald-700 dark:text-emerald-200 hover:text-emerald-900 dark:hover:text-emerald-100"}`}
          >
            <Download className="h-4 w-4 lg:h-5 lg:w-5" />
            Descargar .crx
          </a>
        </div>

        <div className={`${baseCard} relative`}>
          {!isNeo && <div className="absolute -left-8 bottom-0 hidden h-32 w-32 bg-indigo-500/10 blur-3xl dark:block" />}
          <div className="relative flex items-center gap-3 mb-3">
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${isNeo ? "bg-neo-primary/15 text-neo-primary" : "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-transparent"}`}>
              <VscVscode className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className={`${isNeo ? "text-neo-text-primary" : "text-slate-900 dark:text-white"} text-sm lg:text-base font-bold`}>Extensión VS Code</p>
              <p className={`${isNeo ? "text-neo-text-secondary" : "text-slate-700 dark:text-slate-400"} text-xs lg:text-sm font-medium`}>Panel lateral y hover info</p>
            </div>
          </div>
          <ul className={`${isNeo ? "text-neo-text-secondary" : "text-slate-900 dark:text-slate-300"} space-y-2 text-sm lg:text-base font-medium`}>
            <li className="flex items-center gap-2">
              <Check className={`${isNeo ? "text-neo-primary" : "text-indigo-600 dark:text-indigo-300"} h-4 w-4 lg:h-5 lg:w-5`} />
              Hover con definición y snippet listo para copiar.
            </li>
            <li className="flex items-center gap-2">
              <Check className={`${isNeo ? "text-neo-primary" : "text-indigo-600 dark:text-indigo-300"} h-4 w-4 lg:h-5 lg:w-5`} />
              Comando rápido para abrir la ficha dentro del editor.
            </li>
            <li className="flex items-center gap-2">
              <Check className={`${isNeo ? "text-neo-primary" : "text-indigo-600 dark:text-indigo-300"} h-4 w-4 lg:h-5 lg:w-5`} />
              Soporte para HTML, CSS, JS/TS y Tailwind.
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href="vscode:extension/omar-hernandez-rey.diccionario-dev-helper"
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs lg:text-sm font-semibold transition-colors ${isNeo
                ? "bg-neo-primary text-white hover:bg-neo-primary-dark"
                : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-100 border border-indigo-200 dark:border-indigo-500/40 hover:bg-indigo-200 dark:hover:bg-indigo-500/30"
                }`}
            >
              Abrir en VS Code
            </a>
            <a
              href="/api/extensions/vscode"
              className={`inline-flex items-center gap-2 text-xs lg:text-sm font-bold transition-colors ${isNeo ? "text-neo-primary hover:text-neo-primary-dark" : "text-indigo-700 dark:text-indigo-200 hover:text-indigo-900 dark:hover:text-indigo-100"}`}
            >
              <Download className="h-4 w-4 lg:h-5 lg:w-5" />
              Descargar .vsix
            </a>
          </div>
        </div>

        <div className={`${baseCard} relative`}>
          {!isNeo && <div className="absolute right-0 -bottom-6 hidden h-32 w-32 bg-blue-500/10 blur-3xl dark:block" />}
          <div className="relative flex items-center gap-3 mb-4">
            <div className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${isNeo ? "bg-neo-surface text-neo-text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-transparent"}`}>
              <MousePointerClick className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className={`${isNeo ? "text-neo-text-primary" : "text-slate-900 dark:text-white"} text-sm lg:text-base font-bold`}>Vista rápida</p>
              <p className={`${isNeo ? "text-neo-text-secondary" : "text-slate-700 dark:text-slate-400"} text-xs lg:text-sm font-medium`}>Cómo se ven en acción</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs lg:text-sm">
            <div className={`${isNeo ? "border-neo-border/60 bg-neo-bg/60 text-neo-text-primary" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-900 dark:text-slate-200"} rounded-lg border p-3 space-y-2`}>
              <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wide ${isNeo ? "text-neo-primary" : "text-emerald-700 dark:text-emerald-300"}`}>
                <Chrome className="h-3 w-3 lg:h-4 lg:w-4" /> Navegador
              </span>
              <p className={`${isNeo ? "text-neo-text-primary" : "text-slate-900 dark:text-slate-200"} font-bold`}>Sidebar con historial + copiar snippet</p>
              <span className={`${isNeo ? "text-neo-text-secondary" : "text-slate-600 dark:text-slate-500"} text-[10px] font-medium`}>Light overlay + shortcuts</span>
            </div>
            <div className={`${isNeo ? "border-neo-border/60 bg-neo-bg/60 text-neo-text-primary" : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-900 dark:text-slate-200"} rounded-lg border p-3 space-y-2`}>
              <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wide ${isNeo ? "text-neo-primary" : "text-indigo-700 dark:text-indigo-300"}`}>
                <Monitor className="h-3 w-3 lg:h-4 lg:w-4" /> VS Code
              </span>
              <p className={`${isNeo ? "text-neo-text-primary" : "text-slate-900 dark:text-slate-200"} font-bold`}>Hover con definición + code preview</p>
              <span className={`${isNeo ? "text-neo-text-secondary" : "text-slate-600 dark:text-slate-500"} text-[10px] font-medium`}>Comando: Diccionario Dev: Buscar</span>
            </div>
          </div>
          <div className={`${isNeo ? "border-neo-border/60 bg-neo-bg text-neo-text-secondary" : "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400"} mt-3 rounded-lg border p-3 text-[11px] lg:text-sm font-medium`}>
            Las extensiones usan la misma API de búsqueda, soporte ES/EN y detección de código que la app principal.
          </div>
        </div>
      </div>
    </section>
  );
}
