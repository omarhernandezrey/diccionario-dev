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
    Sparkles,
    Brain,
    Zap,
    Check,
    ChevronRight,
    ChevronDown,
    ChevronUp,
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
    ThumbsDown,
    Split,
    Rocket
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { TermDTO } from "@/types/term";

// --- Mock Data for "Vs" Feature (Simulating Backend Data) ---
const termComparisons: Record<string, { bad: string; good: string; badDesc: string; goodDesc: string }> = {
    useState: {
        bad: `// ❌ Mal: Mutación directa
count = count + 1;
// React no se entera del cambio`,
        badDesc: "Nunca modifiques el estado directamente. React no detectará el cambio y no re-renderizará el componente.",
        good: `// ✅ Bien: Usando el setter
setCount(prev => prev + 1);
// Trigger de re-render seguro`,
        goodDesc: "Usa siempre la función setter. Para actualizaciones basadas en el estado anterior, usa la forma funcional."
    },
    useEffect: {
        bad: `// ❌ Mal: Sin dependencias
useEffect(() => {
  fetchData();
}); // Se ejecuta en CADA render`,
        badDesc: "Omitir el array de dependencias causa que el efecto corra en cada render, provocando loops infinitos o baja performance.",
        good: `// ✅ Bien: Dependencias explícitas
useEffect(() => {
  fetchData();
}, []); // Solo al montar`,
        goodDesc: "Define explícitamente tus dependencias. Usa un array vacío [] para ejecutar solo al montar el componente."
    },
    map: {
        bad: `// ❌ Mal: Modificando el array original
const newArr = [];
arr.forEach(item => newArr.push(item * 2));`,
        badDesc: "Usar forEach o push para transformar datos es imperativo y más propenso a errores de mutación.",
        good: `// ✅ Bien: Retornando nuevo array
const newArr = arr.map(item => item * 2);`,
        goodDesc: "Map es declarativo, inmutable y retorna una nueva instancia del array transformada."
    }
};

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

// --- Componente Principal ---

export default function DiccionarioDevApp() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    const [results, setResults] = useState<TermDTO[]>([]);
    const [activeTerm, setActiveTerm] = useState<TermDTO | null>(null);
    const [relatedTerms, setRelatedTerms] = useState<TermDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const [activeContext, setActiveContext] = useState<"project" | "interview" | "bug">("project");
    const [showSolution, setShowSolution] = useState(false);
    const [copied, setCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
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
    const recognitionRef = useRef<any>(null);

    // Cleanup mic on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
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

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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

            recognition.onerror = (event: any) => {
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

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
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

    const activeUseCase = activeTerm ? getUseCase(activeTerm, activeContext) : null;
    const activeVariant = activeTerm?.variants?.[0];
    const activeExercise = activeTerm?.exercises?.[0];
    // STRICT MODE: Solo mostramos la sección si hay datos específicos para este término
    const comparisonData = activeTerm ? (termComparisons[activeTerm.term?.toLowerCase()] || termComparisons[String(activeTerm.id).toLowerCase()]) : null;

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
                                    {activeVariant ? activeVariant.snippet.split('\n')[0] : 'Sintaxis no disponible'}
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
                                        {recentSearches.map((term, idx) => (
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
                        {/* Term Header */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="text-4xl font-bold text-white tracking-tight">
                                        {activeTerm.term}
                                    </h2>
                                    <span
                                        className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400"
                                    >
                                        {activeTerm.category}
                                    </span>
                                </div>
                                <div className="mt-2 flex gap-2 flex-wrap">
                                    {activeTerm.tags?.map((tag) => (
                                        <span key={tag} className="text-sm text-slate-500">
                                            #{tag}
                                        </span>
                                    ))}
                                    {activeTerm.aliases?.map((alias) => (
                                        <span key={alias} className="text-sm text-slate-600 italic">
                                            ({alias})
                                        </span>
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

                        {/* --- Matriz de Entendimiento (Qué es / Qué hace / Cómo funciona) --- */}
                        <div className="grid gap-4 md:grid-cols-3">

                            {/* 1. ¿Qué es? (Identidad) */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm flex flex-col">
                                <div className="mb-3 flex items-center gap-2 text-emerald-400">
                                    <Brain className="h-5 w-5" />
                                    <h3 className="font-bold uppercase tracking-wide text-xs">¿Qué es?</h3>
                                </div>
                                <p className="text-base leading-relaxed text-slate-200 flex-1">
                                    {activeTerm.meaningEs || activeTerm.meaning}
                                </p>
                                {/* English Subtext (Non-intrusive) */}
                                <p className="mt-3 text-xs text-slate-500 italic border-t border-slate-800 pt-2">
                                    EN: "{activeTerm.meaningEn || activeTerm.meaning}"
                                </p>
                            </div>

                            {/* 2. ¿Para qué sirve? (Utilidad Práctica) */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-sm flex flex-col">
                                <div className="mb-3 flex items-center gap-2 text-blue-400">
                                    <Rocket className="h-5 w-5" />
                                    <h3 className="font-bold uppercase tracking-wide text-xs">¿Para qué sirve?</h3>
                                </div>
                                <p className="text-base leading-relaxed text-slate-200 flex-1">
                                    {getUseCase(activeTerm, 'project')?.summary || "Es fundamental para el desarrollo de software moderno y la resolución de problemas complejos."}
                                </p>
                                <div className="mt-3 flex gap-2">
                                    {activeTerm.tags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* 3. ¿Cómo funciona? (Mecánica / Modelo Mental) */}
                            <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-5 flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-amber-500/10 rounded-full blur-xl"></div>
                                <div className="mb-3 flex items-center gap-2 text-amber-400 relative z-10">
                                    <Lightbulb className="h-5 w-5" />
                                    <h3 className="font-bold uppercase tracking-wide text-xs">¿Cómo funciona?</h3>
                                </div>
                                <p className="text-base leading-relaxed text-slate-200 flex-1 relative z-10">
                                    {activeTerm.whatEs || activeTerm.what || "Funciona abstrayendo la complejidad subyacente para ofrecer una interfaz más simple."}
                                </p>
                            </div>
                        </div>

                        {/* Code Section - Real Editor Look */}
                        {activeVariant && (
                            <div className="rounded-2xl border border-slate-800 bg-[#282a36] overflow-hidden shadow-2xl group">
                                <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-900/50 px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Code2 className="h-4 w-4 text-blue-400" />
                                        <span className="text-xs font-bold text-slate-400 uppercase">
                                            {activeVariant.language}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleCopy(activeVariant.snippet, setCodeCopied)}
                                        className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        {codeCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                                <div className="text-sm">
                                    <SyntaxHighlighter
                                        language={activeVariant.language === 'ts' ? 'typescript' : activeVariant.language}
                                        style={dracula}
                                        customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
                                        showLineNumbers={true}
                                        wrapLines={true}
                                    >
                                        {activeVariant.snippet}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                        )}

                        {/* --- New Feature: "Vs" Comparison Section --- */}
                        {comparisonData && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
                                    <Split className="h-5 w-5 text-purple-400" />
                                    <h3 className="font-bold text-white">Best Practices vs Anti-Patterns</h3>
                                </div>
                                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                                    {/* Bad Practice */}
                                    <div className="p-6 bg-red-500/5">
                                        <div className="flex items-center gap-2 mb-3 text-red-400">
                                            <ThumbsDown className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wide">No hagas esto</span>
                                        </div>
                                        <div className="rounded-lg border border-red-500/20 overflow-hidden mb-3">
                                            <SyntaxHighlighter
                                                language="javascript"
                                                style={dracula}
                                                customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e', fontSize: '0.8rem' }}
                                            >
                                                {comparisonData.bad}
                                            </SyntaxHighlighter>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {comparisonData.badDesc}
                                        </p>
                                    </div>

                                    {/* Good Practice */}
                                    <div className="p-6 bg-emerald-500/5">
                                        <div className="flex items-center gap-2 mb-3 text-emerald-400">
                                            <ThumbsUp className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wide">Haz esto</span>
                                        </div>
                                        <div className="rounded-lg border border-emerald-500/20 overflow-hidden mb-3">
                                            <SyntaxHighlighter
                                                language="javascript"
                                                style={dracula}
                                                customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e', fontSize: '0.8rem' }}
                                            >
                                                {comparisonData.good}
                                            </SyntaxHighlighter>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {comparisonData.goodDesc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Use Cases Tabs */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-400" /> Casos de Uso
                                </h3>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-1 backdrop-blur-md">
                                <div className="grid grid-cols-3 gap-1">
                                    {(["project", "interview", "bug"] as const).map((tab) => {
                                        const isActive = activeContext === tab;
                                        const icons = {
                                            project: Terminal,
                                            interview: MessageSquare,
                                            bug: Bug,
                                        };
                                        const Icon = icons[tab];
                                        // Verificar si existe este caso de uso para este término
                                        const exists = getUseCase(activeTerm, tab);

                                        return (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveContext(tab)}
                                                disabled={!exists}
                                                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${isActive
                                                    ? "bg-slate-800 text-white shadow-lg"
                                                    : exists
                                                        ? "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                                                        : "text-slate-700 cursor-not-allowed opacity-50"
                                                    }`}
                                            >
                                                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : ""}`} />
                                                <span className="capitalize">{tab}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="p-6 mt-2 min-h-[200px]">
                                    {activeUseCase ? (
                                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <h4 className="text-xl font-bold text-white mb-2">
                                                {activeUseCase.summary}
                                            </h4>
                                            {activeUseCase.tips && (
                                                <div className="mb-4 rounded-lg bg-indigo-500/10 p-3 border border-indigo-500/20">
                                                    <p className="text-sm text-indigo-300 italic">"{activeUseCase.tips}"</p>
                                                </div>
                                            )}
                                            <div className="space-y-3">
                                                {activeUseCase.steps.map((paso, i) => (
                                                    <div key={i} className="flex items-start gap-3 group">
                                                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-400 group-hover:border-emerald-500/50 transition-colors">
                                                            {i + 1}
                                                        </div>
                                                        <p className="text-slate-300 pt-0.5">{paso.es || paso.en}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                            <p>No hay información disponible para este contexto.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Exercises */}
                        {activeExercise && (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Terminal className="h-5 w-5 text-emerald-400" />
                                    <h3 className="font-bold text-white">Ejercicio Práctico</h3>
                                    <span className={`ml-auto text-xs px-2 py-1 rounded border ${activeExercise.difficulty === 'easy' ? 'border-emerald-500/30 text-emerald-400' :
                                        activeExercise.difficulty === 'medium' ? 'border-yellow-500/30 text-yellow-400' :
                                            'border-red-500/30 text-red-400'
                                        }`}>
                                        {activeExercise.difficulty.toUpperCase()}
                                    </span>
                                </div>
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-slate-200 mb-2">
                                        {activeExercise.titleEs || activeExercise.titleEn}
                                    </h4>
                                    <p className="text-slate-400">
                                        {activeExercise.promptEs || activeExercise.promptEn}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-800 bg-black/40 overflow-hidden">
                                    <button
                                        onClick={() => setShowSolution(!showSolution)}
                                        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800/50 transition-colors"
                                    >
                                        <span>Ver Solución</span>
                                        {showSolution ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>

                                    {showSolution && activeExercise.solutions?.[0] && (
                                        <div className="border-t border-slate-800 p-0 bg-[#282a36] animate-in slide-in-from-top-2">
                                            <SyntaxHighlighter
                                                language={activeExercise.solutions[0].language}
                                                style={dracula}
                                                customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                                            >
                                                {activeExercise.solutions[0].code}
                                            </SyntaxHighlighter>
                                            <div className="p-4 bg-slate-900/50 border-t border-slate-800">
                                                <div className="flex items-start gap-2 text-xs text-slate-400">
                                                    <Lightbulb className="h-4 w-4 text-amber-400 flex-shrink-0" />
                                                    <span>{activeExercise.solutions[0].explainEs || activeExercise.solutions[0].explainEn}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Related Terms (Discovery) */}
                        {relatedTerms.length > 0 && (
                            <div className="pt-8 border-t border-slate-800">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <ArrowRight className="h-5 w-5 text-emerald-400" />
                                    Conceptos Relacionados
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {relatedTerms.map(term => (
                                        <button
                                            key={term.id}
                                            onClick={() => selectTerm(term)}
                                            className="text-left p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 transition-all group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-slate-200 group-hover:text-white">{term.term}</span>
                                                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800">
                                                    {term.category}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {term.translation}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    // Empty State / Initial State
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className={`h-24 w-24 rounded-full bg-slate-900 flex items-center justify-center mb-6 ${loading ? 'animate-pulse' : ''}`}>
                            {isCodeMode ? <Code2 className="h-10 w-10 text-blue-400" /> : <Search className="h-10 w-10 text-slate-700" />}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {loading ? "Procesando..." : isCodeMode ? "Modo Análisis de Código" : "Empieza tu búsqueda"}
                        </h2>
                        <p className="text-slate-500 max-w-md">
                            {isCodeMode
                                ? "He detectado código. Presiona Enter para analizarlo o traducirlo."
                                : <span>Explora el glosario técnico. Prueba buscando <span className="text-emerald-400">"useState"</span>, <span className="text-blue-400">"API"</span> o <span className="text-amber-400">"Docker"</span>.</span>}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
