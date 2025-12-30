"use client";

import React, { useCallback, useState, useEffect, useRef, KeyboardEvent, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Lightbulb,
    Search,
    Terminal,
    BookOpen,
    MessageSquare,
    Bug,
    Globe,
    Code2,
    Copy,
    FileText,
    Brain,
    Check,
    History,
    Command,
    Mic,
    MicOff,
    ArrowRight,
    Share2,
    AlertCircle,
    Dumbbell,
    Loader2,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    X,
    FileJson,
    ThumbsUp,
    Rocket,
    Eye,
    Menu,
    Sparkles,
    User,
    Video,
    Camera,
    Github,
    Twitter,
    Linkedin,
    Home,
    Star,
} from "lucide-react";
import type { TermDTO, TermExampleDTO } from "@/types/term";
import { LivePreview } from "./LivePreview";
import { getHtmlForPreview, extractRawCss } from "@/lib/tailwindPreview";
import TechStrip from "./TechStrip";
import ExtensionsShowcase from "./ExtensionsShowcase";
import ExtensionsGuide from "./ExtensionsGuide";
import Footer from "./Footer";
import { AuthActions } from "./AuthActions";
import { useSession } from "@/components/admin/SessionProvider";
import { NotificationBell } from "./NotificationBell";
import { ThemeLogo } from "./ThemeLogo";
import ThemeToggle from "./ThemeToggle";
import { trackTermUsage } from "@/lib/usage";
import { getFavoritesStorageKey, useFavorites } from "@/hooks/useFavorites";
import { getDocsLink } from "@/lib/docs-link";

type SearchContext = "concept" | "interview" | "debug" | "translate";

type ContextOption = {
    id: SearchContext;
    label: string;
    icon: React.ElementType;
    color: string;
    activeBg: string;
    placeholder: string;
    hint: string;
};

const CONTEXT_OPTIONS: ContextOption[] = [
    {
        id: "concept",
        label: "Concepto",
        icon: BookOpen,
        color: "text-emerald-400",
        activeBg: "border-emerald-500/40 bg-emerald-500/10",
        placeholder: "Concepto: escribe un término (ej. useEffect) para ver definición y para qué sirve.",
        hint: "Define rápido: traducción, para qué sirve y alias clave.",
    },
    {
        id: "interview",
        label: "Entrevista",
        icon: MessageSquare,
        color: "text-amber-400",
        activeBg: "border-amber-400/50 bg-amber-400/10",
        placeholder: "Entrevista: busca un término y ten a mano un speech corto con puntos clave.",
        hint: "Prepárate: qué es, cuándo usarlo y ejemplo corto para responder en entrevistas.",
    },
    {
        id: "debug",
        label: "Debug",
        icon: Bug,
        color: "text-red-400",
        activeBg: "border-red-400/50 bg-red-400/10",
        placeholder: "Debug: pega el mensaje o el hook que falla para ver cómo resolverlo.",
        hint: "Errores comunes y solución rápida para salir del bloqueo.",
    },
    {
        id: "translate",
        label: "Traducción",
        icon: Globe,
        color: "text-blue-400",
        activeBg: "border-blue-400/50 bg-blue-400/10",
        placeholder: "Traducción: escribe el término para ver ES/EN y usarlo bien en contexto.",
        hint: "Evita falsos amigos: significado, equivalentes y uso correcto.",
    },
];

function getDisplayLanguage(term: TermDTO | null, variant?: { language?: string | null }) {
    const tags = (term?.tags || []).map(tag => tag.toLowerCase());

    // Si el término contiene "-", probablemente es una propiedad CSS (align-items, flex-basis, etc)
    if (term?.term?.includes("-")) return "css";

    // Priorizar tags específicos de CSS
    if (tags.some(t => t.includes("css") || t.includes("tailwind") || t.includes("flexbox") || t.includes("grid"))) {
        return "css";
    }

    // Tags de HTML/A11y
    if (tags.some(t => t.includes("html") || t.includes("a11y"))) return "html";

    // Tags de React
    if (tags.some(t => t.includes("react") || t.includes("hooks") || t.includes("hook"))) {
        return "typescript";
    }

    // Usar variante si existe
    if (variant?.language) return variant.language;

    // Fallback a JavaScript
    return "javascript";
}

function pickActiveVariant(term: TermDTO | null) {
    if (!term?.variants?.length) return undefined;
    const variants = term.variants;
    const cssVariant = variants.find(v => v.language === "css");
    const htmlVariant = variants.find(v => v.language === "html");
    const tailwindVariant = variants.find(v => v.language === "ts" && (term.tags || []).some(t => t.toLowerCase().includes("tailwind")));
    return cssVariant ?? htmlVariant ?? tailwindVariant ?? variants[0];
}

function pickCssPreviewSnippet(term: TermDTO | null): { code: string; language: string } | undefined {
    if (!term) return undefined;
    if (!isCssTerm(term, "css")) return undefined;

    // 1) Usar ejemplo que ya traiga HTML para que se vea como en MDN/Tailwind
    const htmlExample = (term.examples || []).find(ex => (ex?.code || "").includes("<"));
    if (htmlExample?.code) {
        return { code: htmlExample.code, language: "html" };
    }

    // 2) Si no hay HTML, usar variante CSS si existe
    const cssVariant = term.variants?.find(v => v.language === "css");
    if (cssVariant?.snippet) {
        return { code: cssVariant.snippet, language: "css" };
    }

    // 3) Último recurso: cualquier variante
    if (term.variants?.[0]?.snippet) {
        return { code: term.variants[0].snippet, language: term.variants[0].language || "css" };
    }

    return undefined;
}

type PrismModule = typeof import("react-syntax-highlighter");

let prismLoader: Promise<{ Highlighter: PrismModule["Prism"]; style: unknown }> | null = null;

async function loadPrismHighlighter() {
    if (!prismLoader) {
        prismLoader = Promise.all([
            import("react-syntax-highlighter").then((mod) => mod.Prism),
            import("react-syntax-highlighter/dist/cjs/styles/prism").then((mod) => mod.dracula),
        ]).then(([Highlighter, style]) => ({ Highlighter, style }));
    }
    return prismLoader;
}

function CodeBlock({ code, language = "javascript", showLineNumbers = true }: { code: string; language?: string; showLineNumbers?: boolean }) {
    const [Highlighter, setHighlighter] = useState<PrismModule["Prism"] | null>(null);
    const [style, setStyle] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;
        loadPrismHighlighter()
            .then(({ Highlighter, style }) => {
                if (cancelled) return;
                setHighlighter(() => Highlighter);
                setStyle(style);
            })
            .catch(() => {
                if (cancelled) return;
                setHighlighter(null);
                setStyle(null);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="rounded-xl border border-slate-800 bg-[#1e1e1e] overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#111827]">
                <div className="flex items-center gap-2 text-slate-400 text-xs lg:text-sm font-semibold uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full bg-red-500"></span>
                        <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                        <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="ml-2">{language}</span>
                </div>
            </div>
            {Highlighter ? (
                <Highlighter
                    language={language === "ts" ? "typescript" : language}
                    style={style as never}
                    customStyle={{ margin: 0, padding: "1rem", background: "transparent" }}
                    showLineNumbers={showLineNumbers}
                    wrapLines={true}
                    wrapLongLines={true}
                >
                    {code}
                </Highlighter>
            ) : (
                <pre className="overflow-x-hidden p-4 font-mono text-xs lg:text-sm text-slate-200 whitespace-pre-wrap wrap-break-word sm:overflow-x-auto sm:whitespace-pre">{code}</pre>
            )}
        </div>
    );
}

function CssLiveBlock({ term, snippet, language }: { term: TermDTO; snippet: string; language: string }) {
    const isTailwindTerm = (term.tags || []).some(tag => tag.toLowerCase().includes("tailwind"));
    const doc = useMemo(() => buildCssDocument(snippet, isTailwindTerm), [snippet, isTailwindTerm]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            <CodeBlock code={snippet} language={language === "css" ? "css" : language} showLineNumbers />
            <CssDocPreview documentHtml={doc} />
        </div>
    );
}

function buildTailwindShell(html: string) {
    return `
      <div class="min-h-[360px] bg-slate-950 text-slate-100 tw-grid-bg">
        <div class="max-w-5xl mx-auto p-6">
          <div class="rounded-2xl border border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 shadow-[0_25px_70px_rgba(0,0,0,0.55)]">
            <div class="rounded-[18px] border border-white/10 bg-slate-900/60 p-6 ring-1 ring-white/5 space-y-6">
              ${html}
            </div>
          </div>
        </div>
      </div>
    `;
}

function buildCssDocument(snippet: string, isTailwindTerm: boolean) {
    const html = getHtmlForPreview(snippet);
    const css = extractRawCss(snippet);

    if (isTailwindTerm) {
        const tailwindBackdrop = `
      body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 0; }
      .tw-grid-bg {
        background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
        background-size: 22px 22px;
      }
    `;

        return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${tailwindBackdrop}
            ${css}
          </style>
        </head>
        <body class="bg-slate-950 text-slate-100">
          ${buildTailwindShell(html)}
        </body>
      </html>
    `;
    }

    const baseStyles = `
      body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #0f172a; }
      .demo-box { padding: 12px 16px; border-radius: 12px; background: #e2e8f0; color: #0f172a; }
      .css-demo { padding: 8px; }
      section.cards { display: flex; gap: 12px; }
      section.cards > article { flex: 1; min-height: 120px; background: #e0e7ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    `;

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${baseStyles}
            ${css}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
}

function CssDocPreview({ documentHtml }: { documentHtml: string }) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) return;
        doc.open();
        doc.write(documentHtml);
        doc.close();
    }, [documentHtml]);

    return (
        <div className="border rounded-xl shadow-sm bg-white overflow-hidden w-full min-h-[520px]">
            <iframe
                ref={iframeRef}
                className="w-full h-[520px] border-0"
                sandbox="allow-scripts allow-same-origin"
                title="CSS live preview"
            />
        </div>
    );
}

function StyleAwareCode({ term, snippet, language, showLineNumbers = true }: { term: TermDTO; snippet: string; language: string; showLineNumbers?: boolean }) {
    if (isCssTerm(term, language)) {
        return <CssLiveBlock term={term} snippet={snippet} language={language} />;
    }
    return <CodeBlock code={snippet} language={language} showLineNumbers={showLineNumbers} />;
}

// --- Hooks ---

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    const initialRef = useRef(initialValue);
    useEffect(() => {
        initialRef.current = initialValue;
    }, [initialValue]);

    const readValue = useCallback((storageKey: string) => {
        if (typeof window === "undefined") return initialRef.current;
        try {
            const item = window.localStorage.getItem(storageKey);
            return item ? (JSON.parse(item) as T) : initialRef.current;
        } catch {
            return initialRef.current;
        }
    }, []);

    const [storedValue, setStoredValue] = useState<T>(() => readValue(key));

    useEffect(() => {
        setStoredValue(readValue(key));
    }, [key, readValue]);

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);

            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
}

// --- Helpers de Texto Contextual ---

// Centralized HTML detection
function isHtmlTerm(term: TermDTO, language: string): boolean {
    if (language === "html") return true;

    const termName = term.term.toLowerCase();
    const tags = (term.tags || []).map(t => t.toLowerCase());

    // Comprehensive HTML elements list (201 total)
    const htmlElements = [
        // Semantic HTML
        "html", "head", "body", "main", "section", "article", "aside", "nav", "header", "footer", "address",
        // Metadata
        "base", "link", "meta", "title",
        // Scripting
        "script", "noscript", "template", "slot", "canvas", "svg", "math",
        // Headings
        "h1", "h2", "h3", "h4", "h5", "h6",
        // Content grouping
        "div", "span", "p", "hr", "br", "pre", "blockquote", "figure", "figcaption",
        // Text formatting
        "strong", "em", "b", "i", "u", "mark", "small", "del", "ins", "sub", "sup",
        "abbr", "dfn", "kbd", "samp", "var", "cite", "q", "code", "time", "data", "s", "wbr",
        // Multimedia
        "img", "picture", "source", "video", "audio", "track", "iframe", "embed", "object", "param",
        // Lists
        "ul", "ol", "li", "dl", "dt", "dd",
        // Tables
        "table", "caption", "thead", "tbody", "tfoot", "tr", "th", "td", "col", "colgroup",
        // Forms
        "form", "label", "textarea", "button", "select", "option", "optgroup", "fieldset", "legend",
        "datalist", "output", "progress", "meter",
        // Interactive
        "details", "summary", "a",
        // Deprecated (still HTML)
        "center", "font", "big", "strike", "tt", "acronym", "applet", "basefont",
        "bgsound", "blink", "marquee", "frameset", "frame", "noframes"
    ];

    if (htmlElements.includes(termName)) return true;

    // Input types
    if (termName.startsWith("input-")) return true;

    // Attributes and concepts
    const htmlAttributes = [
        "id", "class", "style-attribute", "title-attribute", "lang", "dir", "hidden",
        "tabindex", "draggable", "contenteditable", "spellcheck", "translate",
        "accesskey", "role", "part", "slot-attribute",
        // ARIA
        "aria-label", "aria-labelledby", "aria-hidden", "aria-role", "aria-expanded",
        "aria-controls", "aria-describedby", "aria-selected", "aria-disabled",
        "aria-modal", "aria-live", "aria-busy",
        // Common attributes
        "href", "src", "srcset", "alt", "placeholder", "value", "name",
        "maxlength", "minlength", "min", "max", "step", "pattern",
        "required", "readonly", "disabled", "autocomplete", "autofocus",
        "multiple", "checked", "selected",
        // Event handlers
        "onclick", "onchange", "oninput", "onsubmit", "onfocus", "onblur",
        "onload", "onerror", "ondblclick", "onmousedown", "onmouseup",
        "onmousemove", "onmouseenter", "onmouseleave", "onkeydown",
        "onkeyup", "onkeypress", "onscroll", "onresize", "onwheel",
        "ondrag", "ondrop", "ondragstart", "ondragend", "ondragover",
        "onplay", "onpause", "onseeking", "onended", "onloadeddata",
        // More attributes
        "loading", "decoding", "fetchpriority", "crossorigin",
        "referrerpolicy", "poster", "autoplay", "controls", "loop",
        "muted", "preload", "playsinline", "target", "rel", "download",
        "media", "type", "hreflang", "ping", "accept", "formenctype",
        "formmethod", "formaction", "formnovalidate", "rows", "cols", "wrap",
        // Concepts
        "doctype", "html-entities", "semantic-html", "dom", "shadow-dom",
        "custom-elements", "void-elements", "self-closing-tags",
        "block-elements", "inline-elements", "metadata-content",
        "flow-content", "phrasing-content", "interactive-content",
        "transparent-content", "api-html", "html5-specification",
        "content-model", "exportparts"
    ];

    if (htmlAttributes.includes(termName)) return true;

    // Check tags for HTML indicators
    if (tags.some(t => ["html", "a11y", "accessibility", "attributes", "forms", "multimedia"].includes(t))) return true;

    // ARIA attributes catch-all
    if (termName.includes("aria")) return true;

    // Input types catch-all
    if (termName.includes("input")) return true;

    return false;
}

// Centralized CSS detection (matches backend logic in seed.ts)
function isCssTerm(term: TermDTO, language: string): boolean {
    if (term.category !== "frontend") return false;
    if (language === "css") return true;

    const termName = term.term.toLowerCase();
    const tags = (term.tags || []).map(t => t.toLowerCase());

    // Excluir términos HTML/a11y
    if (tags.some(t => ["html", "a11y", "accessibility"].includes(t))) return false;
    if (termName.includes("aria")) return false;

    // Require señales claras de CSS/Tailwind: guiones, tags o lista explícita
    if (termName.includes("-")) return true;
    if (tags.some(t => ["css", "tailwind", "flexbox", "grid"].includes(t))) return true;

    // Tailwind utilities
    if (/^(bg|text|flex|grid|w-|h-|p-|m-|border|rounded|shadow|gap|space|justify|items|content|overflow|position|top|bottom|left|right|inset|z-|opacity|transform|transition|animate|cursor|select|pointer|resize|outline|ring|divide|sr-|not-sr|focus|hover|active|disabled|group|peer|dark|sm:|md:|lg:|xl:|2xl:)/.test(termName)) return true;

    // CSS functions
    if (termName.includes("clamp") || termName.includes("calc") || termName.includes("var")) return true;

    // Specific CSS terms
    if (["aspect-ratio", "backdrop-filter", "scroll-snap"].includes(termName)) return true;

    return false;
}

function getRulesList(term: TermDTO, language: string) {
    const rulesMap: Record<string, string[]> = {
        "fetch": [
            "Siempre usar try/catch para manejar errores",
            "Validar res.ok y status antes de procesar",
            "Usar AbortController para cancelar/timeout",
            "Especificar cache: \"no-store\" en GET críticos",
            "Parsear respuesta como text primero si es dudosa"
        ],
        "useEffect": [
            "Coloca funciones async en el interior del efecto",
            "Siempre retorna función cleanup si lo requiere",
            "Declara TODAS las dependencias en el array",
            "No mutes estado directamente, usa setters"
        ],
        "bg-gradient-to-r": [
            "Define en elemento padre del contenido",
            "Combina con otras clases de Tailwind",
            "Usa variantes de estado (hover, dark, etc)",
            "Verifica compatibilidad en navegadores antiguos"
        ],
        "flex-col": [
            "Aplica en contenedor, no en hijos",
            "Usa gap para espaciado entre items",
            "Combina con otros layouts (grid, flex)",
            "Respeta modelo de caja CSS"
        ],
        "aria-label": [
            "Texto conciso y descriptivo (máximo 100 caracteres)",
            "No duplices si ya hay texto visible",
            "En iconos, botones sin etiqueta, landmarks",
            "Específico: no etiquetas genéricas"
        ],
        "useState": [
            "Solo llama en nivel superior del componente",
            "Cada llamada crea variable de estado independiente",
            "No uses en loops o condiciones",
            "Setter es síncrono pero re-render es asíncrono"
        ],
        "debounce": [
            "Espera tiempo especificado antes de ejecutar",
            "Próxima llamada resetea temporizador",
            "Úsalo en inputs y eventos frecuentes",
            "Guarda referencia del timeout para cancel"
        ],
        "JWT": [
            "Almacena en httpOnly cookies en producción",
            "Valida firma en cada petición",
            "No guardes datos sensibles en payload",
            "Usa HTTPS para transmisión"
        ],
        "Docker": [
            "Crea imagen antes de ejecutar contenedor",
            "Usa .dockerignore para excluir archivos",
            "Capas se cachean: ordena comandos por frecuencia",
            "Especifica USER en Dockerfile por seguridad"
        ],
        "GraphQL": [
            "Define schema claramente antes de implementar",
            "Queries para lectura, mutations para escritura",
            "Suscripciones requieren WebSocket",
            "Valida inputs en los resolvers"
        ],
        "CI/CD": [
            "Automatiza tests antes de merge",
            "Despliega solo si todos checks pasan",
            "Mantén secrets en variables de entorno",
            "Rollback automático en fallo"
        ],
        "Prisma": [
            "Define relaciones claramente en schema",
            "Usa include para relaciones, select para campos",
            "Migraciones son versionadas y rastreables",
            "Testa queries contra base real"
        ],
        "REST": [
            "Verbos HTTP correctamente (GET, POST, PUT, DELETE)",
            "Devuelve códigos de estado apropiados",
            "Pagina resultados largos",
            "Versionamiento en URLs (/v1/, /v2/)"
        ],
        "align-items": [
            "Alinea en eje transversal (vertical en flex-row)",
            "Requiere display: flex o display: grid",
            "center alinea verticalmente en flex-row",
            "stretch es valor por defecto"
        ],
        "clamp": [
            "Toma 3 valores: mínimo, preferido, máximo",
            "Valor preferido puede usar unidades relativas",
            "Responsive design sin media queries",
            "Aplica a propiedades que acepten longitud"
        ],
        "grid-template-columns": [
            "Define número y tamaño de columnas",
            "Usa fr para fracciones del espacio",
            "auto-fit o auto-fill para responsive",
            "repeat() útil para patrones repetidos"
        ],
        "aspect-ratio": [
            "Mantiene proporción al cambiar tamaño",
            "Útil para imágenes, videos, componentes",
            "Navegadores antiguos sin soporte",
            "Combina con object-fit para imágenes"
        ],
        "backdrop-filter": [
            "Aplica efectos al fondo detrás",
            "Requiere transparencia en elemento",
            "Performance puede sufrir",
            "Soporte limitado en algunos navegadores"
        ],
        "scroll-snap": [
            "Define puntos snap en contenedores",
            "scroll-snap-type en contenedor",
            "scroll-snap-align en hijos",
            "Mejor UX en scroll móvil"
        ]
    };

    if (rulesMap[term.term]) {
        return rulesMap[term.term];
    }

    if (term.term.startsWith("use")) {
        return [
            "Solo llama Hooks en nivel superior",
            "Declara todas dependencias en array",
            "No mutes estado directamente",
            "Limpia efectos si requiere"
        ];
    }

    if (isCssTerm(term, language)) {
        return [
            "Evita !important; maneja especificidad",
            "Unidades relativas (rem, %, vh)",
            "Propiedades se heredan en cascada",
            "Verifica soporte en Can I Use"
        ];
    }

    return [
        "Mantén funciones puras",
        "Maneja errores explícitamente",
        "Evita efectos globales",
        "Documenta casos borde"
    ];
}

function GeminiStar() {
    return (
        <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Core Star - Slow Spin */}
            <svg viewBox="0 0 24 24" className="absolute w-full h-full animate-[spin_3s_linear_infinite] z-10">
                <defs>
                    <linearGradient id="gemini-core" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="50%" stopColor="#c084fc" />
                        <stop offset="100%" stopColor="#f472b6" />
                    </linearGradient>
                </defs>
                <path
                    d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
                    fill="url(#gemini-core)"
                    className="dark:drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
                />
            </svg>

            {/* Outer Aura - Reverse Spin & Blur */}
            <svg viewBox="0 0 24 24" className="absolute w-[140%] h-[140%] animate-[spin_6s_linear_infinite_reverse] opacity-50 blur-sm z-0">
                <path
                    d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
                    fill="url(#gemini-core)"
                />
            </svg>

            {/* Sparkles Particles */}
            <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
        </div>
    );
}

function GeminiLoader({ term }: { term: string }) {
    const [statusText, setStatusText] = useState("Analizando intención...");

    // Cycle through "AI thinking" states
    useEffect(() => {
        const states = [
            "Analizando intención...",
            "Consultando base de conocimiento...",
            "Sintetizando respuesta...",
            "Optimizando formato..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % states.length;
            setStatusText(states[i]);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex flex-col items-center justify-center py-10 px-6 text-center w-full">

            <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8">
                {/* The Star */}
                <GeminiStar />

                {/* The Text */}
                <div className="space-y-3 sm:space-y-4 max-w-md">
                    <p className="text-lg sm:text-2xl font-medium tracking-tight text-slate-900 dark:text-white">
                        <span className="opacity-70 dark:opacity-60 text-slate-700 dark:text-slate-300">Generando para </span>
                        <span className="font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x">
                            &quot;{term}&quot;
                        </span>
                    </p>

                    {/* Status Pill */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        <span className="text-xs lg:text-sm font-mono font-bold tracking-wider text-slate-600 dark:text-white/50 uppercase min-w-[180px] text-left">
                            {statusText}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Componente Principal ---

export default function DiccionarioDevApp() {
    const searchParams = useSearchParams();
    const { session, loading: sessionLoading, refreshSession } = useSession();
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    // Evita desajustes de hidratación: solo renderizamos tras montar en cliente.
    const [mounted, setMounted] = useState(false);

    const [results, setResults] = useState<TermDTO[]>([]);
    const [activeTerm, setActiveTerm] = useState<TermDTO | null>(null);
    const [relatedTerms, setRelatedTerms] = useState<TermDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const lastTrackedTermRef = useRef<number | null>(null);

    const [copied, setCopied] = useState(false);
    const [jsDocCopied, setJsDocCopied] = useState(false);
    const [favoritePulse, setFavoritePulse] = useState(false);

    // UX Avanzada
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showHistory, setShowHistory] = useState(false);
    const userStorageKey = session?.username || "guest";
    const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(`recent_searches:${userStorageKey}`, []);
    const favoritesKey = getFavoritesStorageKey(session?.username);
    const { toggleFavorite, isFavorite } = useFavorites(favoritesKey);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isCodeMode, setIsCodeMode] = useState(false);
    const [searchContext, setSearchContext] = useState<SearchContext | null>(null);

    // New Features State
    const [showCheatSheet, setShowCheatSheet] = useState(false);

    // Voice Search State
    const [isListening, setIsListening] = useState(false);
    const [isStartingMic, setIsStartingMic] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);
    const activeContextOption = searchContext ? CONTEXT_OPTIONS.find((ctx) => ctx.id === searchContext) : undefined;
    const ActiveContextIcon = activeContextOption?.icon;
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Evita scroll en el fondo cuando el drawer está abierto (móvil).
    useEffect(() => {
        if (typeof document === "undefined") return;
        if (showMobileMenu) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [showMobileMenu]);

    const coverStorageKey = `user_cover:${userStorageKey}`;
    const avatarStorageKey = `user_avatar_override:${userStorageKey}`;
    const [coverUrl, setCoverUrl] = useLocalStorage<string>(coverStorageKey, "");
    const [coverEditorOpen, setCoverEditorOpen] = useState(false);
    const [coverDraftUrl, setCoverDraftUrl] = useState<string>("");
    const [coverZoom, setCoverZoom] = useState(1);
    const [coverOffsetX, setCoverOffsetX] = useState(0); // -1..1 (proporción del máximo permitido)
    const [coverOffsetY, setCoverOffsetY] = useState(0); // -1..1 (proporción del máximo permitido)
    const [coverNaturalSize, setCoverNaturalSize] = useState<{ width: number; height: number } | null>(null);
    const [coverPreviewSize, setCoverPreviewSize] = useState<{ width: number; height: number } | null>(null);
    const [coverAspectRatio, setCoverAspectRatio] = useState<number | null>(null);
    const [isDraggingCover, setIsDraggingCover] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number; offsetPxX: number; offsetPxY: number } | null>(null);
    const coverPreviewRef = useRef<HTMLDivElement | null>(null);
    const coverDisplayRef = useRef<HTMLDivElement | null>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
    const [avatarDraftUrl, setAvatarDraftUrl] = useState<string>("");
    const [avatarZoom, setAvatarZoom] = useState(1);
    const [avatarOffsetX, setAvatarOffsetX] = useState(0); // -1..1 (proporción del máximo permitido)
    const [avatarOffsetY, setAvatarOffsetY] = useState(0); // -1..1 (proporción del máximo permitido)
    const [avatarNaturalSize, setAvatarNaturalSize] = useState<{ width: number; height: number } | null>(null);
    const [avatarPreviewSize, setAvatarPreviewSize] = useState<{ width: number; height: number } | null>(null);
    const avatarPreviewRef = useRef<HTMLDivElement | null>(null);
    const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
    const dragAvatarRef = useRef<{ x: number; y: number; offsetPxX: number; offsetPxY: number } | null>(null);
    const isAdmin = session?.role === "admin";
    const profileHref = isAdmin ? "/admin/profile" : "/admin/access?returnUrl=/admin/profile";
    const settingsHref = isAdmin ? "/admin/settings" : "/admin/access?returnUrl=/admin/settings";
    const navLinks = [
        { label: "Inicio", href: "#inicio" },
        { label: "Buscar", href: "#buscar" },
        { label: "Extensiones", href: "#extensions" },
    ];
    const appLinks = [
        { label: "Explorar", href: "/terms" },
        { label: "Favoritos", href: "/favorites" },
        { label: "Training", href: "/training" },
        { label: "Interview Live", href: "/interview/live" },
    ];
    if (session?.role === "admin") {
        appLinks.push({ label: "Dashboard", href: "/admin" });
    }
    const accountLinks = session
        ? [
            { label: "Perfil", href: profileHref },
            { label: "Configuración", href: settingsHref },
        ]
        : [];
    const adminLinks = session?.role === "admin"
        ? [{ label: "Términos", href: "/admin/terms" }]
        : [];
    const authLinks = !session && !sessionLoading
        ? [{ label: "Autenticación", href: "/admin/access" }]
        : [];
    const navIconMap: Record<string, React.ElementType> = {
        Inicio: Home,
        Buscar: Search,
        Extensiones: Sparkles,
        Training: Dumbbell,
        "Interview Live": Video,
        Dashboard: LayoutDashboard,
        Explorar: BookOpen,
        Favoritos: Star,
        "Términos": BookOpen,
        Perfil: User,
        "Configuración": Settings,
        Autenticación: ShieldCheck,
    };
    const routeLinks = [...appLinks, ...adminLinks, ...accountLinks, ...authLinks];

    // Reset editores y previews cuando cambia de usuario
    useEffect(() => {
        setAvatarPreview(null);
        setAvatarDraftUrl("");
        setAvatarEditorOpen(false);
        setAvatarZoom(1);
        setAvatarOffsetX(0);
        setAvatarOffsetY(0);
        setAvatarNaturalSize(null);
        setAvatarPreviewSize(null);
        setCoverDraftUrl("");
        setCoverEditorOpen(false);
        setCoverZoom(1);
        setCoverOffsetX(0);
        setCoverOffsetY(0);
        setCoverNaturalSize(null);
        setCoverPreviewSize(null);
        setCoverAspectRatio(null);
    }, [userStorageKey]);

    // Cargar avatar guardado en localStorage (para que persista aunque la sesión tarde en refrescar)
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const raw = window.localStorage.getItem(avatarStorageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (typeof parsed === "string") setAvatarPreview(parsed);
        } catch {
            // ignore
        }
    }, [avatarStorageKey]);

    // Medir previews para que el guardado sea WYSIWYG (misma lógica en preview y export)
    useEffect(() => {
        if (!coverEditorOpen) return;
        const update = () => {
            const displayRect = coverDisplayRef.current?.getBoundingClientRect();
            if (displayRect?.width && displayRect.height) {
                setCoverAspectRatio(displayRect.width / displayRect.height);
            }
            const rect = coverPreviewRef.current?.getBoundingClientRect();
            if (!rect) return;
            setCoverPreviewSize({ width: rect.width, height: rect.height });
        };
        const raf = window.requestAnimationFrame(() => {
            update();
            window.requestAnimationFrame(update);
        });
        window.addEventListener("resize", update);
        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener("resize", update);
        };
    }, [coverEditorOpen]);

    useEffect(() => {
        if (!avatarEditorOpen) return;
        const update = () => {
            const rect = avatarPreviewRef.current?.getBoundingClientRect();
            if (!rect) return;
            setAvatarPreviewSize({ width: rect.width, height: rect.height });
        };
        const raf = window.requestAnimationFrame(update);
        window.addEventListener("resize", update);
        return () => {
            window.cancelAnimationFrame(raf);
            window.removeEventListener("resize", update);
        };
    }, [avatarEditorOpen]);

    const handleContextSelect = (contextId: SearchContext) => {
        setSearchContext((prev) => (prev === contextId ? null : contextId));
        setShowHistory(false);
        searchInputRef.current?.focus();
    };

    const getPlaceholder = () => {
        if (isCodeMode) return "Modo Código detectado...";
        if (isListening) return "Escuchando...";
        if (activeContextOption) return activeContextOption.placeholder;
        return "Busca un término (ej. useState) o pega código...";
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Selecciona una imagen válida.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen es demasiado grande. Máximo 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const src = reader.result as string;
            const img = new window.Image();
            img.onload = () => {
                const displayRect = coverDisplayRef.current?.getBoundingClientRect();
                if (displayRect?.width && displayRect.height) {
                    setCoverAspectRatio(displayRect.width / displayRect.height);
                } else {
                    setCoverAspectRatio(null);
                }
                setCoverNaturalSize({ width: img.width, height: img.height });
                setCoverDraftUrl(src);
                setCoverEditorOpen(true);
                setCoverZoom(1);
                setCoverOffsetX(0);
                setCoverOffsetY(0);
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Selecciona una imagen válida.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen es demasiado grande. Máximo 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const src = reader.result as string;
            const img = new window.Image();
            img.onload = () => {
                setAvatarNaturalSize({ width: img.width, height: img.height });
                setAvatarDraftUrl(src);
                setAvatarEditorOpen(true);
                setAvatarZoom(1);
                setAvatarOffsetX(0);
                setAvatarOffsetY(0);
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const cancelCoverEdit = () => {
        setCoverEditorOpen(false);
        setCoverDraftUrl("");
        setCoverZoom(1);
        setCoverOffsetX(0);
        setCoverOffsetY(0);
        setCoverNaturalSize(null);
        setCoverPreviewSize(null);
        setCoverAspectRatio(null);
        endDragCover();
    };

    const cancelAvatarEdit = () => {
        setAvatarEditorOpen(false);
        setAvatarDraftUrl("");
        setAvatarZoom(1);
        setAvatarOffsetX(0);
        setAvatarOffsetY(0);
        setAvatarNaturalSize(null);
        setAvatarPreviewSize(null);
        endDragAvatar();
    };

    const handleResetCover = () => {
        setCoverUrl("");
        setCoverDraftUrl("");
        setCoverEditorOpen(false);
        setCoverZoom(1);
        setCoverOffsetX(0);
        setCoverOffsetY(0);
        setCoverNaturalSize(null);
        setCoverPreviewSize(null);
        setCoverAspectRatio(null);
    };

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    type BoxSize = { width: number; height: number };

    const computeTransform = (
        container: BoxSize,
        natural: BoxSize,
        zoom: number,
        offsetX: number,
        offsetY: number,
    ) => {
        const baseScale = Math.max(container.width / natural.width, container.height / natural.height);
        const scale = baseScale * zoom;
        const scaledW = natural.width * scale;
        const scaledH = natural.height * scale;
        const maxX = Math.max(0, (scaledW - container.width) / 2);
        const maxY = Math.max(0, (scaledH - container.height) / 2);
        const safeOffsetX = clamp(offsetX, -1, 1);
        const safeOffsetY = clamp(offsetY, -1, 1);
        return {
            scale,
            maxX,
            maxY,
            offsetPxX: safeOffsetX * maxX,
            offsetPxY: safeOffsetY * maxY,
        };
    };

    const startDragCover = (clientX: number, clientY: number) => {
        if (!coverPreviewRef.current || !coverNaturalSize) return;
        const rect = coverPreviewRef.current.getBoundingClientRect();
        const { offsetPxX, offsetPxY } = computeTransform(
            { width: rect.width, height: rect.height },
            coverNaturalSize,
            coverZoom,
            coverOffsetX,
            coverOffsetY,
        );
        dragStartRef.current = { x: clientX, y: clientY, offsetPxX, offsetPxY };
        setIsDraggingCover(true);
    };

    const moveDragCover = (clientX: number, clientY: number) => {
        if (!isDraggingCover || !dragStartRef.current || !coverPreviewRef.current || !coverNaturalSize) return;
        const rect = coverPreviewRef.current.getBoundingClientRect();
        const dxPx = clientX - dragStartRef.current.x;
        const dyPx = clientY - dragStartRef.current.y;
        const { maxX, maxY } = computeTransform(
            { width: rect.width, height: rect.height },
            coverNaturalSize,
            coverZoom,
            0,
            0,
        );
        const nextOffsetPxX = clamp(dragStartRef.current.offsetPxX + dxPx, -maxX, maxX);
        const nextOffsetPxY = clamp(dragStartRef.current.offsetPxY + dyPx, -maxY, maxY);
        setCoverOffsetX(maxX ? nextOffsetPxX / maxX : 0);
        setCoverOffsetY(maxY ? nextOffsetPxY / maxY : 0);
    };

    const endDragCover = () => {
        setIsDraggingCover(false);
        dragStartRef.current = null;
    };

    const startDragAvatar = (clientX: number, clientY: number) => {
        if (!avatarPreviewRef.current || !avatarNaturalSize) return;
        const rect = avatarPreviewRef.current.getBoundingClientRect();
        const { offsetPxX, offsetPxY } = computeTransform(
            { width: rect.width, height: rect.height },
            avatarNaturalSize,
            avatarZoom,
            avatarOffsetX,
            avatarOffsetY,
        );
        dragAvatarRef.current = { x: clientX, y: clientY, offsetPxX, offsetPxY };
        setIsDraggingAvatar(true);
    };

    const moveDragAvatar = (clientX: number, clientY: number) => {
        if (!isDraggingAvatar || !dragAvatarRef.current || !avatarPreviewRef.current || !avatarNaturalSize) return;
        const rect = avatarPreviewRef.current.getBoundingClientRect();
        const dxPx = clientX - dragAvatarRef.current.x;
        const dyPx = clientY - dragAvatarRef.current.y;
        const { maxX, maxY } = computeTransform(
            { width: rect.width, height: rect.height },
            avatarNaturalSize,
            avatarZoom,
            0,
            0,
        );
        const nextOffsetPxX = clamp(dragAvatarRef.current.offsetPxX + dxPx, -maxX, maxX);
        const nextOffsetPxY = clamp(dragAvatarRef.current.offsetPxY + dyPx, -maxY, maxY);
        setAvatarOffsetX(maxX ? nextOffsetPxX / maxX : 0);
        setAvatarOffsetY(maxY ? nextOffsetPxY / maxY : 0);
    };

    const endDragAvatar = () => {
        setIsDraggingAvatar(false);
        dragAvatarRef.current = null;
    };

    const coverPreviewTransform =
        coverPreviewSize && coverNaturalSize
            ? computeTransform(coverPreviewSize, coverNaturalSize, coverZoom, coverOffsetX, coverOffsetY)
            : null;

    const avatarPreviewTransform =
        avatarPreviewSize && avatarNaturalSize
            ? computeTransform(avatarPreviewSize, avatarNaturalSize, avatarZoom, avatarOffsetX, avatarOffsetY)
            : null;

    const saveAvatar = async (dataUrl: string) => {
        try {
            const payload = {
                displayName: session?.displayName || session?.username || "",
                bio: session?.bio || "",
                avatarUrl: dataUrl,
            };
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || "No se pudo guardar el avatar");
            }
            setAvatarPreview(dataUrl);
            try {
                window.localStorage.setItem(avatarStorageKey, JSON.stringify(dataUrl));
                window.dispatchEvent(new Event("avatar-updated"));
            } catch {
                // ignore
            }
            await refreshSession();
        } catch (err) {
            console.error(err);
            alert("No se pudo actualizar la foto de perfil.");
        }
    };

    const applyAvatarEdits = async () => {
        if (!avatarDraftUrl) return;
        const img = new window.Image();
        img.src = avatarDraftUrl;
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        const target = 400;
        const canvas = document.createElement("canvas");
        canvas.width = target;
        canvas.height = target;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const baseScale = Math.max(target / img.width, target / img.height);
        const scale = baseScale * avatarZoom;
        const scaledW = img.width * scale;
        const scaledH = img.height * scale;
        const maxX = Math.max(0, (scaledW - target) / 2);
        const maxY = Math.max(0, (scaledH - target) / 2);
        const offsetXPx = clamp(avatarOffsetX, -1, 1) * maxX;
        const offsetYPx = clamp(avatarOffsetY, -1, 1) * maxY;
        const dx = (target - scaledW) / 2 + offsetXPx;
        const dy = (target - scaledH) / 2 + offsetYPx;

        ctx.drawImage(img, dx, dy, scaledW, scaledH);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        await saveAvatar(dataUrl);
        setAvatarEditorOpen(false);
        setAvatarDraftUrl("");
        setAvatarNaturalSize(null);
        setAvatarPreviewSize(null);
        setAvatarZoom(1);
        setAvatarOffsetX(0);
        setAvatarOffsetY(0);
    };

    const applyCoverEdits = async () => {
        if (!coverDraftUrl) return;
        const img = new window.Image();
        img.src = coverDraftUrl;
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        const targetW = 2400;
        const displayRect = coverDisplayRef.current?.getBoundingClientRect();
        const ratio = displayRect
            ? displayRect.width / displayRect.height
            : (coverPreviewSize ? coverPreviewSize.width / coverPreviewSize.height : (2400 / 720));
        const targetH = Math.max(1, Math.round(targetW / Math.max(0.1, ratio)));
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const baseScale = Math.max(targetW / img.width, targetH / img.height);
        const scale = baseScale * coverZoom;
        const scaledW = img.width * scale;
        const scaledH = img.height * scale;

        const maxX = Math.max(0, (scaledW - targetW) / 2);
        const maxY = Math.max(0, (scaledH - targetH) / 2);
        const offsetXPx = clamp(coverOffsetX, -1, 1) * maxX;
        const offsetYPx = clamp(coverOffsetY, -1, 1) * maxY;

        const dx = (targetW - scaledW) / 2 + offsetXPx;
        const dy = (targetH - scaledH) / 2 + offsetYPx;

        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, dx, dy, scaledW, scaledH);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
        setCoverUrl(dataUrl);
        setCoverEditorOpen(false);
        setCoverDraftUrl("");
        setCoverNaturalSize(null);
        setCoverPreviewSize(null);
        setCoverZoom(1);
        setCoverOffsetX(0);
        setCoverOffsetY(0);
        setCoverAspectRatio(null);
    };

    type SpeechRecognitionLike = {
        abort?: () => void;
        start?: () => void;
        stop?: () => void;
        onstart?: (() => void) | null;
        onend?: (() => void) | null;
        onerror?: ((event: unknown) => void) | null;
        onresult?: ((event: unknown) => void) | null;
        lang?: string;
        continuous?: boolean;
        interimResults?: boolean;
        maxAlternatives?: number;
    };

    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

    // Cleanup mic on unmount
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort?.();
        };
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prellenar desde query params (extensiones, deep-links)
    useEffect(() => {
        if (!searchParams) return;
        const q = searchParams.get("q");
        if (q) {
            setSearchTerm(q);
            setShowHistory(false);
        }
    }, [searchParams]);

    // Auto-scroll effect for keyboard navigation
    useEffect(() => {
        if (selectedIndex >= 0) {
            const el = document.getElementById(`result-item-${selectedIndex}`);
            if (el) {
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    // Detectar si es código
    useEffect(() => {
        const codePatterns = [
            /const\s+\w+\s*=/,
            /function\s+\w+\(/,
            /import\s+.*\s+from/,
            /class\s+\w+/,
            /=>/,
            /<\w+/,
            /{\s*\w+\s*}/
        ];
        const isCode = codePatterns.some(pattern => pattern.test(searchTerm));
        setIsCodeMode(isCode && searchTerm.length > 10);
    }, [searchTerm]);

    // Atajo CMD/CTRL + K para enfocar el buscador y mostrar historial
    useEffect(() => {
        const handler = (e: globalThis.KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
                setShowHistory(true);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    // Fetching de datos principal
    useEffect(() => {
        const codeGuess = isCodeMode ? extractTermFromCode(debouncedSearch) : null;
        const query = isCodeMode ? (codeGuess || "") : debouncedSearch.trim();

        if (!query) {
            setResults([]);
            setHasSearched(false);
            if (!debouncedSearch.trim()) setActiveTerm(null);
            return;
        }

        const fetchTerms = async () => {
            setLoading(true);
            setHasSearched(true);
            try {
                const params = new URLSearchParams({
                    q: query,
                    pageSize: "10",
                });
                if (searchContext) {
                    params.set("context", searchContext);
                    params.set("mode", "app");
                }
                const res = await fetch(`/api/terms?${params.toString()}`);
                if (!res.ok) throw new Error("Error fetching terms");
                const data = await res.json();
                const items = data.items || [];
                setResults(items);
                setSelectedIndex(-1);
            } catch (error) {
                console.error(error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTerms();
    }, [debouncedSearch, isCodeMode, searchContext]);

    // Fetching de Términos Relacionados (Discovery)
    useEffect(() => {
        if (!activeTerm || !activeTerm.tags?.length) {
            setRelatedTerms([]);
            return;
        }

        const fetchRelated = async () => {
            try {
                // Buscar por el primer tag del término actual
                const firstTag = activeTerm.tags![0];
                const params = new URLSearchParams({
                    tag: firstTag,
                    pageSize: "4",
                });
                const res = await fetch(`/api/terms?${params.toString()}`);
                if (!res.ok) return;
                const data = await res.json();
                // Filtrar el término actual de los relacionados
                const related = (data.items || []).filter((t: TermDTO) => t.id !== activeTerm.id).slice(0, 3);
                setRelatedTerms(related);
            } catch (error) {
                console.error("Error fetching related terms", error);
            }
        };

        fetchRelated();
    }, [activeTerm]);

    useEffect(() => {
        if (!activeTerm?.id) return;
        if (lastTrackedTermRef.current === activeTerm.id) return;
        lastTrackedTermRef.current = activeTerm.id;
        void trackTermUsage({ termId: activeTerm.id, action: "view", context: "app" });
    }, [activeTerm?.id]);

    // Force Permission Request
    const requestMicrophonePermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setMicError(null);
            alert("¡Permiso concedido! Ahora intenta usar el micrófono de nuevo.");
        } catch (err) {
            console.error("Error requesting permission:", err);
            alert("El navegador sigue bloqueando el micrófono. Verifica la configuración de tu Sistema Operativo.");
        }
    };

    // Voice Search (Web Speech API)
    const toggleVoiceSearch = () => {
        setMicError(null);

        if (isListening || isStartingMic) {
            recognitionRef.current?.abort?.();
            setIsListening(false);
            setIsStartingMic(false);
            return;
        }

        const SpeechRecognition = ((window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition);

        if (!SpeechRecognition) {
            alert("Tu navegador no soporta búsqueda por voz. Intenta usar Chrome o Edge.");
            return;
        }

        try {
            setIsStartingMic(true);

            if (recognitionRef.current) {
                recognitionRef.current?.abort?.();
            }            // Cast the constructor so TypeScript knows it is constructible
            const recognition = new (SpeechRecognition as { new(): SpeechRecognitionLike })();
            recognitionRef.current = recognition;

            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsStartingMic(false);
                setIsListening(true);
                setMicError(null);
            };

            recognition.onend = () => {
                setIsListening(false);
                setIsStartingMic(false);
            };

            recognition.onerror = (event: unknown) => {
                const errorEvent = event as Record<string, unknown>;
                console.error("Error de reconocimiento de voz:", errorEvent.error);
                setIsListening(false);
                setIsStartingMic(false);

                if (errorEvent.error === 'not-allowed' || errorEvent.error === 'permission-denied') {
                    setMicError("permiso");
                } else if (errorEvent.error === 'audio-capture') {
                    setMicError("hardware");
                } else if (errorEvent.error === 'service-not-allowed' || errorEvent.error === 'network') {
                    setMicError("red");
                } else {
                    setMicError("desconocido");
                }
            };

            recognition.onresult = (event: unknown) => {
                const eventData = event as { results?: Array<Array<{ transcript?: string }>> };
                const transcript = eventData.results?.[0]?.[0]?.transcript;
                if (transcript) {
                    setSearchTerm(transcript);
                }
                searchInputRef.current?.focus();
            };

            recognition?.start?.();
        } catch (error) {
            console.error("Error al iniciar reconocimiento:", error);
            setIsListening(false);
            setIsStartingMic(false);
            setMicError("desconocido");
        }
    };

    // Manejo de Teclado
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (selectedIndex >= 0 && results[selectedIndex]) {
                selectTerm(results[selectedIndex]);
            } else if (results.length > 0) {
                selectTerm(results[0]);
            }
        } else if (e.key === "Escape") {
            setResults([]);
            setShowHistory(false);
            searchInputRef.current?.blur();
        }
    };

    const selectTerm = (term: TermDTO) => {
        setActiveTerm(term);
        setSearchTerm(term.term);
        setResults([]);
        setShowHistory(false);
        addToHistory(term.term);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const addToHistory = (term: string) => {
        setRecentSearches(prev => {
            const newHistory = [term, ...prev.filter(t => t !== term)].slice(0, 5);
            return newHistory;
        });
    };

    const handleCopy = (text: string, setCopiedState: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
        if (activeTerm?.id) {
            void trackTermUsage({ termId: activeTerm.id, action: "copy", context: "app" });
        }
    };

    const handleFavorite = () => {
        if (!activeTerm) return;
        const added = toggleFavorite(activeTerm);
        if (added) {
            void trackTermUsage({ termId: activeTerm.id, action: "favorite", context: "app" });
            setFavoritePulse(true);
            window.setTimeout(() => setFavoritePulse(false), 1800);
        } else {
            setFavoritePulse(false);
        }
    };

    const isFavoriteActive = activeTerm ? isFavorite(activeTerm.id) : false;
    const docsUrl = activeTerm ? getDocsLink(activeTerm.term) : null;

    // --- New Feature Helpers ---

    const generateJSDoc = (term: TermDTO) => {
        const slug = term.slug ? encodeURIComponent(term.slug) : encodeURIComponent(term.term);
        const jsDoc = `/**
 * ${term.term}
 * 
 * ${term.meaningEs || term.meaning}
 * 
 * @category ${term.category}
 * @see https://diccionariodev.com/term/${slug}
 */`;
        handleCopy(jsDoc, setJsDocCopied);
    };

    // Helper para resaltar coincidencias
    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ?
                <span key={i} className="text-emerald-400 font-extrabold">{part}</span> :
                <span key={i}>{part}</span>
        );
    };

    // Intenta extraer el término relevante de un snippet de código para buscarlo
    const extractTermFromCode = (code: string) => {
        const hook = code.match(/use[A-Z][A-Za-z0-9]+/);
        if (hook) return hook[0];

        const classMatch = code.match(/class(?:Name)?=["'`](.*?)["'`]/);
        if (classMatch && classMatch[1]) {
            const firstClass = classMatch[1].split(/\s+/).filter(Boolean)[0];
            if (firstClass) return firstClass;
        }

        const cssProp = code.match(/([a-z-]+)\s*:/i);
        if (cssProp) return cssProp[1];

        const tag = code.match(/<([a-z][a-z0-9-]*)\b/i);
        if (tag) return tag[1];

        const importMatch = code.match(/from\s+['"][^'"]*\/?([A-Za-z0-9_-]+)['"]/);
        if (importMatch) return importMatch[1];

        const identifier = code.match(/([A-Za-z][A-Za-z0-9_-]{2,})/);
        if (identifier) return identifier[1];

        return null;
    };

    const activeVariant = pickActiveVariant(activeTerm);
    const displayLanguage = getDisplayLanguage(activeTerm, activeVariant);
    const isHtmlActive = activeTerm ? isHtmlTerm(activeTerm, displayLanguage) : false;
    const isFrontend = activeTerm?.category === "frontend";
    const isCssActive = isFrontend && activeTerm ? isCssTerm(activeTerm, displayLanguage) : false;
    const cssPreview = pickCssPreviewSnippet(activeTerm);
    const previewSnippet = cssPreview?.code ?? activeVariant?.snippet ?? "";
    const previewLanguage = cssPreview?.language ?? displayLanguage;
    // Solo permitir preview interactivo para HTML/CSS/Tailwind
    const allowLivePreview = isFrontend && (isCssActive || !!cssPreview || isHtmlActive);
    const showSearchExplainer = !activeTerm && !searchTerm.trim() && results.length === 0 && !loading;
    const showEmptyMessage = showSearchExplainer;
    if (!mounted) {
        return null;
    }

    return (
        <div id="inicio" className="dd-home min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">

            {/* --- Cheat Sheet Slide-over --- */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-100 ${showCheatSheet ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-400" />
                            Cheat Sheet
                        </h2>
                        <button onClick={() => setShowCheatSheet(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <X className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>

                    {activeTerm ? (
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Quick Syntax */}
                            <div>
                                <h3 className="text-xs lg:text-sm font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                                    <Code2 className="h-4 w-4 lg:h-5 lg:w-5" /> Sintaxis Rápida
                                </h3>
                                <div className="bg-[#282a36] rounded-lg p-3 border border-slate-800 text-xs lg:text-sm font-mono overflow-x-hidden whitespace-pre-wrap wrap-break-word sm:overflow-x-auto sm:whitespace-pre">
                                    {activeVariant ? activeVariant.snippet.split('\n')[0] : 'Sintaxis no disponible'}
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div>
                                <h3 className="text-xs lg:text-sm font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 lg:h-5 lg:w-5" /> Reglas de Oro
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm lg:text-base text-slate-300">
                                        <Check className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400 mt-0.5 shrink-0" />
                                        <span>Usa nombres descriptivos para tus variables.</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm lg:text-base text-slate-300">
                                        <Check className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400 mt-0.5 shrink-0" />
                                        <span>Mantén las funciones pequeñas y puras.</span>
                                    </li>
                                    {activeTerm.useCases?.map((uc, i) => (
                                        uc.tips && (
                                            <li key={i} className="flex items-start gap-2 text-sm lg:text-base text-slate-300">
                                                <Check className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400 mt-0.5 shrink-0" />
                                                <span>{uc.tips}</span>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </div>

                            {/* JSDoc Generator */}
                            <div className="pt-6 border-t border-slate-800">
                                <h3 className="text-xs lg:text-sm font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                                    <FileJson className="h-4 w-4 lg:h-5 lg:w-5" /> Documentación
                                </h3>
                                <button
                                    onClick={() => generateJSDoc(activeTerm)}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
                                >
                                    {jsDocCopied ? <Check className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400" /> : <Copy className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400 group-hover:text-white" />}
                                    <span className="text-sm lg:text-base font-medium text-slate-300 group-hover:text-white">
                                        {jsDocCopied ? "¡Copiado al portapapeles!" : "Copiar como JSDoc"}
                                    </span>
                                </button>
                                <p className="text-[10px] text-slate-500 mt-2 text-center">
                                    Pega esto encima de tu función para documentarla instantáneamente.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-slate-500">
                            Selecciona un término para ver su hoja de trucos.
                        </div>
                    )}
                </div>
            </div>

            {/* --- Header Sticky --- */}
            <header id="buscar" className="sticky top-0 z-50 border-b border-slate-900 dark:border-slate-800 bg-white/95 dark:bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            {/* Logo & Title */}
                            <div
                                className="group flex items-center gap-3 cursor-pointer"
                                onClick={() => { setSearchTerm(""); setActiveTerm(null); }}
                            >
                                <ThemeLogo
                                    width={56}
                                    height={56}
                                    className="h-10 w-10 shrink-0 lg:h-12 lg:w-12 xl:h-14 xl:w-14 transition-transform duration-300 group-hover:scale-105"
                                />
                                <div>
                                    <p className="text-[10px] lg:text-[11px] uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300 font-bold">Diccionario</p>
                                    <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-100 transition-colors">
                                        Dev
                                    </h1>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-2 py-1 shadow-inner">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 transition-all hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                {appLinks.length > 0 ? (
                                    <span className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />
                                ) : null}
                                {appLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 transition-all hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="hidden md:flex items-center gap-2">
                                    <ThemeToggle />
                                    <NotificationBell size="sm" />
                                </div>
                                {session && (
                                    <>
                                        <Link
                                            href={profileHref}
                                            className="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/70 px-3 py-1.5 text-sm lg:text-base font-semibold text-slate-900 dark:text-slate-200 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-white transition"
                                            title="Ver perfil"
                                        >
                                            <span className="relative h-8 w-8">
                                                <span className="relative z-0 block h-full w-full overflow-hidden rounded-full border border-white/70 ring-2 ring-white/20 bg-slate-800">
                                                    {avatarPreview || session.avatarUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={avatarPreview || session.avatarUrl || ""}
                                                            alt={session.displayName || session.username}
                                                            className="h-full w-full object-cover rounded-full"
                                                        />
                                                    ) : (
                                                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-emerald-100">
                                                            {(session.displayName || session.username).substring(0, 2).toUpperCase()}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="absolute bottom-0 right-0 z-20 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                                            </span>
                                            <span className="max-w-[120px] truncate">{session.displayName || session.username}</span>
                                        </Link>
                                        <Link
                                            href={settingsHref}
                                            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-slate-600 dark:text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-white"
                                            title="Configuración"
                                            aria-label="Configuración"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Link>
                                    </>
                                )}
                                <div className="hidden md:flex">
                                    <AuthActions />
                                </div>
                                <button
                                    className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-white"
                                    onClick={() => setShowMobileMenu(true)}
                                    aria-label="Abrir menú móvil"
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Perfil del usuario (solo si hay sesión) */}
                        {session && (
                            <section className="relative mt-4 sm:mt-6 rounded-2xl border border-neo-border bg-neo-card/70 shadow-inner overflow-visible dark:border-slate-800 dark:bg-slate-900/70">
                                <div className="relative">
                                    <div ref={coverDisplayRef} className="relative h-28 sm:h-36 w-full rounded-t-2xl overflow-visible">
                                        <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
                                            {!coverUrl && (
                                                <div className="absolute inset-0 bg-linear-to-r from-emerald-600 via-cyan-600 to-blue-700" />
                                            )}
                                            {coverUrl && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={coverUrl} alt="Portada" className="absolute inset-0 block h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => coverInputRef.current?.click()}
                                            className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                                            aria-label="Cambiar portada"
                                        >
                                            <Camera className="h-5 w-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]" />
                                        </button>
                                        <input
                                            ref={coverInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleCoverUpload}
                                        />
                                        <Link
                                            href={profileHref}
                                            className="absolute left-1/2 bottom-0 z-30 -translate-x-1/2 translate-y-1/2 sm:left-6 sm:translate-x-0"
                                        >
                                            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-white/70 bg-neo-surface overflow-visible shadow-xl ring-2 ring-white/20 hover:scale-105 transition shrink-0 dark:bg-slate-800">
                                                {avatarPreview || session.avatarUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={avatarPreview || session.avatarUrl || ""}
                                                        alt={session.displayName || session.username}
                                                        className="h-full w-full object-cover rounded-full"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-emerald-500/20 text-emerald-100 font-bold text-lg sm:text-xl rounded-full">
                                                        {(session.displayName || session.username).substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        avatarInputRef.current?.click();
                                                    }}
                                                    className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                                                    aria-label="Cambiar foto de perfil"
                                                >
                                                    <Camera className="h-4 w-4 lg:h-5 lg:w-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]" />
                                                </button>
                                                <input
                                                    ref={avatarInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleAvatarUpload}
                                                />
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="relative z-10 overflow-hidden rounded-b-2xl bg-neo-card/70 px-4 sm:px-6 pb-4 pt-14 sm:pt-4 backdrop-blur-md border-t border-neo-border/70 dark:bg-black/55 dark:border-white/10">
                                    <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:gap-2 sm:text-left sm:pl-24">
                                        <Link
                                            href={profileHref}
                                            className="block group"
                                        >
                                            <h3 className="text-lg sm:text-xl font-bold text-emerald-700 leading-tight drop-shadow-none transition-colors group-hover:text-emerald-600 dark:text-emerald-400 dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)] dark:group-hover:text-emerald-300">
                                                {session.displayName || session.username}
                                            </h3>
                                        </Link>
                                        <p className="text-sm lg:text-base text-slate-700 line-clamp-2 dark:text-slate-200/90">
                                            {session.bio || "Completa tu bio para que otros sepan en qué estás trabajando."}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Mobile nav */}
                        <div className="flex flex-wrap items-center gap-2 md:hidden pb-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-300 transition-all hover:border-emerald-500/40 hover:text-white"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Context Selectors */}
                    <div className="mt-4 grid grid-cols-2 gap-2 pb-1 sm:flex sm:flex-wrap">
                        {CONTEXT_OPTIONS.map((ctx) => {
                            const isActive = searchContext === ctx.id;
                            return (
                                <button
                                    key={ctx.id}
                                    type="button"
                                    onClick={() => handleContextSelect(ctx.id)}
                                    aria-pressed={isActive}
                                    className={`group flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm lg:text-base font-medium transition-all ${isActive
                                        ? `${ctx.activeBg} text-white dark:shadow-[0_10px_30px_rgba(16,185,129,0.12)]`
                                        : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                                        }`}
                                >
                                    <ctx.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${ctx.color} ${isActive ? "" : "opacity-90"}`} />
                                    <span>{ctx.label}</span>
                                    {isActive && (
                                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-200">
                                            Activo
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {activeContextOption && ActiveContextIcon && (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[12px] lg:text-sm text-slate-200">
                            <ActiveContextIcon className={`h-4 w-4 lg:h-5 lg:w-5 ${activeContextOption.color}`} />
                            <span className="font-semibold text-white">Modo {activeContextOption.label}</span>
                            <span className="text-slate-400">{activeContextOption.hint}</span>
                        </div>
                    )}

                    {/* Search Bar Omnibox */}
                    <div className="mt-6 relative group z-50">
                        {/* Glow Effect Background */}
                        <div className={`absolute -inset-0.5 hidden rounded-2xl bg-linear-to-r from-emerald-500 via-cyan-500 to-blue-600 opacity-20 blur transition duration-500 group-hover:opacity-40 dark:block ${searchTerm ? 'opacity-50' : ''}`}></div>

                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 sm:pl-5 pointer-events-none z-10">
                            {isCodeMode ? (
                                <Code2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 animate-pulse" />
                            ) : (
                                <Search className={`h-5 w-5 sm:h-6 sm:w-6 transition-colors ${loading ? "text-emerald-400 animate-pulse" : "text-slate-400 group-focus-within:text-emerald-400"}`} />
                            )}
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={getPlaceholder()}
                            className={`relative w-full rounded-2xl border-2 py-4 sm:py-5 pl-12 sm:pl-14 pr-20 sm:pr-24 text-base sm:text-lg lg:text-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-none dark:shadow-2xl backdrop-blur-xl transition-all focus:outline-none focus:ring-0 ${isCodeMode
                                ? "bg-slate-900/90 border-blue-500/50 focus:border-blue-500 dark:shadow-blue-500/20"
                                : isListening
                                    ? "bg-slate-900/90 border-red-500/50 focus:border-red-500 animate-pulse"
                                    : "bg-white border-2 border-slate-900 dark:border-slate-700 hover:border-black dark:hover:border-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-600 dark:focus:border-emerald-500 dark:shadow-emerald-500/10"
                                }`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => {
                                if (!searchTerm) setShowHistory(true);
                            }}
                            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                        />

                        {/* Right Actions */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 gap-2">
                            {/* Clear Button */}
                            {searchTerm && (
                                <button
                                    onClick={() => { setSearchTerm(""); setResults([]); searchInputRef.current?.focus(); }}
                                    className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                                    title="Borrar búsqueda"
                                >
                                    <X className="h-4 w-4 lg:h-5 lg:w-5" />
                                </button>
                            )}

                            {/* Voice Button */}
                            <div className="relative">
                                <button
                                    onClick={toggleVoiceSearch}
                                    className={`p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' :
                                        isStartingMic ? 'bg-yellow-500/20 text-yellow-400' :
                                            'hover:bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    title="Búsqueda por voz"
                                >
                                    {isListening ? <MicOff className="h-4 w-4 lg:h-5 lg:w-5" /> : isStartingMic ? <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" /> : <Mic className="h-4 w-4 lg:h-5 lg:w-5" />}
                                </button>

                                {/* Detailed Error Tooltip with Fix Button */}
                                {micError && (
                                    <div className="absolute top-full right-0 mt-2 w-80 p-4 bg-slate-900 border border-red-500/50 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm lg:text-base font-bold text-red-400 mb-1">
                                                    {micError === 'permiso' ? 'Acceso Denegado' :
                                                        micError === 'hardware' ? 'Micrófono no encontrado' :
                                                            micError === 'red' ? 'Error de Conexión' : 'Error Desconocido'}
                                                </p>
                                                <p className="text-xs lg:text-sm text-slate-300 leading-relaxed mb-3">
                                                    {micError === 'permiso' ? (
                                                        "El navegador bloqueó el micrófono. Intenta forzar la solicitud de permiso manual:"
                                                    ) : micError === 'hardware' ? (
                                                        "No se detecta ningún micrófono conectado. Revisa tu configuración de sonido."
                                                    ) : (
                                                        "Verifica tu conexión a internet."
                                                    )}
                                                </p>

                                                {micError === 'permiso' && (
                                                    <button
                                                        onClick={requestMicrophonePermission}
                                                        className="w-full py-2 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs lg:text-sm font-bold text-red-400 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Settings className="h-3 w-3 lg:h-4 lg:w-4" />
                                                        Forzar Permiso
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -top-2 right-3 w-4 h-4 bg-slate-900 border-t border-l border-red-500/50 transform rotate-45"></div>
                                    </div>
                                )}
                            </div>
                            <kbd className="hidden rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-mono text-slate-400 md:inline-block pointer-events-none">
                                CMD+K
                            </kbd>
                        </div>

                        {/* Dropdown de Resultados Inteligente */}
                        {(results.length > 0 || (showHistory && recentSearches.length > 0) || (hasSearched && results.length === 0 && !loading && searchTerm) || loading) && (
                            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg dark:shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto custom-scrollbar">

                                {/* Loading State - Centrado Perfecto */}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center min-h-[350px] w-full p-8">
                                        <GeminiLoader term={searchTerm} />
                                    </div>
                                )}

                                {/* Historial */}
                                {showHistory && !results.length && !searchTerm && !loading && (
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-500 flex items-center gap-2">
                                            <History className="h-3 w-3 lg:h-4 lg:w-4" /> Recientes
                                        </div>
                                        {recentSearches.map((term) => (
                                            <button
                                                key={term}
                                                onMouseDown={() => { setSearchTerm(term); }}
                                                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
                                            >
                                                <History className="h-4 w-4 lg:h-5 lg:w-5 text-slate-400 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-slate-400" />
                                                <span className="font-medium">{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Resultados de Búsqueda */}
                                {results.length > 0 && (
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                            <Command className="h-3 w-3 lg:h-4 lg:w-4" /> Resultados
                                        </div>
                                        {results.map((term, idx) => (
                                            <button
                                                key={term.id}
                                                id={`result-item-${idx}`}
                                                onClick={() => selectTerm(term)}
                                                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${idx === selectedIndex ? 'bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${idx === selectedIndex ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                        {term.category === 'frontend' ? <Globe className="h-4 w-4 lg:h-5 lg:w-5" /> :
                                                            term.category === 'backend' ? <Terminal className="h-4 w-4 lg:h-5 lg:w-5" /> :
                                                                <BookOpen className="h-4 w-4 lg:h-5 lg:w-5" />}
                                                    </div>
                                                    <div>
                                                        <span className={`font-bold block ${idx === selectedIndex ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                                            {highlightMatch(term.term, debouncedSearch)}
                                                        </span>
                                                        <span className="text-xs lg:text-sm text-slate-500 line-clamp-1">{term.translation}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] uppercase px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                                                    {term.category}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* No Results State */}
                                {hasSearched && results.length === 0 && !loading && searchTerm && (
                                    <div className="px-4 py-3 text-center">
                                        <p className="text-xs lg:text-sm text-slate-500">No hay coincidencias para &quot;{searchTerm}&quot;</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Tags */}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs lg:text-sm">
                        {["#react", "#hooks", "#typescript", "#docker", "#aws"].map((tag) => (
                            <span
                                key={tag}
                                className="cursor-pointer rounded px-2 py-1 text-slate-700 dark:text-slate-500 font-medium hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-emerald-400 transition-colors"
                                onClick={() => setSearchTerm(tag.replace("#", ""))}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    {showEmptyMessage && (
                        <div className="mt-4 text-center text-slate-700 dark:text-slate-500">
                            <p className="mb-3 text-sm sm:text-base lg:text-lg font-medium">Prueba buscando un término técnico para ver resultados.</p>
                            {recentSearches.length > 0 && (
                                <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs sm:text-sm lg:text-base shadow-sm">
                                    <History className="h-4 w-4 lg:h-5 lg:w-5 text-slate-900 dark:text-slate-500" />
                                    <span className="text-slate-900 dark:text-slate-400 font-bold">Últimas búsquedas:</span>
                                    {recentSearches.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => setSearchTerm(term)}
                                            className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-transparent px-2 py-1 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 hover:border-slate-900 dark:hover:border-slate-600 transition-all font-medium"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Menú móvil superpuesto */}
            {/* Menú móvil superpuesto (Twitter Style) */}
            <div
                className={`fixed inset-0 z-120 md:hidden transition-opacity duration-300 ${showMobileMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                aria-hidden={!showMobileMenu}
            >
                {/* Overlay */}
                <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={() => setShowMobileMenu(false)}
                />

                {/* Drawer */}
                <div
                    className={`dd-mobile-menu absolute top-2 bottom-2 left-0 w-[82vw] max-w-80 rounded-2xl border border-neo-border bg-linear-to-b from-neo-bg via-neo-bg/95 to-neo-surface shadow-2xl overflow-hidden transform transition-transform duration-300 ease-out ${showMobileMenu ? "translate-x-0" : "-translate-x-full"}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menú"
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between gap-3 border-b border-neo-border/70 px-4 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <ThemeLogo width={34} height={34} className="shrink-0 rounded-xl" />
                                <div className="flex flex-col min-w-0 justify-center leading-tight">
                                    <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-neo-text-secondary leading-none">Diccionario</p>
                                    <h1 className="text-base font-bold tracking-tight text-neo-text-primary leading-none">
                                        Dev
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <NotificationBell size="sm" align="left" />
                                <ThemeToggle />
                                <button
                                    onClick={() => setShowMobileMenu(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neo-border bg-neo-surface text-neo-text-secondary transition hover:border-neo-primary/40 hover:text-neo-text-primary"
                                    aria-label="Cerrar menú"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                            {session ? (
                                <Link
                                    href={profileHref}
                                    className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-card/70 px-3 py-3 transition-colors hover:border-neo-primary/40 hover:bg-neo-card"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <span className="relative h-10 w-10 shrink-0">
                                        <span className="relative z-0 block h-full w-full overflow-hidden rounded-full border border-neo-border bg-neo-surface ring-2 ring-neo-primary/10">
                                            {avatarPreview || session.avatarUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={avatarPreview || session.avatarUrl || ""}
                                                    alt={session.displayName || session.username}
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="flex h-full w-full items-center justify-center text-xs font-bold text-neo-text-primary">
                                                    {(session.displayName || session.username).substring(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </span>
                                        <span className="absolute bottom-0 right-0 z-20 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-neo-card" />
                                    </span>
                                    <div className="flex flex-col leading-tight min-w-0">
                                        <span className="text-sm font-semibold text-neo-text-primary wrap-break-word line-clamp-2">
                                            {session.displayName || session.username}
                                        </span>
                                        <span className="text-[10px] text-neo-text-secondary wrap-break-word">@{session.username}</span>
                                    </div>
                                </Link>
                            ) : null}

                            <div className="rounded-2xl border border-neo-border bg-neo-card/70 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neo-text-secondary">
                                        {session ? "Cuenta" : "Acceso"}
                                    </span>
                                    {session ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-neo-primary/30 bg-neo-primary/10 px-2 py-0.5 text-[10px] font-bold text-neo-primary">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            En línea
                                        </span>
                                    ) : null}
                                </div>
                                <AuthActions variant="compact" layout="stacked" />
                            </div>

                            <div className="flex items-center justify-between px-1 text-[11px] uppercase tracking-[0.2em] text-neo-text-secondary">
                                <span>Navegación</span>
                                <span className="flex-1 mx-3 h-px bg-neo-border/70" />
                            </div>

                            <div className="space-y-2">
                                {navLinks.map((link) => {
                                    const IconComp = navIconMap[link.label] ?? Code2;
                                    return (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setShowMobileMenu(false)}
                                            className="flex items-center justify-between gap-3 rounded-2xl border border-neo-border bg-neo-card/70 px-3 py-2.5 text-sm font-semibold text-neo-text-primary transition-colors hover:border-neo-primary/40 hover:bg-neo-card"
                                        >
                                            <span className="flex items-center gap-3 min-w-0">
                                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neo-surface text-neo-text-secondary">
                                                    <IconComp className="h-5 w-5" />
                                                </span>
                                                <span className="leading-tight wrap-break-word">{link.label}</span>
                                            </span>
                                        </a>
                                    );
                                })}
                            </div>
                            {routeLinks.length > 0 ? (
                                <>
                                    <div className="flex items-center justify-between px-1 text-[11px] uppercase tracking-[0.2em] text-neo-text-secondary">
                                        <span>Páginas</span>
                                        <span className="flex-1 mx-3 h-px bg-neo-border/70" />
                                    </div>
                                    <div className="space-y-2">
                                        {routeLinks.map((link) => {
                                            const IconComp = navIconMap[link.label] ?? Code2;
                                            const isEmphasis = link.href === "/admin" || link.href === "/admin/terms";
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setShowMobileMenu(false)}
                                                    className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-colors ${isEmphasis
                                                        ? "border-neo-primary/30 bg-neo-primary/10 text-neo-primary hover:border-neo-primary/50"
                                                        : "border-neo-border bg-neo-card/70 text-neo-text-primary hover:border-neo-primary/40 hover:bg-neo-card"
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-3 min-w-0">
                                                        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isEmphasis
                                                            ? "bg-neo-primary/15 text-neo-primary"
                                                            : "bg-neo-surface text-neo-text-secondary"
                                                            }`}
                                                        >
                                                            <IconComp className="h-5 w-5" />
                                                        </span>
                                                        <span className="leading-tight wrap-break-word">{link.label}</span>
                                                    </span>
                                                    {isEmphasis ? <ArrowRight className="h-4 w-4 text-neo-primary" /> : null}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : null}

                            <div className="rounded-2xl border border-neo-border bg-neo-card/70 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neo-text-secondary">Modo</span>
                                    <span className="text-[10px] font-semibold text-neo-text-secondary">
                                        {activeContextOption ? activeContextOption.label : "Auto"}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {CONTEXT_OPTIONS.map((ctx) => {
                                        const isActive = searchContext === ctx.id;
                                        return (
                                            <button
                                                key={ctx.id}
                                                type="button"
                                                onClick={() => { handleContextSelect(ctx.id); setShowMobileMenu(false); }}
                                                aria-pressed={isActive}
                                                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${isActive
                                                    ? `${ctx.activeBg} text-neo-text-primary shadow-sm`
                                                    : "border-neo-border bg-neo-bg/60 text-neo-text-primary hover:border-neo-primary/40 hover:bg-neo-surface"
                                                    }`}
                                            >
                                                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? "bg-neo-primary/10" : "bg-neo-surface"}`}>
                                                    <ctx.icon className={`h-4 w-4 ${ctx.color}`} />
                                                </span>
                                                <span className="leading-tight text-left">{ctx.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-neo-border/70 px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neo-text-secondary">Redes</span>
                                <div className="flex items-center gap-2">
                                    <a
                                        href="https://github.com"
                                        aria-label="GitHub"
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-neo-border bg-neo-card/60 text-neo-text-secondary transition hover:-translate-y-0.5 hover:border-neo-primary/60 hover:text-neo-primary"
                                    >
                                        <Github className="h-5 w-5" />
                                    </a>
                                    <a
                                        href="https://twitter.com"
                                        aria-label="Twitter"
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-neo-border bg-neo-card/60 text-neo-text-secondary transition hover:-translate-y-0.5 hover:border-neo-primary/60 hover:text-neo-primary"
                                    >
                                        <Twitter className="h-5 w-5" />
                                    </a>
                                    <a
                                        href="https://linkedin.com"
                                        aria-label="LinkedIn"
                                        className="flex h-10 w-10 items-center justify-center rounded-full border border-neo-border bg-neo-card/60 text-neo-text-secondary transition hover:-translate-y-0.5 hover:border-neo-primary/60 hover:text-neo-primary"
                                    >
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor de portada */}
            {coverEditorOpen && (
                <div className="fixed inset-0 z-130 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={cancelCoverEdit} />
                    <div className="relative flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-neo-border bg-neo-card shadow-2xl 2xl:max-w-[1600px]">
                        <div className="flex items-center justify-between border-b border-neo-border px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-neo-primary" />
                                <p className="text-sm lg:text-base font-semibold text-neo-text-primary">Ajustar portada</p>
                            </div>
                            <button
                                onClick={cancelCoverEdit}
                                className="h-9 w-9 rounded-xl border border-neo-border bg-neo-surface text-neo-text-secondary"
                                aria-label="Cerrar editor"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="grid gap-4 p-4">
                                <div className="rounded-2xl border border-neo-border bg-neo-surface p-3">
                                    <div
                                        ref={coverPreviewRef}
                                        className={`relative w-full touch-none overflow-hidden rounded-lg border border-white/70 bg-slate-900 ring-2 ring-white/20 ${isDraggingCover ? "cursor-grabbing" : "cursor-grab"}`}
                                        style={coverAspectRatio ? { aspectRatio: String(coverAspectRatio) } : undefined}
                                        onMouseDown={(e) => startDragCover(e.clientX, e.clientY)}
                                        onMouseMove={(e) => moveDragCover(e.clientX, e.clientY)}
                                        onMouseUp={endDragCover}
                                        onMouseLeave={endDragCover}
                                        onTouchStart={(e) => {
                                            const touch = e.touches[0];
                                            if (touch) startDragCover(touch.clientX, touch.clientY);
                                        }}
                                        onTouchMove={(e) => {
                                            e.preventDefault();
                                            const touch = e.touches[0];
                                            if (touch) moveDragCover(touch.clientX, touch.clientY);
                                        }}
                                        onTouchEnd={endDragCover}
                                    >
                                        {coverDraftUrl && coverPreviewTransform ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={coverDraftUrl}
                                                alt="Portada"
                                                draggable={false}
                                                className="absolute left-1/2 top-1/2 max-w-none select-none"
                                                style={{
                                                    transform: `translate(-50%, -50%) translate(${coverPreviewTransform.offsetPxX}px, ${coverPreviewTransform.offsetPxY}px) scale(${coverPreviewTransform.scale})`,
                                                    willChange: "transform",
                                                }}
                                            />
                                        ) : coverDraftUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={coverDraftUrl} alt="Portada" className="absolute inset-0 h-full w-full object-cover" />
                                        ) : null}
                                        <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-white/20" />
                                    </div>
                                    <p className="mt-2 text-xs lg:text-sm text-neo-text-secondary">Arrastra para reubicar y ajusta el zoom (mismo flujo que Avatar).</p>
                                </div>

                                <div className="rounded-2xl border border-neo-border bg-neo-surface p-3 space-y-3">
                                    <div>
                                        <label className="text-xs lg:text-sm font-semibold text-neo-text-primary">Zoom</label>
                                        <input
                                            type="range"
                                            min={1}
                                            max={3}
                                            step={0.05}
                                            value={coverZoom}
                                            onChange={(e) => setCoverZoom(parseFloat(e.target.value))}
                                            className="w-full accent-neo-primary"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                setCoverZoom(1);
                                                setCoverOffsetX(0);
                                                setCoverOffsetY(0);
                                            }}
                                            className="rounded-lg border border-neo-border bg-neo-bg px-3 py-2 text-xs lg:text-sm lg:px-4 lg:py-2.5 font-semibold text-neo-text-secondary hover:border-neo-primary/40 hover:text-neo-text-primary transition"
                                        >
                                            Reajustar
                                        </button>
                                        <button
                                            onClick={cancelCoverEdit}
                                            className="rounded-lg border border-neo-border bg-neo-card px-3 py-2 text-xs lg:text-sm lg:px-4 lg:py-2.5 font-semibold text-neo-text-secondary hover:border-neo-text-secondary hover:text-neo-text-primary transition"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={applyCoverEdits}
                                            className="flex-1 rounded-lg bg-neo-primary px-3 py-2 text-xs lg:text-sm lg:px-4 lg:py-2.5 font-semibold text-white shadow-lg shadow-neo-primary/25 transition hover:brightness-110"
                                        >
                                            Guardar portada
                                        </button>
                                        <button
                                            onClick={handleResetCover}
                                            className="rounded-lg border border-neo-border bg-neo-bg px-3 py-2 text-xs lg:text-sm lg:px-4 lg:py-2.5 font-semibold text-neo-text-secondary hover:border-neo-primary/40 hover:text-neo-text-primary transition"
                                        >
                                            Restablecer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Editor de avatar */}
            {avatarEditorOpen && (
                <div className="fixed inset-0 z-140 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={cancelAvatarEdit} />
                    <div className="relative flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-neo-border bg-neo-card shadow-2xl 2xl:max-w-[1600px]">
                        <div className="flex items-center justify-between border-b border-neo-border px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-neo-primary" />
                                <p className="text-sm lg:text-base font-semibold text-neo-text-primary">Ajustar foto</p>
                            </div>
                            <button
                                onClick={cancelAvatarEdit}
                                className="h-9 w-9 rounded-xl border border-neo-border bg-neo-surface text-neo-text-secondary"
                                aria-label="Cerrar editor"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="grid gap-4 p-4">
                                <div className="rounded-2xl border border-neo-border bg-neo-surface p-3">
                                    <div
                                        ref={avatarPreviewRef}
                                        className={`relative mx-auto h-56 w-56 touch-none overflow-hidden rounded-full border border-white/70 bg-slate-900 ring-2 ring-white/20 sm:h-64 sm:w-64 ${isDraggingAvatar ? "cursor-grabbing" : "cursor-grab"}`}
                                        onMouseDown={(e) => startDragAvatar(e.clientX, e.clientY)}
                                        onMouseMove={(e) => moveDragAvatar(e.clientX, e.clientY)}
                                        onMouseUp={endDragAvatar}
                                        onMouseLeave={endDragAvatar}
                                        onTouchStart={(e) => {
                                            const touch = e.touches[0];
                                            if (touch) startDragAvatar(touch.clientX, touch.clientY);
                                        }}
                                        onTouchMove={(e) => {
                                            e.preventDefault();
                                            const touch = e.touches[0];
                                            if (touch) moveDragAvatar(touch.clientX, touch.clientY);
                                        }}
                                        onTouchEnd={endDragAvatar}
                                    >
                                        {avatarDraftUrl && avatarPreviewTransform ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={avatarDraftUrl}
                                                alt="Avatar"
                                                draggable={false}
                                                className="absolute left-1/2 top-1/2 max-w-none select-none"
                                                style={{
                                                    transform: `translate(-50%, -50%) translate(${avatarPreviewTransform.offsetPxX}px, ${avatarPreviewTransform.offsetPxY}px) scale(${avatarPreviewTransform.scale})`,
                                                    willChange: "transform",
                                                }}
                                            />
                                        ) : avatarDraftUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={avatarDraftUrl} alt="Avatar" className="absolute inset-0 h-full w-full object-cover" />
                                        ) : null}
                                        <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
                                    </div>
                                    <p className="mt-2 text-xs lg:text-sm text-neo-text-secondary">Arrastra para reubicar y ajusta el zoom (igual que en Admin).</p>
                                </div>

                                <div className="rounded-2xl border border-neo-border bg-neo-surface p-3 space-y-3">
                                    <div>
                                        <label className="text-xs lg:text-sm font-semibold text-neo-text-primary">Zoom</label>
                                        <input
                                            type="range"
                                            min={1}
                                            max={3}
                                            step={0.05}
                                            value={avatarZoom}
                                            onChange={(e) => setAvatarZoom(parseFloat(e.target.value))}
                                            className="w-full accent-neo-primary"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                setAvatarZoom(1);
                                                setAvatarOffsetX(0);
                                                setAvatarOffsetY(0);
                                            }}
                                            className="rounded-lg border border-neo-border bg-neo-bg px-3 py-2 text-xs lg:text-sm lg:px-4 lg:py-2.5 font-semibold text-neo-text-secondary hover:border-neo-primary/40 hover:text-neo-text-primary transition-colors"
                                        >
                                            Reajustar
                                        </button>
                                        <button
                                            onClick={cancelAvatarEdit}
                                            className="rounded-lg border border-neo-border bg-neo-card px-3 py-2 text-xs lg:text-sm lg:px-4 lg:py-2.5 font-semibold text-neo-text-secondary hover:border-neo-text-secondary hover:text-neo-text-primary transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={applyAvatarEdits}
                                            className="flex-1 rounded-lg bg-neo-primary px-3 py-2 text-xs lg:text-sm lg:px-4 lg:py-2.5 font-semibold text-white shadow-lg shadow-neo-primary/25 transition-colors hover:brightness-110"
                                        >
                                            Guardar foto
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showSearchExplainer && (
                <>
                    {/* --- Search Explainer --- */}
                    <section className="mt-4 sm:mt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 w-full">
                        <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-900 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl shadow-[0_32px_120px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)]">
                            {/* Decorative background elements */}
                            <div className="absolute -left-32 -top-32 h-[450px] w-[450px] bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/20 pointer-events-none" />
                            <div className="absolute -right-32 -bottom-32 h-[450px] w-[450px] bg-indigo-600/10 blur-[120px] dark:bg-indigo-600/20 pointer-events-none" />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-cyan-500/5 blur-[140px] dark:bg-cyan-500/10 pointer-events-none" />

                            <div className="relative p-6 sm:p-12 lg:p-16 space-y-12">
                                <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-8 lg:gap-12 items-center">
                                    <div className="space-y-8 w-full">
                                        <div className="inline-flex items-center gap-3 rounded-full border border-slate-900/10 dark:border-emerald-500/30 bg-white/80 dark:bg-emerald-500/10 px-4 py-1.5 shadow-sm backdrop-blur-xl">
                                            <div className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </div>
                                            <span className="text-xs lg:text-sm font-black uppercase tracking-[0.15em] text-slate-800 dark:text-emerald-300">
                                                Buscador inteligente v2
                                            </span>
                                        </div>

                                        <div className="space-y-6">
                                            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                                                Entiende lo que buscas, <br />
                                                <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 via-cyan-600 to-indigo-600 dark:from-emerald-400 dark:via-cyan-400 dark:to-indigo-400">
                                                    no solo lo que escribes
                                                </span>
                                            </h2>
                                            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-[1000px]">
                                                Analizamos tu intención en tiempo real: ¿Es un concepto? ¿Una traducción? ¿Un bug? Abre la ficha técnica perfecta con código listo para producción.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Tip Card Premium */}
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-gradient-x"></div>
                                        <div className="relative flex flex-col gap-6 rounded-3xl border-2 border-slate-900/10 dark:border-slate-800 bg-white dark:bg-slate-950/80 p-8 shadow-2xl backdrop-blur-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:shadow-none">
                                                    <Sparkles className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <p className="text-lg lg:text-xl font-black text-slate-900 dark:text-white">Tip profesional</p>
                                                    <p className="text-xs lg:text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-emerald-500/80">Ahorra tiempo</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                    No pierdas tiempo navegando. <strong>Pega un fragmento de código</strong> y el motor detectará el hook, la clase CSS o el método para abrir la documentación exacta.
                                                </p>
                                                <div className="inline-flex items-center gap-2 group/btn px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-bold transition-all hover:scale-105 active:scale-95 cursor-default">
                                                    <Command className="h-4 w-4" />
                                                    <span>Prueba con CMD+K + Pegar</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Feature Pills */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                    {[
                                        {
                                            icon: BookOpen,
                                            title: "Define y Traduce",
                                            desc: "Contexto técnico puro en ambos idiomas con alias inteligentes.",
                                            color: "emerald",
                                            tags: ["ES / EN", "Alias"]
                                        },
                                        {
                                            icon: Code2,
                                            title: "Neural Code Detection",
                                            desc: "Detección automática de hooks y utilidades CSS en tus snippets.",
                                            color: "indigo",
                                            tags: ["AI Parser", "Live Previews"]
                                        },
                                        {
                                            icon: Brain,
                                            title: "Contextual Ready",
                                            desc: "Buenas prácticas, reglas de oro y ejemplos directos a tu editor.",
                                            color: "cyan",
                                            tags: ["Clean Code", "Tips"]
                                        }
                                    ].map((feature, i) => {
                                        const colorClasses: Record<string, string> = {
                                            emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
                                            indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-indigo-500/20",
                                            cyan: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 ring-cyan-500/20"
                                        };
                                        const colorClass = colorClasses[feature.color] || colorClasses.emerald;

                                        return (
                                            <div key={i} className="group/feature relative rounded-3xl border border-slate-900/5 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-8 transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-2xl hover:-translate-y-1">
                                                <div className="space-y-6">
                                                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${colorClass}`}>
                                                        <feature.icon className="h-6 w-6" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                                            {feature.title}
                                                        </h3>
                                                        <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                            {feature.desc}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {feature.tags.map((tag, j) => (
                                                            <span key={j} className="px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* --- Main Content --- */}
            <main className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 lg:px-6 xl:px-8 2xl:px-12 py-8">
                {activeTerm ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-lg dark:shadow-2xl">
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:gap-6 items-start">
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm uppercase text-emerald-700 dark:text-emerald-400 font-bold tracking-wider">⭐ {activeTerm.term} — Guía Técnica Definitiva</p>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 wrap-break-word">
                                        {activeTerm.term} {activeTerm.translation ? <span className="text-slate-500 font-medium text-sm sm:text-base lg:text-lg">({activeTerm.translation})</span> : null}
                                    </h2>
                                    <div className="mt-4 flex gap-2 flex-wrap text-sm lg:text-base text-slate-500 dark:text-slate-400">
                                        <span className="rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                            {activeTerm.category}
                                        </span>
                                        {activeTerm.tags?.map((tag) => (
                                            <span key={tag} className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-transparent bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium">#{tag}</span>
                                        ))}
                                        {activeTerm.aliases?.map((alias) => (
                                            <span key={alias} className="italic text-slate-500 text-xs px-1">({alias})</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:flex-col xl:flex-row">
                                    <button
                                        onClick={() => handleCopy(window.location.href, setCopied)}
                                        className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm lg:text-base font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors whitespace-nowrap">
                                        {copied ? <Check className="h-4 w-4 lg:h-5 lg:w-5 text-emerald-400" /> : <Share2 className="h-4 w-4 lg:h-5 lg:w-5" />}
                                        {copied ? "Copiado" : "Compartir"}
                                    </button>
                                    <button
                                        onClick={handleFavorite}
                                        className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm lg:text-base font-medium text-amber-200 hover:bg-amber-500/20 transition-colors whitespace-nowrap">
                                        <Star className={`h-4 w-4 lg:h-5 lg:w-5 ${favoritePulse || isFavoriteActive ? "text-amber-300" : "text-amber-200"}`} />
                                        {favoritePulse || isFavoriteActive ? "Guardado" : "Favorito"}
                                    </button>
                                    {docsUrl ? (
                                        <a
                                            href={docsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm lg:text-base font-medium text-cyan-200 hover:bg-cyan-500/20 transition-colors whitespace-nowrap"
                                        >
                                            <Globe className="h-4 w-4 lg:h-5 lg:w-5" />
                                            Docs
                                        </a>
                                    ) : null}
                                    <button
                                        onClick={() => setShowCheatSheet(true)}
                                        className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm lg:text-base font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors whitespace-nowrap">
                                        <FileText className="h-4 w-4 lg:h-5 lg:w-5" />
                                        Cheat Sheet
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 1: DEFINICIÓN */}
                        <div className="rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <Brain className="h-5 w-5 lg:h-6 lg:w-6" />
                                <h3 className="font-bold uppercase tracking-wide text-sm lg:text-base">1. Definición</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-base leading-relaxed text-slate-900 dark:text-slate-200 font-medium">
                                    {activeTerm.meaningEs || activeTerm.meaning}
                                </p>
                                <p className="text-sm lg:text-base text-slate-700 dark:text-slate-400 italic">
                                    EN: {activeTerm.meaningEn || activeTerm.meaning}
                                </p>
                            </div>
                        </div>

                        {/* SECCIÓN 2: PARA QUÉ SIRVE */}
                        <div className="rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 space-y-4 shadow-sm">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                                <Rocket className="h-5 w-5 lg:h-6 lg:w-6" />
                                <h3 className="font-bold uppercase tracking-wide text-sm lg:text-base">2. Para qué sirve</h3>
                            </div>
                            <p className="text-base leading-relaxed text-slate-900 dark:text-slate-200 font-medium">
                                {activeTerm.whatEs || activeTerm.what}
                            </p>
                        </div>

                        {/* SECCIÓN 3: CÓMO FUNCIONA */}
                        <div className="space-y-4">
                            <div className="rounded-2xl border-2 border-amber-500/50 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-950/30 p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                    <Lightbulb className="h-5 w-5 lg:h-6 lg:w-6" />
                                    <h3 className="font-bold uppercase tracking-wide text-sm lg:text-base">4. Cómo funciona</h3>
                                </div>
                                <p className="text-base leading-relaxed text-slate-900 dark:text-slate-200 font-medium">
                                    {activeTerm.howEs || activeTerm.how || "Sigue el flujo recomendado y aplica el patrón principal respetando su ciclo de vida."}
                                </p>
                            </div>

                            {activeVariant?.snippet && (
                                <>
                                    {/* HTML Preview: iframe (sólo para HTML/Tailwind/CSS) */}
                                    {allowLivePreview && (previewLanguage === 'html' || isHtmlActive) && !isCssActive && !cssPreview && (
                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                                            {/* Código */}
                                            <div className="rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-[#1e1e1e] dark:bg-slate-950 p-4 sm:p-6 overflow-hidden">
                                                <div className="mb-4 flex items-center gap-2 text-emerald-400">
                                                    <Code2 className="h-5 w-5 lg:h-6 lg:w-6" />
                                                    <h4 className="font-bold uppercase tracking-wide text-sm lg:text-base">Ejemplo de Código</h4>
                                                </div>
                                                <StyleAwareCode
                                                    term={activeTerm}
                                                    snippet={previewSnippet}
                                                    language={previewLanguage}
                                                />
                                            </div>

                                            {/* Preview específico del lenguaje */}
                                            <div className="rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-[#1e1e1e] dark:bg-slate-950 p-4 sm:p-6 overflow-hidden flex flex-col shadow-lg">
                                                <div className="mb-3 flex items-center gap-2 text-blue-400">
                                                    <Eye className="h-5 w-5 lg:h-6 lg:w-6" />
                                                    <h4 className="font-bold uppercase tracking-wide text-sm lg:text-base">Preview en Vivo</h4>
                                                </div>
                                                <div className="flex-1 bg-white rounded-lg overflow-hidden">
                                                    <LivePreview
                                                        code={previewSnippet}
                                                        language="html"
                                                        title={`Demo de ${activeTerm.term}`}
                                                        height="450px"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CSS / Tailwind: un solo bloque con código + preview integrado */}
                                    {(isCssActive || cssPreview) && (
                                        <div className="rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 overflow-hidden shadow-sm">
                                            <div className="mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                                <Code2 className="h-5 w-5 lg:h-6 lg:w-6" />
                                                <h4 className="font-bold uppercase tracking-wide text-sm lg:text-base">Ejemplo de Código + Preview</h4>
                                            </div>
                                            <CssLiveBlock term={activeTerm} snippet={previewSnippet} language={previewLanguage} />
                                        </div>
                                    )}

                                    {/* Otros lenguajes sin preview dedicado */}
                                    {(!allowLivePreview || (!(previewLanguage === 'html' || isHtmlActive) && !isCssActive && !cssPreview)) && (
                                        <div className="rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-[#1e1e1e] dark:bg-slate-950 p-6 overflow-hidden shadow-lg">
                                            <div className="mb-4 flex items-center gap-2 text-emerald-400">
                                                <Code2 className="h-5 w-5 lg:h-6 lg:w-6" />
                                                <h4 className="font-bold uppercase tracking-wide text-sm lg:text-base">Ejemplo de Código</h4>
                                            </div>
                                            <StyleAwareCode
                                                term={activeTerm}
                                                snippet={previewSnippet}
                                                language={previewLanguage}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* SECCIÓN 5: REGLAS IMPORTANTES */}
                        {activeTerm.examples && Array.isArray(activeTerm.examples) && activeTerm.examples.length > 0 && (
                            <div className="rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 space-y-4 shadow-sm">
                                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                    <ThumbsUp className="h-5 w-5 lg:h-6 lg:w-6" />
                                    <h3 className="font-bold uppercase tracking-wide text-sm lg:text-base">5. Reglas importantes</h3>
                                </div>
                                <ul className="space-y-3 text-sm lg:text-base text-slate-900 dark:text-slate-200 font-medium">
                                    {getRulesList(activeTerm, displayLanguage).map((rule, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0"></span>
                                            <span>{rule}</span>
                                        </li>
                                    ))
                                    }
                                </ul>
                            </div>
                        )}

                        {/* Mostrar ejemplos adicionales de BD */}
                        {activeTerm.examples && activeTerm.examples.length > 1 && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                    Ejemplos Adicionales
                                </h3>

                                {(activeTerm.examples as unknown[]).slice(1).map((ex, idx) => {
                                    const example: TermExampleDTO = typeof ex === 'string' ? { code: ex } : (ex as TermExampleDTO);
                                    return (
                                        <div key={idx} className="space-y-3">
                                            <h4 className="font-bold uppercase tracking-wide text-sm lg:text-base text-emerald-400">
                                                Ejemplo {idx + 2}: {example.title || ''}
                                            </h4>

                                            <div className="rounded-2xl border-2 border-slate-900 dark:border-slate-800 bg-[#1e1e1e] dark:bg-slate-950 p-6 overflow-hidden shadow-lg">
                                                <StyleAwareCode
                                                    term={activeTerm}
                                                    snippet={example.code || String(ex)}
                                                    language={displayLanguage}
                                                    showLineNumbers={true}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {relatedTerms.length > 0 && (
                            <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ArrowRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    Conceptos Relacionados
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 2xl:gap-6">
                                    {relatedTerms.map(term => (
                                        <button
                                            key={term.term}
                                            onClick={() => selectTerm(term)}
                                            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-left hover:border-slate-900 dark:hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors shadow-sm">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-slate-900 dark:text-white font-semibold truncate">{term.term}</span>
                                                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase shrink-0">
                                                    {term.category}
                                                </span>
                                            </div>
                                            <p className="text-sm lg:text-base text-slate-700 dark:text-slate-400 mt-2 line-clamp-2 font-medium">
                                                {term.meaningEs || term.meaning}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-slate-500" />
                )}
            </main>

            <div id="search-empty" className="relative mt-6 border-y-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-slate-900/70 dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] rounded-none sm:rounded-xl overflow-hidden 2xl:mt-10">
                <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 2xl:px-12">
                    <TechStrip
                        speedSeconds={110}
                        className="py-6"
                    />
                </div>
            </div>

            <div className="mt-10 2xl:mt-16 px-4 sm:px-6 2xl:px-12 mx-auto max-w-7xl 2xl:max-w-[1600px]">
                <ExtensionsShowcase variant="slate" />
            </div>

            <div className="mt-6 2xl:mt-10 px-4 sm:px-6 2xl:px-12 mx-auto max-w-7xl 2xl:max-w-[1600px]">
                <ExtensionsGuide />
            </div>

            <Footer variant="slate" />
        </div>
    );
}
