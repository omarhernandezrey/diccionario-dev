"use client";

import React, { useState, useEffect, useRef, KeyboardEvent, useMemo } from "react";
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
    Loader2,
    Settings,
    X,
    FileJson,
    ThumbsUp,
    Rocket,
    Eye
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { TermDTO, TermExampleDTO } from "@/types/term";
import TailwindStylePreview from "./TailwindStylePreview";
import { LivePreview } from "./LivePreview";
import { getHtmlForPreview, extractRawCss } from "@/lib/tailwindPreview";

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

function CodeBlock({ code, language = "javascript", showLineNumbers = true }: { code: string; language?: string; showLineNumbers?: boolean }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-[#1e1e1e] overflow-hidden shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#111827]">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wide">
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full bg-red-500"></span>
                        <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                        <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="ml-2">{language}</span>
                </div>
            </div>
            <SyntaxHighlighter
                language={language === "ts" ? "typescript" : language}
                style={dracula}
                customStyle={{ margin: 0, padding: "1rem", background: "transparent" }}
                showLineNumbers={showLineNumbers}
                wrapLines={true}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

function CssLiveBlock({ snippet, language }: { snippet: string; language: string }) {
    const html = useMemo(() => getHtmlForPreview(snippet), [snippet]);
    const rawCss = useMemo(() => extractRawCss(snippet), [snippet]);

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <CodeBlock code={snippet} language={language} showLineNumbers />
            <TailwindStylePreview html={html} css={rawCss} />
        </div>
    );
}

function StyleAwareCode({ term, snippet, language, showLineNumbers = true }: { term: TermDTO; snippet: string; language: string; showLineNumbers?: boolean }) {
    if (isCssTerm(term, language)) {
        return <CssLiveBlock snippet={snippet} language={language} />;
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
    // Initialize state function to read from LS only once (lazy initialization)
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

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

    // HTML elements
    const htmlElements = ["html", "head", "body", "base", "link", "meta", "style-element", "title", "script", "noscript", "template", "slot", "div", "span", "p", "a", "button"];
    if (htmlElements.includes(termName)) return true;

    // Check tags for HTML indicators
    if (tags.some(t => ["html", "a11y", "accessibility"].includes(t))) return true;

    // ARIA attributes
    if (termName.includes("aria")) return true;

    return false;
}

// Centralized CSS detection (matches backend logic in seed.ts)
function isCssTerm(term: TermDTO, language: string): boolean {
    if (language === "css") return true;

    const termName = term.term.toLowerCase();
    const tags = (term.tags || []).map(t => t.toLowerCase());

    // Excluir términos HTML/a11y
    if (tags.some(t => ["html", "a11y", "accessibility"].includes(t))) return false;
    if (termName.includes("aria")) return false;

    // CSS properties (lowercase with hyphens, no "use" prefix)
    if (/^[a-z-]+$/.test(termName) && !termName.startsWith("use")) return true;

    // Tailwind utilities
    if (/^(bg|text|flex|grid|w-|h-|p-|m-|border|rounded|shadow|gap|space|justify|items|content|overflow|position|top|bottom|left|right|inset|z-|opacity|transform|transition|animate|cursor|select|pointer|resize|outline|ring|divide|sr-|not-sr|focus|hover|active|disabled|group|peer|dark|sm:|md:|lg:|xl:|2xl:)/.test(termName)) return true;

    // CSS functions
    if (termName.includes("clamp") || termName.includes("calc") || termName.includes("var")) return true;

    // Specific CSS terms
    if (["aspect-ratio", "backdrop-filter", "scroll-snap"].includes(termName)) return true;

    // Check tags for CSS indicators
    if (tags.some(t => ["css", "tailwind", "flexbox", "grid"].includes(t))) return true;

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
                    className="drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
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
        <div className="relative flex flex-col items-center justify-center py-12 px-8 text-center">

            <div className="relative z-10 flex flex-col items-center gap-10">
                {/* The Star */}
                <GeminiStar />

                {/* The Text */}
                <div className="space-y-4 max-w-md">
                    <p className="text-2xl font-medium tracking-tight text-white">
                        <span className="opacity-60">Generando para </span>
                        <span className="font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                            &quot;{term}&quot;
                        </span>
                    </p>

                    {/* Status Pill */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-mono font-medium tracking-wider text-white/50 uppercase min-w-[180px] text-left">
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
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    // Evita desajustes de hidratación: solo renderizamos tras montar en cliente.
    const [mounted, setMounted] = useState(false);

    const [results, setResults] = useState<TermDTO[]>([]);
    const [activeTerm, setActiveTerm] = useState<TermDTO | null>(null);
    const [relatedTerms, setRelatedTerms] = useState<TermDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [copied, setCopied] = useState(false);
    const [jsDocCopied, setJsDocCopied] = useState(false);

    // UX Avanzada
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showHistory, setShowHistory] = useState(false);
    const [recentSearches, setRecentSearches] = useLocalStorage<string[]>("recent_searches", []);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [isCodeMode, setIsCodeMode] = useState(false);

    // New Features State
    const [showCheatSheet, setShowCheatSheet] = useState(false);

    // Voice Search State
    const [isListening, setIsListening] = useState(false);
    const [isStartingMic, setIsStartingMic] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);

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

    // Fetching de datos principal
    useEffect(() => {
        if (!debouncedSearch.trim() || isCodeMode) {
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
                    q: debouncedSearch,
                    pageSize: "10",
                });
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
    }, [debouncedSearch, isCodeMode]);

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
    };

    // --- New Feature Helpers ---

    const generateJSDoc = (term: TermDTO) => {
        const jsDoc = `/**
 * ${term.term}
 * 
 * ${term.meaningEs || term.meaning}
 * 
 * @category ${term.category}
 * @see https://diccionariodev.com/term/${term.id}
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

    const activeVariant = activeTerm?.variants?.[0];
    const displayLanguage = getDisplayLanguage(activeTerm, activeVariant);
    const isHtmlActive = activeTerm ? isHtmlTerm(activeTerm, displayLanguage) : false;
    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 pb-20 relative overflow-x-hidden">

            {/* --- Cheat Sheet Slide-over --- */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-100 ${showCheatSheet ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
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
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                                    <Code2 className="h-4 w-4" /> Sintaxis Rápida
                                </h3>
                                <div className="bg-[#282a36] rounded-lg p-3 border border-slate-800 text-xs font-mono overflow-x-auto">
                                    {activeTerm.variants?.[0] ? activeTerm.variants[0].snippet.split('\n')[0] : 'Sintaxis no disponible'}
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4" /> Reglas de Oro
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm text-slate-300">
                                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                        <span>Usa nombres descriptivos para tus variables.</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-slate-300">
                                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                        <span>Mantén las funciones pequeñas y puras.</span>
                                    </li>
                                    {activeTerm.useCases?.map((uc, i) => (
                                        uc.tips && (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                                                <span>{uc.tips}</span>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </div>

                            {/* JSDoc Generator */}
                            <div className="pt-6 border-t border-slate-800">
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
                                    <FileJson className="h-4 w-4" /> Documentación
                                </h3>
                                <button
                                    onClick={() => generateJSDoc(activeTerm)}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all group"
                                >
                                    {jsDocCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400 group-hover:text-white" />}
                                    <span className="text-sm font-medium text-slate-300 group-hover:text-white">
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
            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setSearchTerm(""); setActiveTerm(null); }}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-white">
                                    Diccionario Dev
                                </h1>
                                <p className="text-xs font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">
                                    Inteligencia para Ingenieros
                                </p>
                            </div>
                        </div>

                        {/* Context Selectors */}
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            {[
                                { id: "concept", label: "Concepto", icon: BookOpen, color: "text-emerald-400" },
                                { id: "interview", label: "Entrevista", icon: MessageSquare, color: "text-amber-400" },
                                { id: "debug", label: "Debug", icon: Bug, color: "text-red-400" },
                                { id: "translate", label: "Traducción", icon: Globe, color: "text-blue-400" },
                            ].map((ctx) => (
                                <button
                                    key={ctx.id}
                                    className="group flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-1.5 text-sm font-medium transition-all hover:border-slate-700 hover:bg-slate-800 active:scale-95"
                                >
                                    <ctx.icon className={`h-4 w-4 ${ctx.color}`} />
                                    <span className="text-slate-300 group-hover:text-white">
                                        {ctx.label}
                                    </span>
                                </button>
                            ))}
                            {/* Admin Access Button */}
                            <a
                                href="/admin"
                                className="group flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium transition-all hover:border-purple-500/50 hover:bg-purple-500/20 active:scale-95"
                            >
                                <Settings className="h-4 w-4 text-purple-400" />
                                <span className="text-purple-300 group-hover:text-purple-200">
                                    Admin
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* Search Bar Omnibox */}
                    <div className="mt-6 relative group z-50">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            {isCodeMode ? (
                                <Code2 className="h-5 w-5 text-blue-400 animate-pulse" />
                            ) : (
                                <Search className={`h-5 w-5 transition-colors ${loading ? "text-emerald-400 animate-pulse" : "text-slate-500 group-focus-within:text-emerald-400"}`} />
                            )}
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={isCodeMode ? "Modo Código detectado..." : isListening ? "Escuchando..." : "Busca un término (ej. useState) o pega código..."}
                            className={`w-full rounded-2xl border bg-slate-900/50 py-4 pl-12 pr-24 text-lg text-white placeholder-slate-500 shadow-inner backdrop-blur-sm transition-all focus:outline-none focus:ring-1 ${isCodeMode
                                ? "border-blue-500/50 focus:border-blue-500 focus:ring-blue-500/50"
                                : isListening
                                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/50 animate-pulse"
                                    : "border-slate-800 focus:border-emerald-500/50 focus:bg-slate-900 focus:ring-emerald-500/50"
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
                                    <X className="h-4 w-4" />
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
                                    {isListening ? <MicOff className="h-4 w-4" /> : isStartingMic ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                                </button>

                                {/* Detailed Error Tooltip with Fix Button */}
                                {micError && (
                                    <div className="absolute top-full right-0 mt-2 w-80 p-4 bg-slate-900 border border-red-500/50 rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-bold text-red-400 mb-1">
                                                    {micError === 'permiso' ? 'Acceso Denegado' :
                                                        micError === 'hardware' ? 'Micrófono no encontrado' :
                                                            micError === 'red' ? 'Error de Conexión' : 'Error Desconocido'}
                                                </p>
                                                <p className="text-xs text-slate-300 leading-relaxed mb-3">
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
                                                        className="w-full py-2 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-bold text-red-400 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Settings className="h-3 w-3" />
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
                            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto custom-scrollbar">

                                {/* Loading State */}
                                {loading && (
                                    <div className="p-4">
                                        <GeminiLoader term={searchTerm} />
                                    </div>
                                )}

                                {/* Historial */}
                                {showHistory && !results.length && !searchTerm && !loading && (
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                            <History className="h-3 w-3" /> Recientes
                                        </div>
                                        {recentSearches.map((term) => (
                                            <button
                                                key={term}
                                                onMouseDown={() => { setSearchTerm(term); }}
                                                className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                                            >
                                                <History className="h-4 w-4 text-slate-600" />
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Resultados de Búsqueda */}
                                {results.length > 0 && (
                                    <div className="py-2">
                                        <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                            <Command className="h-3 w-3" /> Resultados
                                        </div>
                                        {results.map((term, idx) => (
                                            <button
                                                key={term.id}
                                                id={`result-item-${idx}`}
                                                onClick={() => selectTerm(term)}
                                                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${idx === selectedIndex ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-slate-800 border-l-4 border-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${idx === selectedIndex ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                                        {term.category === 'frontend' ? <Globe className="h-4 w-4" /> :
                                                            term.category === 'backend' ? <Terminal className="h-4 w-4" /> :
                                                                <BookOpen className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <span className={`font-bold block ${idx === selectedIndex ? 'text-white' : 'text-slate-200'}`}>
                                                            {highlightMatch(term.term, debouncedSearch)}
                                                        </span>
                                                        <span className="text-xs text-slate-500 line-clamp-1">{term.translation}</span>
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
                                        <p className="text-xs text-slate-500">No hay coincidencias para &quot;{searchTerm}&quot;</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Tags */}
                    <div className="mt-3 flex gap-2 overflow-x-auto text-xs">
                        {["#react", "#hooks", "#typescript", "#docker", "#aws"].map((tag) => (
                            <span
                                key={tag}
                                className="cursor-pointer rounded px-2 py-1 text-slate-500 hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                                onClick={() => setSearchTerm(tag.replace("#", ""))}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="mx-auto w-full max-w-7xl px-4 lg:px-6 xl:px-8 py-8">
                {activeTerm ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <p className="text-xs uppercase text-emerald-400 font-bold">⭐ {activeTerm.term} — Guía Técnica Definitiva</p>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-1">
                                        {activeTerm.term} {activeTerm.translation ? <span className="text-slate-500 text-lg">({activeTerm.translation})</span> : null}
                                    </h2>
                                    <div className="mt-2 flex gap-2 flex-wrap text-sm text-slate-400">
                                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                                            {activeTerm.category}
                                        </span>
                                        {activeTerm.tags?.map((tag) => (
                                            <span key={tag} className="px-2 py-1 rounded-full bg-slate-800 text-slate-200">#{tag}</span>
                                        ))}
                                        {activeTerm.aliases?.map((alias) => (
                                            <span key={alias} className="italic text-slate-500">({alias})</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleCopy(window.location.href, setCopied)}
                                        className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                                        {copied ? "Copiado" : "Compartir"}
                                    </button>
                                    <button
                                        onClick={() => setShowCheatSheet(true)}
                                        className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Cheat Sheet
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 1: DEFINICIÓN */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Brain className="h-5 w-5" />
                                <h3 className="font-bold uppercase tracking-wide text-sm">1. Definición</h3>
                            </div>
                            <div className="space-y-2">
                                <p className="text-base leading-relaxed text-slate-200">
                                    {activeTerm.meaningEs || activeTerm.meaning}
                                </p>
                                <p className="text-sm text-slate-400 italic">
                                    EN: {activeTerm.meaningEn || activeTerm.meaning}
                                </p>
                            </div>
                        </div>

                        {/* SECCIÓN 2: PARA QUÉ SIRVE */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Rocket className="h-5 w-5" />
                                <h3 className="font-bold uppercase tracking-wide text-sm">2. Para qué sirve</h3>
                            </div>
                            <p className="text-base leading-relaxed text-slate-200">
                                {activeTerm.whatEs || activeTerm.what}
                            </p>
                        </div>

                        {/* SECCIÓN 3: CÓMO FUNCIONA */}
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/5 to-transparent p-6 space-y-4">
                                <div className="flex items-center gap-2 text-amber-400">
                                    <Lightbulb className="h-5 w-5" />
                                    <h3 className="font-bold uppercase tracking-wide text-sm">4. Cómo funciona</h3>
                                </div>
                                <p className="text-base leading-relaxed text-slate-200">
                                    {activeTerm.howEs || activeTerm.how || "Sigue el flujo recomendado y aplica el patrón principal respetando su ciclo de vida."}
                                </p>
                            </div>
                            
                            {activeVariant?.snippet && (
                                <>
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 overflow-hidden">
                                        <div className="mb-4 flex items-center gap-2 text-emerald-400">
                                            <Code2 className="h-5 w-5" />
                                            <h4 className="font-bold uppercase tracking-wide text-sm">Ejemplo de Código</h4>
                                        </div>
                                        <StyleAwareCode
                                            term={activeTerm}
                                            snippet={activeVariant.snippet}
                                            language={displayLanguage}
                                        />
                                    </div>

                                    {/* LIVE PREVIEW - Para HTML, CSS y JavaScript */}
                                    {(displayLanguage === 'html' || isHtmlActive || displayLanguage === 'css' || displayLanguage === 'javascript' || displayLanguage === 'jsx') && (
                                        <div>
                                            <div className="mb-3 flex items-center gap-2 text-blue-400">
                                                <Eye className="h-5 w-5" />
                                                <h4 className="font-bold uppercase tracking-wide text-sm">Preview en Vivo</h4>
                                            </div>
                                            <LivePreview
                                                code={activeVariant.snippet}
                                                language={displayLanguage as 'html' | 'javascript' | 'jsx' | 'css'}
                                                title={`Demo de ${activeTerm.term}`}
                                                height="450px"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* SECCIÓN 5: REGLAS IMPORTANTES */}
                        {activeTerm.examples && Array.isArray(activeTerm.examples) && activeTerm.examples.length > 0 && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <ThumbsUp className="h-5 w-5" />
                                    <h3 className="font-bold uppercase tracking-wide text-sm">5. Reglas importantes</h3>
                                </div>
                                <ul className="space-y-3 text-sm text-slate-200">
                                    {getRulesList(activeTerm, displayLanguage).map((rule, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0"></span>
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
                                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-teal-400" />
                                    Ejemplos Adicionales
                                </h3>
                                
                                {(activeTerm.examples as unknown[]).slice(1).map((ex, idx) => {
                                    const example: TermExampleDTO = typeof ex === 'string' ? { code: ex } : (ex as TermExampleDTO);
                                    return (
                                        <div key={idx} className="space-y-3">
                                            <h4 className="font-bold uppercase tracking-wide text-sm text-emerald-400">
                                                Ejemplo {idx + 2}: {example.title || ''}
                                            </h4>
                                            
                                            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 overflow-hidden">
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
                            <div className="pt-8 border-t border-slate-800">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <ArrowRight className="h-5 w-5 text-emerald-400" />
                                    Conceptos Relacionados
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {relatedTerms.map(term => (
                                        <button
                                            key={term.term}
                                            onClick={() => selectTerm(term)}
                                            className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left hover:border-emerald-500/40 hover:bg-slate-900 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-white font-semibold">{term.term}</span>
                                                <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                                    {term.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                                                {term.meaningEs || term.meaning}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-slate-500">
                        <p className="mb-4">Prueba buscando un término técnico para ver resultados.</p>
                        {recentSearches.length > 0 && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm">
                                <History className="h-4 w-4 text-slate-500" />
                                <span className="text-slate-400">Últimas búsquedas:</span>
                                {recentSearches.map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => setSearchTerm(term)}
                                        className="rounded-full bg-slate-800 px-2 py-1 text-slate-200 hover:bg-slate-700 transition-colors"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>



        </div>
    );
}
