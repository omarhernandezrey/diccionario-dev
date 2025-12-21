"use client";

import { Chrome, History, Keyboard, MousePointerClick, PanelRightOpen, Sparkles } from "lucide-react";
import { VscVscode } from "react-icons/vsc";

export default function ExtensionsGuide() {
  const cardBase = "w-full min-w-0 overflow-hidden rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-6 shadow-none dark:shadow-[0_25px_60px_rgba(0,0,0,0.35)] wrap-break-word";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 lg:px-6 xl:px-8">
      <div className="rounded-3xl border border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-10 shadow-none dark:shadow-[0_30px_80px_rgba(0,0,0,0.55)] overflow-hidden">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2 w-full min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 text-[11px] lg:text-xs font-bold uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-200">
              Guía detallada
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Cómo instalar y usar las extensiones sin perder contexto</h3>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-400 font-medium">
              Sigue estos pasos rápidos para tener el buscador en el navegador y en VS Code con la misma API bilingüe, detección de código y
              snippets listos para copiar.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-4 py-2 text-xs lg:text-sm font-bold text-slate-900 dark:text-slate-300">
            <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-300" />
            Configuración en minutos
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2 2xl:gap-6 items-start">
          <article className={`${cardBase} flex flex-col gap-3`}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-transparent">
                <Chrome className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <div>
                <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white">Extensión de navegador</p>
                <p className="text-xs lg:text-sm text-slate-700 dark:text-slate-400 font-medium">Chrome / Edge / Brave</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
                  <p className="text-[11px] lg:text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Instalación</p>
                  <ol className="space-y-2 text-sm lg:text-base leading-relaxed text-slate-900 dark:text-slate-200 list-decimal list-inside wrap-break-word font-medium">
                    <li>
                      Descarga el instalador <a href="/api/extensions/browser" className="text-emerald-700 dark:text-emerald-300 underline decoration-emerald-500/50 hover:text-emerald-900 dark:hover:text-emerald-200 font-bold">`.crx`</a>.
                    </li>
                    <li>
                      Abre <span className="rounded bg-slate-200 dark:bg-slate-800/60 px-1.5 py-0.5 font-mono text-[12px] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-transparent">chrome://extensions</span> (Edge: <span className="rounded bg-slate-200 dark:bg-slate-800/60 px-1.5 py-0.5 font-mono text-[12px] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-transparent">edge://extensions</span>) y activa “Modo desarrollador”.
                    </li>
                    <li>Arrastra el archivo `.crx` a la página, confirma y fija el ícono en la barra.</li>
                    <li>Opcional: asigna un atajo en la configuración de la extensión para abrir la ficha sin seleccionar texto.</li>
                  </ol>
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
                  <p className="text-[11px] lg:text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Uso inmediato</p>
                  <ul className="space-y-2 text-sm lg:text-base leading-relaxed text-slate-900 dark:text-slate-200 wrap-break-word font-medium">
                    <li className="flex gap-2">
                      <MousePointerClick className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                      Selecciona texto en cualquier pestaña y abre la ficha con definición + snippet listo para copiar.
                    </li>
                    <li className="flex gap-2">
                      <MousePointerClick className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                      Autodetección de código y preview embebida para validar rápidamente lo que vas a pegar.
                    </li>
                    <li className="flex gap-2">
                      <MousePointerClick className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                      Historial sincronizado con la app: reabre fichas recientes desde el overlay o el ícono de la extensión.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </article>

          <article className={`${cardBase} flex flex-col gap-3`}>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-transparent">
                <VscVscode className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
	              <div>
	                <p className="text-sm lg:text-base font-bold text-slate-900 dark:text-white">Extensión VS Code</p>
	                <p className="text-xs lg:text-sm text-slate-700 dark:text-slate-400 font-medium">Panel lateral y hover info</p>
	              </div>
	            </div>

            <div className="mt-4 space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
	              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
	                <p className="text-[11px] lg:text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Instalación</p>
	                <ol className="mt-2 space-y-2 text-sm lg:text-base leading-relaxed text-slate-900 dark:text-slate-200 list-decimal list-inside wrap-break-word font-medium">
	                  <li>
	                    Descarga el paquete <a href="/api/extensions/vscode" className="text-indigo-700 dark:text-indigo-200 underline decoration-indigo-500/50 hover:text-indigo-900 dark:hover:text-indigo-100 font-bold">`.vsix`</a>.
	                  </li>
                  <li>
                    En VS Code: <span className="rounded bg-slate-200 dark:bg-slate-800/60 px-1.5 py-0.5 font-mono text-[12px] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-transparent">Extensiones &gt; … &gt; Install from VSIX…</span> y elige el archivo descargado.
                  </li>
                  <li>
                    O instala por terminal: <code className="rounded bg-slate-200 dark:bg-slate-800/60 px-1.5 py-0.5 font-mono text-[12px] text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-transparent">code --install-extension diccionario-dev.vsix</code>.
                  </li>
                  <li>Recarga la ventana de VS Code si te lo solicita para activar el hover y el panel lateral.</li>
                </ol>
              </div>

	              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
	                <p className="text-[11px] lg:text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Uso inmediato</p>
	                <ul className="mt-2 space-y-2 text-sm lg:text-base leading-relaxed text-slate-900 dark:text-slate-200 wrap-break-word font-medium">
	                  <li className="flex gap-2">
	                    <PanelRightOpen className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600 dark:text-indigo-200 shrink-0" />
	                    Hover sobre cualquier término para ver definición y code preview; el snippet queda listo para copiar.
	                  </li>
	                  <li className="flex flex-wrap items-start gap-2 leading-relaxed wrap-break-word w-full">
	                    <PanelRightOpen className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600 dark:text-indigo-200 shrink-0 mt-0.5" />
	                    <span className="text-sm lg:text-base text-slate-900 dark:text-slate-200 wrap-break-word flex-1 min-w-[200px]">
	                      Ejecuta el comando{" "}
	                      <span className="inline-block max-w-full rounded bg-slate-200 dark:bg-slate-800/60 px-1 py-0.5 font-mono text-[11px] whitespace-normal wrap-break-word align-middle text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-transparent">
	                        Diccionario Dev: Buscar
                      </span>{" "}
                      (Ctrl/Cmd+Shift+P) y abre la ficha sin salir del editor.
                    </span>
	                  </li>
	                  <li className="flex gap-2">
	                    <PanelRightOpen className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600 dark:text-indigo-200 shrink-0" />
	                    Abre el panel “Diccionario Dev” para historial unificado y copiar snippets sin cambiar de archivo.
	                  </li>
	                  <li className="flex gap-2">
	                    <PanelRightOpen className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600 dark:text-indigo-200 shrink-0" />
	                    Compatibilidad con HTML, CSS, JS/TS y Tailwind; usa la misma API ES/EN y detección de código que la app principal.
	                  </li>
	                </ul>
	              </div>
            </div>
          </article>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3 2xl:gap-4">
	          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 flex flex-col gap-2">
	            <div className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 dark:text-white">
	              <Keyboard className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-300" />
	              Atajos recomendados
	            </div>
	            <p className="mt-2 text-sm lg:text-base text-slate-700 dark:text-slate-300 font-medium">
	              Asigna un shortcut global en el navegador y en VS Code (Command Palette &gt; Keyboard Shortcuts) para abrir la búsqueda con una sola tecla.
	            </p>
	          </div>
	          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 flex flex-col gap-2">
	            <div className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 dark:text-white">
	              <PanelRightOpen className="h-4 w-4 lg:h-5 lg:w-5 text-indigo-600 dark:text-indigo-200" />
	              Mantén el panel a la vista
	            </div>
	            <p className="mt-2 text-sm lg:text-base text-slate-700 dark:text-slate-300 font-medium">
	              Deja fijado el overlay del navegador o el panel lateral en VS Code para consultar historial y pegar snippets sin romper tu flujo.
	            </p>
	          </div>
	          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 flex flex-col gap-2">
	            <div className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 dark:text-white">
	              <History className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-600 dark:text-emerald-300" />
	              Historial unificado
	            </div>
	            <p className="mt-2 text-sm lg:text-base text-slate-700 dark:text-slate-300 font-medium">
	              Las extensiones comparten el mismo historial que la app: repite búsquedas recientes y copia snippets sin volver a escribir el término.
	            </p>
	          </div>
        </div>
      </div>
    </section>
  );
}
