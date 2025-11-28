"use client";

import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
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
    Frown,
    FileJson,
    ThumbsUp,
    Split,
    Rocket
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { TermDTO } from "@/types/term";

function toPascal(value?: string | null) {
    if (!value) return "Concept";
    return value
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join("");
}

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

function buildDefaultSnippet(term: TermDTO | null, language: string, label: string) {
    const name = term?.term || label || "demo";
    if (language === "css") {
        return `.demo { ${name}: center; }`;
    }
    if (language === "html") {
        return `<div ${name}="value">Contenido de ${name}</div>`;
    }
    if (language === "typescript" || language === "javascript") {
        return `// Ejemplo de ${name}\nconsole.log("${name} listo");`;
    }
    return `// Ejemplo de ${name}`;
}

function buildResetSnippet(term: TermDTO | null, language: string) {
    const prop = term?.term || "prop";

    // Buscar FAQ de "reset" específicamente (categoría "reset")
    const resetFaq = term?.faqs?.find(faq =>
        faq.category?.toLowerCase() === "reset" ||
        faq.questionEs?.toLowerCase().includes("reiniciar") ||
        (faq.questionEs?.toLowerCase().includes("reset") && !faq.questionEs?.toLowerCase().includes("entrevista"))
    );

    if (resetFaq?.snippet) {
        return resetFaq.snippet;
    }

    // Buscar un variant para este lenguaje si no hay FAQ
    const variantForLanguage = term?.variants?.find(v =>
        v.language?.toLowerCase() === language.toLowerCase()
    );

    if (variantForLanguage?.snippet) {
        // Si es CSS, asegurar que muestra reset a initial
        if (language === "css" && !variantForLanguage.snippet.includes("initial")) {
            return `.demo { ${prop}: initial; }`;
        }
        return variantForLanguage.snippet;
    }

    // Generar según lenguaje si no hay snippet específico
    if (language === "css") return `.demo { ${prop}: initial; }`;
    if (language === "html") return `<div ${prop}="">Contenido</div>`;
    return `function reset${toPascal(prop)}() {\n  // Reinicia ${prop} a su valor inicial\n}\n`;
}

function buildCallbackSnippet(term: TermDTO | null, language: string, isReact: boolean) {
    const name = term?.term || "callback";

    // Buscar FAQ de "buenas prácticas" específicamente (categoría "best-practices")
    const bestPracticeFaq = term?.faqs?.find(faq =>
        faq.category?.toLowerCase() === "best-practices" ||
        faq.questionEs?.toLowerCase().includes("buena") ||
        (faq.questionEs?.toLowerCase().includes("práctica") && !faq.questionEs?.toLowerCase().includes("entrevista"))
    );

    if (bestPracticeFaq?.snippet) {
        return bestPracticeFaq.snippet;
    }

    // Buscar un variant para este lenguaje si no hay FAQ
    const variantForLanguage = term?.variants?.find(v =>
        v.language?.toLowerCase() === language.toLowerCase()
    );

    if (variantForLanguage?.snippet) {
        return variantForLanguage.snippet;
    }

    // Verificar lenguaje PRIMERO, independientemente de isReact
    if (language === "css") {
        return `.component {\n  /* Aplica ${name} de forma consistente */\n  ${name}: var(--${name.replace(/[^a-z0-9]+/gi, "-")}, initial);\n}`;
    }
    if (language === "html") {
        return `<div data-${name.replace(/[^a-z0-9]+/gi, "-")}>${name} listo</div>`;
    }

    // Si es TypeScript/JavaScript, AHORA considerar si es React
    if ((language === "typescript" || language === "javascript") && isReact) {
        return `// ❌ incorrecto\nstoreCallback(doSomething());\n\n// ✔ correcto\nstoreCallback(() => doSomething());`;
    }

    // Fallback para JS/TS no-React
    return `function apply${toPascal(name)}(value) {\n  // Valida y aplica ${name}\n  return value;\n}`;
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

// Centralized CSS detection (matches backend logic in seed.ts)
function isCssTerm(term: TermDTO, language: string): boolean {
    if (language === "css") return true;

    const termName = term.term.toLowerCase();

    // CSS properties (lowercase with hyphens, no "use" prefix)
    if (/^[a-z-]+$/.test(termName) && !termName.startsWith("use")) return true;

    // Tailwind utilities
    if (/^(bg|text|flex|grid|w-|h-|p-|m-|border|rounded|shadow|gap|space|justify|items|content|overflow|position|top|bottom|left|right|inset|z-|opacity|transform|transition|animate|cursor|select|pointer|resize|outline|ring|divide|sr-|not-sr|focus|hover|active|disabled|group|peer|dark|sm:|md:|lg:|xl:|2xl:)/.test(termName)) return true;

    // CSS functions
    if (termName.includes("clamp") || termName.includes("calc") || termName.includes("var")) return true;

    // Specific CSS terms
    if (["aspect-ratio", "backdrop-filter", "scroll-snap"].includes(termName)) return true;

    // Check tags for CSS indicators
    const tags = (term.tags || []).map(t => t.toLowerCase());
    if (tags.some(t => ["css", "tailwind", "flexbox", "grid"].includes(t))) return true;

    return false;
}

// Detect if it's a Tailwind utility class (not a CSS property)
function isTailwindUtility(term: TermDTO, language: string): boolean {
    if (language === "html") return true;

    const termName = term.term.toLowerCase();
    const tags = (term.tags || []).map(t => t.toLowerCase());

    // Check for Tailwind tag
    if (tags.includes("tailwind")) return true;

    // Tailwind utilities pattern
    if (/^(bg|text|flex|grid|w-|h-|p-|m-|border|rounded|shadow|gap|space|justify|items|content|overflow|position|top|bottom|left|right|inset|z-|opacity|transform|transition|animate|cursor|select|pointer|resize|outline|ring|divide|sr-|not-sr|focus|hover|active|disabled|group|peer|dark|sm:|md:|lg:|xl:|2xl:)/.test(termName)) return true;

    return false;
}

function getInitializationText(term: TermDTO, language: string) {
    if (isTailwindUtility(term, language)) {
        return `Aplica la clase '${term.term}' en el atributo class de tu elemento HTML. Combina con otras clases de Tailwind para lograr el diseño deseado.`;
    }
    if (isCssTerm(term, language)) {
        return `Define '${term.term}' dentro de un bloque de reglas CSS. Asegúrate de que el contenedor tenga el contexto de layout adecuado (como flex o grid).`;
    }
    if (term.term.startsWith("use") && (language === "typescript" || language === "javascript")) {
        return `Importa ${term.term} desde 'react' y llámalo en el nivel superior de tu componente, nunca dentro de loops o condiciones.`;
    }
    if (term.category === "backend") {
        return `Configura la conexión o instancia de ${term.term} al inicio de tu aplicación o servicio.`;
    }
    return term.titleEs || term.titleEn || "Configura este concepto una sola vez en el punto de entrada apropiado.";
}

function getResetDescription(term: TermDTO, language: string) {
    if (isTailwindUtility(term, language)) {
        return `Remueve la clase '${term.term}' del atributo class del elemento. Si necesitas eliminar el efecto, usa clases opuestas (ej. 'bg-none' para fondos).`;
    }
    if (isCssTerm(term, language)) {
        return "Para revertir al comportamiento por defecto del navegador, asigna el valor 'initial'. Usa 'unset' si quieres eliminar la declaración específica.";
    }
    if (term.term.startsWith("use")) {
        return "Para reiniciar el estado, usa la función setter con el valor inicial (ej. setState(initialState)).";
    }
    return "Reinicia o normaliza el concepto cuando cambie el contexto o quieras volver a su estado inicial.";
}

function getRulesList(term: TermDTO, language: string) {
    if (isCssTerm(term, language)) {
        return [
            "Evita el uso excesivo de !important; prefiere manejar la especificidad.",
            "Usa unidades relativas (rem, %, vh) para mantener la accesibilidad y el diseño responsivo.",
            "Recuerda que las propiedades se heredan en cascada salvo que se especifique lo contrario.",
            "Verifica el soporte en navegadores (Can I Use) para propiedades modernas."
        ];
    }
    if (term.term.startsWith("use")) { // React Hooks
        return [
            "Solo llama Hooks en el nivel superior del componente, nunca dentro de loops o condiciones.",
            "Declara todas las dependencias en el array de dependencias para evitar bugs sutiles.",
            "No mutes el estado directamente; usa siempre los setters proporcionados.",
            "Limpia los efectos secundarios (return function) si el hook lo requiere."
        ];
    }
    // Default / JS / Backend
    return [
        "Mantén las funciones puras y predecibles siempre que sea posible.",
        "Maneja los errores de forma explícita (try/catch o propagación).",
        "Evita efectos secundarios globales que acoplen el código.",
        "Documenta los casos borde y los tipos de entrada/salida."
    ];
}

function getAdvancedPatternDescription(term: TermDTO, language: string) {
    if (isTailwindUtility(term, language)) {
        return `Usa variantes de Tailwind como 'hover:${term.term}', 'dark:${term.term}' o breakpoints responsivos ('md:${term.term}', 'lg:${term.term}') para diseños adaptativos.`;
    }
    if (isCssTerm(term, language)) {
        return "Combina esta propiedad con Media Queries, Container Queries o Pseudo-clases (:hover, :has) para crear layouts adaptables sin JavaScript.";
    }
    if (term.term.startsWith("use")) {
        return "Crea Custom Hooks que encapsulen esta lógica para reutilizarla en múltiples componentes y mantener la UI limpia.";
    }
    return term.titleEn && term.titleEn !== term.term ? term.titleEn : "Aplica patrones de diseño (como Singleton o Factory) si la complejidad del sistema crece.";
}

function getSummaryData(term: TermDTO, language: string) {
    const isCss = isCssTerm(term, language);
    const isReact = term.term.startsWith("use");

    return {
        what: term.meaningEs || term.meaning,
        returns: term.whatEs || term.what || (isCss ? "Estilos visuales" : "Valor de retorno o efecto"),
        init: getInitializationText(term, language),
        update: isCss ? "Automático al cambiar clases o DOM" : (isReact ? "Reactivo ante cambios de estado/props" : "Ejecución imperativa"),
        rules: isCss ? "Cascada y Especificidad" : (isReact ? "Reglas de los Hooks" : "Flujo de control estándar"),
        objects: isCss ? "Modelo de Caja" : "Inmutabilidad recomendada",
        render: isCss ? "Reflow / Repaint" : (isReact ? "Render cycle" : "Event Loop"),
        errors: isCss ? "Sintaxis inválida, sobreescritura" : "Excepciones no capturadas, Race conditions"
    };
}

function getInterviewQuestions(term: TermDTO, language: string) {
    const isCss = isCssTerm(term, language);
    return [
        { q: `¿Qué es ${term.term}?`, a: term.meaningEs || term.meaning },
        { q: "¿Cuándo usarlo?", a: term.whatEs || term.what || "Cuando aporta valor en su contexto." },
        { q: "¿Errores comunes?", a: isCss ? "Depender de hacks, uso excesivo de !important o selectores muy específicos." : "Evita mutaciones o usos fuera del ciclo correcto." },
        { q: "¿Cómo asegurarlo en producción?", a: isCss ? "Usa metodologías (BEM/Utility), linters y verifica compatibilidad de navegadores." : "Valida entradas, maneja errores y añade pruebas." }
    ];
}

function getBestPracticesDescription(term: TermDTO, language: string, isReactConcept: boolean) {
    if (isReactConcept) {
        return "Si necesitas guardar callbacks, usa la forma función-lambda para evitar ejecuciones inmediatas.";
    }
    if (isTailwindUtility(term, language)) {
        return `Combina '${term.term}' con otras utilidades de Tailwind. Usa variantes responsivas (sm:, md:, lg:) y de estado (hover:, focus:, dark:) para máxima flexibilidad.`;
    }
    if (isCssTerm(term, language)) {
        return `Aplica '${term.term}' en el contenedor apropiado (no en los hijos). Combínalo con otras propiedades de layout para control bidimensional completo.`;
    }
    return "Aplica este concepto de forma coherente y reutilizable respetando su ciclo de vida o contexto.";
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
    const recognitionRef = useRef<unknown>(null);

    // Cleanup mic on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
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
            recognitionRef.current?.abort();
            setIsListening(false);
            setIsStartingMic(false);
            return;
        }

        const SpeechRecognition = (window as unknown & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition || (window as unknown & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Tu navegador no soporta búsqueda por voz. Intenta usar Chrome o Edge.");
            return;
        }

        try {
            setIsStartingMic(true);

            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }

            const recognition = new SpeechRecognition();
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

            recognition.onerror = (event: unknown & { error?: string }) => {
                console.error("Error de reconocimiento de voz:", event.error);
                setIsListening(false);
                setIsStartingMic(false);

                if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                    setMicError("permiso");
                } else if (event.error === 'audio-capture') {
                    setMicError("hardware");
                } else if (event.error === 'service-not-allowed' || event.error === 'network') {
                    setMicError("red");
                } else {
                    setMicError("desconocido");
                }
            };

            recognition.onresult = (event: unknown & { results?: unknown[] }) => {
                const transcript = (event.results as unknown[])?.[0]?.[0]?.transcript;
                setSearchTerm(transcript);
                searchInputRef.current?.focus();
            };

            recognition.start();
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

    // Helpers
    const getUseCase = (term: TermDTO, context: string) => {
        return term.useCases?.find(u => u.context === context);
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

    const primaryExample = activeTerm?.examples?.[0];
    const secondaryExample = activeTerm?.examples?.[1];
    const activeVariant = activeTerm?.variants?.[0];
    const tagSet = new Set((activeTerm?.tags || []).map(tag => tag.toLowerCase()));
    const displayLanguage = getDisplayLanguage(activeTerm, activeVariant);
    const isReactConcept =
        tagSet.has("react") ||
        tagSet.has("hooks") ||
        tagSet.has("hook") ||
        tagSet.has("state") ||
        tagSet.has("callback");
    const showCallbacksSection = true; // Siempre mostramos, pero ajustamos contenido al concepto
    const showResetSection = true; // Siempre mostramos, con snippet contextual
    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 pb-20 relative overflow-x-hidden">

            {/* --- Cheat Sheet Slide-over --- */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[100] ${showCheatSheet ? 'translate-x-0' : 'translate-x-full'}`}>
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
                                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span>Usa nombres descriptivos para tus variables.</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-slate-300">
                                        <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                        <span>Mantén las funciones pequeñas y puras.</span>
                                    </li>
                                    {activeTerm.useCases?.map((uc, i) => (
                                        uc.tips && (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
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
                <div className="mx-auto max-w-5xl px-4 py-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Logo & Title */}
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setSearchTerm(""); setActiveTerm(null); }}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
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
                                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
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
                        {(results.length > 0 || (showHistory && recentSearches.length > 0) || (hasSearched && results.length === 0 && !loading && searchTerm)) && (
                            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto custom-scrollbar">

                                {/* Historial */}
                                {showHistory && !results.length && !searchTerm && (
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
                                    <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                                        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
                                            <Frown className="h-6 w-6" />
                                        </div>
                                        <p className="text-slate-300 font-medium">No encontramos coincidencias</p>
                                        <p className="text-xs text-slate-500 mt-1">Intenta con otro término o revisa la ortografía.</p>
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
            <main className="mx-auto max-w-5xl px-4 py-8">
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

                        {/* 1. Definición */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Brain className="h-5 w-5" />
                                    <h3 className="font-bold uppercase tracking-wide text-xs">1. Definición</h3>
                                </div>
                                <p className="text-base leading-relaxed text-slate-200">
                                    {activeTerm.meaningEs || activeTerm.meaning}
                                </p>
                                <CodeBlock
                                    code={primaryExample?.code || activeVariant?.snippet || buildDefaultSnippet(activeTerm, displayLanguage, "definición")}
                                    language={displayLanguage}
                                />
                                <p className="text-xs text-slate-500 italic">
                                    EN: {activeTerm.meaningEn || activeTerm.meaning}
                                </p>
                            </div>

                            {/* 2. Para qué sirve */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <Rocket className="h-5 w-5" />
                                    <h3 className="font-bold uppercase tracking-wide text-xs">2. Para qué sirve</h3>
                                </div>
                                <ul className="space-y-2 text-slate-200 text-sm">
                                    {[activeTerm.whatEs || activeTerm.what, getUseCase(activeTerm, "project")?.summary, getUseCase(activeTerm, "interview")?.summary, getUseCase(activeTerm, "bug")?.summary, activeTerm.tags?.slice(0, 3).map(tag => `Aplicar en contextos relacionados con ${tag}`).join(", "),].filter(Boolean).map((item, idx) => (<li key={idx} className="flex items-start gap-2">                                            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400"></span>                                            <span>{item}</span>                                        </li>))}
                                </ul>
                            </div>
                        </div>

                        {/* 3. Cómo funciona */}
                        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-5 flex flex-col gap-3 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
                            <div className="flex items-center gap-2 text-amber-400 relative z-10">
                                <Lightbulb className="h-5 w-5" />
                                <h3 className="font-bold uppercase tracking-wide text-xs">3. Cómo funciona</h3>
                            </div>
                            <p className="text-base leading-relaxed text-slate-200 relative z-10">
                                {activeTerm.howEs || activeTerm.how || "Sigue el flujo recomendado y aplica el patrón principal respetando su ciclo de vida."}
                            </p>
                            <CodeBlock
                                code={primaryExample?.code || activeVariant?.snippet || buildDefaultSnippet(activeTerm, displayLanguage, "como-funciona")}
                                language={displayLanguage}
                            />
                        </div>

                        {/* 4. Reglas importantes */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <ThumbsUp className="h-5 w-5" />
                                <h3 className="font-bold uppercase tracking-wide text-xs">4. Reglas importantes</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-slate-200">
                                {getRulesList(activeTerm, displayLanguage).map((rule, idx) => (
                                    <li key={idx}>{rule}</li>
                                ))}
                            </ul>
                        </div>

                        {/* 5. Ejemplo clásico profesional */}
                        {activeVariant?.snippet && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Code2 className="h-4 w-4 text-blue-400" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">5. Ejemplo profesional — {activeVariant.language}</span>
                                </div>
                                <CodeBlock code={activeVariant.snippet} language={activeVariant.language} />
                            </div>
                        )}

                        {/* 6. Ejemplo de estructura (objetos/arrays) */}
                        {primaryExample ? (
                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Split className="h-5 w-5" />
                                    <h3 className="font-bold uppercase tracking-wide text-xs">6. Ejemplo de estructura</h3>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-200">
                                    <div className="space-y-2">
                                        <p className="font-semibold">Caso de uso</p>
                                        <CodeBlock
                                            code={primaryExample.code}
                                            language={displayLanguage}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-semibold">Nota / recomendación</p>
                                        <p>{primaryExample.noteEs || primaryExample.noteEn || "Asegura inmutabilidad o flujo correcto según aplique al concepto."}</p>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* 7. Inicialización / setup */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2 text-sm text-slate-200">
                            <h3 className="font-bold uppercase tracking-wide text-xs text-emerald-400">7. Inicialización / setup</h3>
                            <p>{getInitializationText(activeTerm, displayLanguage)}</p>
                        </div>

                        {/* 8. Reiniciar / recrear */}
                        {showResetSection && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2 text-sm text-slate-200">
                                <h3 className="font-bold uppercase tracking-wide text-xs text-emerald-400">8. Reiniciar o recrear</h3>
                                <p>{getResetDescription(activeTerm, displayLanguage)}</p>
                                <CodeBlock
                                    code={buildResetSnippet(activeTerm, displayLanguage)}
                                    language={displayLanguage}
                                    showLineNumbers={false}
                                />
                            </div>
                        )}

                        {/* 9. Almacenar funciones o callbacks */}
                        {showCallbacksSection && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2 text-sm text-slate-200">
                                <h3 className="font-bold uppercase tracking-wide text-xs text-emerald-400">9. {isReactConcept ? "Almacenar funciones o callbacks" : "Aplicación segura / buenas prácticas"}</h3>
                                <p>{getBestPracticesDescription(activeTerm, displayLanguage, isReactConcept)}</p>
                                <CodeBlock
                                    code={buildCallbackSnippet(activeTerm, displayLanguage, isReactConcept)}
                                    language={displayLanguage}
                                    showLineNumbers={!isReactConcept && displayLanguage !== "html"}
                                />
                            </div>
                        )}

                        {/* 10. Patrón avanzado */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2 text-sm text-slate-200">
                            <h3 className="font-bold uppercase tracking-wide text-xs text-emerald-400">10. Patrón avanzado</h3>
                            <p>{getAdvancedPatternDescription(activeTerm, displayLanguage)}</p>
                        </div>

                        {/* 11. Errores comunes */}
                        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5 space-y-3">
                            <div className="flex items-center gap-2 text-yellow-400">
                                <AlertCircle className="h-5 w-5" />
                                <h3 className="font-bold uppercase tracking-wide text-xs">11. Errores comunes (y soluciones)</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-slate-200">
                                {(activeTerm.faqs || []).slice(0, 3).map((faq) => (
                                    <li key={faq.id} className="flex flex-col gap-1">
                                        <span className="font-semibold text-slate-100">{faq.questionEs}</span>
                                        <span className="text-slate-300">{faq.answerEs}</span>
                                    </li>
                                ))}
                                {!activeTerm.faqs?.length && (
                                    <>
                                        <li>Evita mutar estructuras u omitir pasos obligatorios del concepto.</li>
                                        <li>No apliques la lógica en el lugar incorrecto del ciclo de vida.</li>
                                        <li>Usa validaciones previas y control de dependencias.</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* 12. Ejemplo completo */}
                        {secondaryExample && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
                                <div className="flex items-center gap-2 text-emerald-300">
                                    <BookOpen className="h-5 w-5" />
                                    <h3 className="font-bold uppercase tracking-wide text-xs">12. Ejemplo completo</h3>
                                </div>
                                <CodeBlock
                                    code={secondaryExample.code}
                                    language={activeVariant?.language || "javascript"}
                                />
                                <p className="text-sm text-slate-300">{secondaryExample.noteEs || secondaryExample.noteEn || "Resume los puntos clave: configuración, buenas prácticas y manejo de casos reales."}</p>
                            </div>
                        )}

                        {/* 13. Preguntas de entrevista */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-300">
                                <MessageSquare className="h-5 w-5" />
                                <h3 className="font-bold uppercase tracking-wide text-xs">13. Preguntas típicas de entrevistas</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-slate-200">
                                {getInterviewQuestions(activeTerm, displayLanguage).map((item, idx) => (
                                    <li key={idx}>❓ {item.q} → {item.a}</li>
                                ))}
                            </ul>
                        </div>

                        {/* 14. Resumen profesional */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-300">
                                <History className="h-5 w-5" />
                                <h3 className="font-bold uppercase tracking-wide text-xs">14. Resumen profesional</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-200">
                                {(() => {
                                    const summary = getSummaryData(activeTerm, displayLanguage);
                                    return (
                                        <>
                                            <div className="space-y-1">
                                                <p><strong>Qué es</strong>: {summary.what}</p>
                                                <p><strong>Qué devuelve/aporta</strong>: {summary.returns}</p>
                                                <p><strong>Inicialización</strong>: {summary.init}</p>
                                                <p><strong>Actualización</strong>: {summary.update}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p><strong>Reglas</strong>: {summary.rules}</p>
                                                <p><strong>Objetos/arrays</strong>: {summary.objects}</p>
                                                <p><strong>Render/ejecución</strong>: {summary.render}</p>
                                                <p><strong>Errores típicos</strong>: {summary.errors}</p>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

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
