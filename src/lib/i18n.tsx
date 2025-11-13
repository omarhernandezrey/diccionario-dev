"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "es" | "en";

const dictionaries = {
  es: {
    hero: {
      badge: "Actualizado en vivo",
      title: "Todo tu diccionario técnico en un panel vivo",
      subtitle: "Conceptos, aliases, snippets y contexto curado por Omar Hernandez Rey para acelerar onboardings y mentorías.",
      primaryCta: "Explorar términos",
      secondaryCta: "Ir al panel admin",
      stats: {
        curated: "Términos curados",
        updates: "Actualizaciones/mes",
        coverage: "Cobertura de stack",
      },
    },
    search: {
      title: "Buscador semántico",
      subtitle: "Filtra por categoría, alias, tags o ejemplos; todo sincronizado con Prisma.",
      placeholder: "Busca por término, alias o tag...",
      quickFilters: "Búsquedas sugeridas",
      empty: "Sin resultados para tu consulta.",
      helper: "Escribe al menos dos caracteres para activar el buscador.",
      ariaLabel: "Buscar términos técnicos",
      overview: "Vista previa del término",
      results: "Resultados",
    },
    filters: {
      heading: "Refina la lista",
      category: "Categorías",
      tag: "Etiqueta o tag",
      sort: "Ordenar por",
      perPage: "Resultados por página",
      reset: "Limpiar filtros",
    },
    sortOptions: {
      term_asc: "A-Z",
      term_desc: "Z-A",
      recent: "Más recientes",
      oldest: "Más antiguos",
    },
    state: {
      loading: "Cargando resultados…",
      error: "No se pudieron cargar los términos.",
      empty: "No encontramos coincidencias.",
      success: "{count} resultados encontrados",
    },
    pagination: {
      prev: "Anterior",
      next: "Siguiente",
      page: "Página {page} de {pages}",
    },
    explorer: {
      title: "Explorador de términos",
      description: "Filtra, ordena y pagina resultados sincronizados con la base de datos.",
    },
    language: {
      label: "Idioma",
      es: "Español",
      en: "Inglés",
    },
    feedback: {
      success: "Acción completada",
      error: "Ocurrió un error inesperado",
      confirm: "¿Seguro que deseas continuar?",
    },
    admin: {
      heroTitle: "Panel de administración con telemetría",
      heroSubtitle: "Gestiona el diccionario con autenticación segura, historial y rate limiting.",
      welcome: "Sesión activa",
      stats: {
        terms: "Términos",
        categories: "Categorías",
        snippets: "Snippets",
      },
      forms: {
        createTitle: "Crear término",
        editTitle: "Editar término",
        aliasLabel: "Aliases",
        tagLabel: "Tags",
        categoryLabel: "Categoría",
        meaning: "Significado",
        what: "¿Qué resuelve?",
        how: "¿Cómo se usa?",
        examples: "Ejemplos",
        save: "Guardar cambios",
        create: "Crear término",
        delete: "Eliminar seleccionados",
      },
      notifications: {
        created: "Término creado correctamente",
        updated: "Término actualizado",
        deleted: "Términos eliminados",
      },
      empty: "No hay registros para mostrar con los filtros actuales.",
    },
    editor: {
      examplesTitle: "Ejemplos interactivos",
      aliasTitle: "Aliases inteligentes",
      addExample: "Añadir ejemplo",
      addAlias: "Añadir alias",
      aliasPlaceholder: "Alias o sinónimo",
      notePlaceholder: "Nota contextual",
      delete: "Eliminar",
    },
    terms: {
      meaning: "Significado",
      what: "Qué resuelve",
      how: "Cómo se usa",
      examples: "Ejemplos",
      tags: "Etiquetas",
      aliases: "Aliases",
    },
    common: {
      copy: "Copiar",
      copied: "Copiado",
    },
    categories: {
      all: "Todos",
      frontend: "Frontend",
      backend: "Backend",
      database: "Base de datos",
      devops: "DevOps",
      general: "General",
    },
    landing: {
      highlights: {
        rate: {
          title: "Rate limiting inteligente",
          description: "Protegemos endpoints públicos con estrategias basadas en IP.",
        },
        history: {
          title: "Historial automático",
          description: "Cada cambio queda registrado con snapshot y autor.",
        },
      },
      admin: {
        badge: "Panel admin",
        title: "Control total del diccionario",
        description: "Roles, historial, rate limiting y validaciones con Prisma + Zod.",
        feature1Title: "Flujos accesibles",
        feature1Description: "Acciones con feedback visual, toasts y confirmaciones consistentes.",
        feature2Title: "Editor enriquecido",
        feature2Description: "Administra aliases, ejemplos y snippets con campos dinámicos.",
        cta: "Abrir panel",
      },
    },
  },
  en: {
    hero: {
      badge: "Live updates",
      title: "Your technical dictionary, refreshed in real time",
      subtitle: "Concepts, aliases and code curated by Omar Hernandez Rey to speed up onboarding and mentoring.",
      primaryCta: "Browse terms",
      secondaryCta: "Open admin panel",
      stats: {
        curated: "Curated terms",
        updates: "Updates/month",
        coverage: "Stack coverage",
      },
    },
    search: {
      title: "Semantic search",
      subtitle: "Filter by category, alias, tags or examples—all synced with Prisma.",
      placeholder: "Search by term, alias or tag...",
      quickFilters: "Suggested queries",
      empty: "No results found.",
      helper: "Type at least two characters to start searching.",
      ariaLabel: "Search technical terms",
      overview: "Term overview",
      results: "Results",
    },
    filters: {
      heading: "Refine results",
      category: "Categories",
      tag: "Tag or label",
      sort: "Sort by",
      perPage: "Items per page",
      reset: "Reset filters",
    },
    sortOptions: {
      term_asc: "A-Z",
      term_desc: "Z-A",
      recent: "Newest",
      oldest: "Oldest",
    },
    state: {
      loading: "Loading results…",
      error: "We couldn't load the terms.",
      empty: "No matches yet.",
      success: "{count} results found",
    },
    pagination: {
      prev: "Previous",
      next: "Next",
      page: "Page {page} of {pages}",
    },
    explorer: {
      title: "Terms explorer",
      description: "Filter, sort and paginate records directly from the database.",
    },
    language: {
      label: "Language",
      es: "Spanish",
      en: "English",
    },
    feedback: {
      success: "Action completed",
      error: "Something went wrong",
      confirm: "Are you sure?",
    },
    admin: {
      heroTitle: "Admin panel with telemetry",
      heroSubtitle: "Manage the dictionary with secure auth, history and rate limiting.",
      welcome: "Active session",
      stats: {
        terms: "Terms",
        categories: "Categories",
        snippets: "Snippets",
      },
      forms: {
        createTitle: "Create term",
        editTitle: "Edit term",
        aliasLabel: "Aliases",
        tagLabel: "Tags",
        categoryLabel: "Category",
        meaning: "Meaning",
        what: "What does it solve?",
        how: "How is it used?",
        examples: "Examples",
        save: "Save changes",
        create: "Create term",
        delete: "Delete selected",
      },
      notifications: {
        created: "Term created successfully",
        updated: "Term updated",
        deleted: "Terms deleted",
      },
      empty: "No records to show with the current filters.",
    },
    editor: {
      examplesTitle: "Interactive examples",
      aliasTitle: "Smart aliases",
      addExample: "Add example",
      addAlias: "Add alias",
      aliasPlaceholder: "Alias or synonym",
      notePlaceholder: "Contextual note",
      delete: "Delete",
    },
    terms: {
      meaning: "Meaning",
      what: "What problem does it solve?",
      how: "How is it used?",
      examples: "Examples",
      tags: "Tags",
      aliases: "Aliases",
    },
    common: {
      copy: "Copy",
      copied: "Copied",
    },
    categories: {
      all: "All",
      frontend: "Frontend",
      backend: "Backend",
      database: "Database",
      devops: "DevOps",
      general: "General",
    },
    landing: {
      highlights: {
        rate: {
          title: "Smart rate limiting",
          description: "Public endpoints stay protected with IP-based strategies.",
        },
        history: {
          title: "Automatic history",
          description: "Every change is stored with snapshot and author.",
        },
      },
      admin: {
        badge: "Admin panel",
        title: "Full control of the dictionary",
        description: "Roles, history, rate limiting and Prisma + Zod validations.",
        feature1Title: "Accessible flows",
        feature1Description: "Actions include visual feedback, toasts and confirmations.",
        feature2Title: "Rich editor",
        feature2Description: "Manage aliases, examples and snippets with dynamic fields.",
        cta: "Open panel",
      },
    },
  },
};

type TranslationKey = string;

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);
const STORAGE_KEY = "diccionario:locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("es");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored) {
      setLocale((current) => (current === stored ? current : stored));
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(key, locale, vars),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n debe usarse dentro de I18nProvider");
  }
  return ctx;
}

function translate(key: string, locale: Locale, vars?: Record<string, string | number>) {
  const dictionary = dictionaries[locale] as Record<string, unknown>;
  const segments = key.split(".");
  let current: unknown = dictionary;
  for (const segment of segments) {
    if (typeof current !== "object" || current === null || !(segment in current)) {
      return key;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  if (typeof current !== "string") {
    return key;
  }
  if (!vars) {
    return current;
  }
  return current.replace(/\{(\w+)\}/g, (_, token) => String(vars[token] ?? ""));
}

export const availableLocales: Array<{ code: Locale; label: string }> = [
  { code: "es", label: dictionaries.es.language.es },
  { code: "en", label: dictionaries.en.language.en },
];
