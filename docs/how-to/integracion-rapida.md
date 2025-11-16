# Integración rápida (API + UI)

Esta guía está optimizada para que Omar Hernandez Rey o cualquier colaborador copie y ejecute ejemplos en minutos. Todos los snippets usan la API pública del diccionario (`/api/terms`, `/api/auth/login`, `/api/auth`).

## Variables base

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_DICCIONARIO_API ?? "http://localhost:3000";
```

## Snippets de API listos para copiar

### Fetch + TypeScript — Listar términos

```ts
type TermsQuery = {
  q?: string;
  category?: "frontend" | "backend" | "database" | "devops" | "general";
  tag?: string;
  page?: number;
  pageSize?: number;
  sort?: "recent" | "oldest" | "term_asc" | "term_desc";
};

type Term = {
  id: number;
  term: string;
  translation: string;
  tags: string[];
  category: TermsQuery["category"];
  meaning: string;
  what: string;
  how: string;
};

type TermsResponse = {
  ok: true;
  items: Term[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

export async function fetchTerms(params: TermsQuery = {}): Promise<TermsResponse> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      search.set(key, String(value));
    }
  });

  const res = await fetch(`${API_BASE_URL}/api/terms?${search.toString()}`, {
    headers: { "Cache-Control": "no-store" },
  });
  if (!res.ok) {
    throw new Error(`No se pudo obtener términos (${res.status})`);
  }
  return (await res.json()) as TermsResponse;
}
```

### Axios — Login + creación de términos administrativos

```ts
import axios from "axios";

const adminClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // conserva la cookie admin_token
});

export async function adminLogin(username: string, password: string) {
  const { data } = await adminClient.post("/api/auth/login", { username, password });
  if (!data.ok) throw new Error(data.error ?? "Login inválido");
  return data.user; // JWT viene en Set-Cookie
}

export type CreateTermPayload = {
  term: string;
  translation: string;
  aliases?: string[];
  tags?: string[];
  category: "frontend" | "backend" | "database" | "devops" | "general";
  meaning: string;
  what: string;
  how: string;
  examples?: Array<{ title: string; code: string; note?: string }>;
};

export async function createTerm(payload: CreateTermPayload) {
  const { data } = await adminClient.post("/api/terms", payload);
  if (!data.ok) throw new Error(data.error ?? "No se pudo crear el término");
  return data.item;
}
```

### cURL — Operaciones esenciales

```bash
# 1) Healthcheck rápido
curl -i http://localhost:3000/api/health

# 2) Login administrador (recibe cookie admin_token)
curl -i -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"AdminPass123!"}'

# 3) Listar términos aplicando filtros
curl -s 'http://localhost:3000/api/terms?q=css&tag=layout&pageSize=5&sort=recent'

# 4) Crear término (requiere cookie o Bearer)
curl -i -X POST http://localhost:3000/api/terms \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <ADMIN_TOKEN>' \
  -d @./payloads/new-term.json
```

## Componentes UI reutilizables

### `TermCard.tsx`

```tsx
type TermCardProps = {
  term: Term;
  onTagClick?: (tag: string) => void;
};

export function TermCard({ term, onTagClick }: TermCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
      <header className="flex flex-wrap items-baseline gap-3">
        <h3 className="text-xl font-semibold text-white">{term.term}</h3>
        <span className="text-sm uppercase tracking-wide text-slate-400">{term.translation}</span>
        <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-300">
          {term.category}
        </span>
      </header>
      <p className="mt-2 text-sm text-slate-300">{term.meaning}</p>
      <section className="mt-4 space-y-1 text-sm text-slate-400">
        <p><strong className="text-slate-200">Qué:</strong> {term.what}</p>
        <p><strong className="text-slate-200">Cómo:</strong> {term.how}</p>
      </section>
      {term.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {term.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-200 hover:bg-slate-700"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </article>
  );
}
```

### `TermsExplorer.tsx`

```tsx
import { useEffect, useMemo, useState, useTransition } from "react";
import { fetchTerms } from "./api-client"; // reutiliza la función fetch de arriba

export function TermsExplorer() {
  const [filters, setFilters] = useState<TermsQuery>({ page: 1, pageSize: 12, sort: "term_asc" });
  const [state, setState] = useState<{ loading: boolean; data?: TermsResponse; error?: string }>({
    loading: true,
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    fetchTerms(filters)
      .then((data) => active && setState({ loading: false, data }))
      .catch((error) => active && setState({ loading: false, error: error.message }));
    return () => {
      active = false;
    };
  }, [filters]);

  const items = state.data?.items ?? [];

  const metaLabel = useMemo(() => {
    if (!state.data) return "Cargando...";
    return `Página ${state.data.meta.page}/${state.data.meta.totalPages} · ${state.data.meta.total} términos`;
  }, [state.data]);

  const updateFilter = (patch: Partial<TermsQuery>) =>
    startTransition(() => setFilters((prev) => ({ ...prev, ...patch, page: 1 })));

  return (
    <section className="space-y-6">
      <form
        className="grid gap-3 md:grid-cols-[1fr_180px_140px]"
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.currentTarget;
          const q = new FormData(form).get("q")?.toString();
          updateFilter({ q: q || undefined });
        }}
      >
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="Buscar (ej. grid layout)"
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={filters.category ?? ""}
          onChange={(event) => updateFilter({ category: event.target.value || undefined })}
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="database">Database</option>
          <option value="devops">DevOps</option>
          <option value="general">General</option>
        </select>
        <select
          value={filters.sort}
          onChange={(event) => updateFilter({ sort: event.target.value as TermsQuery["sort"] })}
          className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none"
        >
          <option value="term_asc">A → Z</option>
          <option value="term_desc">Z → A</option>
          <option value="recent">Más recientes</option>
          <option value="oldest">Más antiguas</option>
        </select>
      </form>

      <p className="text-sm text-slate-400">{state.loading || isPending ? "Buscando…" : metaLabel}</p>

      {state.error && <p className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">{state.error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <TermCard key={item.id} term={item} onTagClick={(tag) => updateFilter({ tag })} />
        ))}
      </div>
    </section>
  );
}
```

> Copia estos componentes en `src/components/TermCard.tsx` y `src/components/TermsExplorer.tsx` o en el módulo que prefieras. Solo requieren Tailwind (ya configurado) y la función `fetchTerms`.

## scripts/examples.http

El archivo `scripts/examples.http` (creado en esta tarea) contiene los mismos requests listos para VS Code/Insomnia. Ejecuta cada bloque para validar integración en segundos.
