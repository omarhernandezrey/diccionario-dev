"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type ReviewStatus = "pending" | "in_review" | "approved" | "rejected";

type TermExample = { title: string; code: string; note?: string };
type TermVariantForm = {
  id?: number;
  language: string;
  snippet: string;
  notes?: string;
  level?: string;
  status?: ReviewStatus;
};
type UseCaseStepForm = { es?: string; en?: string };
type TermUseCaseForm = {
  id?: number;
  context: string;
  summary: string;
  steps: UseCaseStepForm[];
  tips?: string;
  status?: ReviewStatus;
};
type TermFaqForm = {
  id?: number;
  questionEs: string;
  questionEn?: string;
  answerEs: string;
  answerEn?: string;
  snippet?: string;
  category?: string;
  howToExplain?: string;
  status?: ReviewStatus;
};
type TermExerciseSolutionForm = {
  language: string;
  code: string;
  explainEs: string;
  explainEn?: string;
};
type TermExerciseForm = {
  id?: number;
  titleEs: string;
  titleEn?: string;
  promptEs: string;
  promptEn?: string;
  difficulty: string;
  solutions: TermExerciseSolutionForm[];
  status?: ReviewStatus;
};

type Term = {
  id: number;
  term: string;
  translation: string;
  aliases: string[];
  tags: string[];
  category: "frontend" | "backend" | "database" | "devops" | "general";
  meaning: string;
  what: string;
  how: string;
  examples: TermExample[];
  status: ReviewStatus;
  variants: TermVariantForm[];
  useCases: TermUseCaseForm[];
  faqs: TermFaqForm[];
  exercises: TermExerciseForm[];
};

type SessionUser = {
  id: number;
  username: string;
  role: "admin" | "user";
  email?: string | null;
};

type DeleteDialogState = {
  ids: number[];
  context: "single" | "bulk";
  title: string;
  description: string;
  preview: string[];
};

const CATS = ["frontend", "backend", "database", "devops", "general"] as const;
const STATUS_OPTIONS: ReviewStatus[] = ["pending", "in_review", "approved", "rejected"];
const LANGUAGE_OPTIONS = ["js", "ts", "css", "py", "java", "csharp", "go", "php", "ruby", "rust", "cpp", "swift", "kotlin"];
const LEVEL_OPTIONS = ["beginner", "intermediate", "advanced"];
const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

type TermsResponse = {
  ok?: boolean;
  items?: Term[];
};

type UnknownRecord = Record<string, unknown>;

type AnalyticsSummary = {
  topTerms: Array<{ termId: number; term: string; hits: number }>;
  languages: Array<{ language: string; count: number }>;
  contexts: Array<{ context: string; count: number }>;
  emptyQueries: Array<{ query: string; attempts: number }>;
};

type LeaderboardEntry = {
  id: number;
  username: string;
  email?: string | null;
  points: number;
  displayName?: string;
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function collectMessages(entry: unknown): string[] {
  if (!entry) return [];
  if (typeof entry === "string") return [entry];
  if (Array.isArray(entry)) {
    return entry.flatMap((value) => collectMessages(value));
  }
  if (isRecord(entry)) {
    return Object.values(entry).flatMap((value) => collectMessages(value));
  }
  return [];
}

function extractErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const errorValue = payload["error"];
  const messageValue = payload["message"];
  if (typeof errorValue === "string") return errorValue;
  if (typeof messageValue === "string") return messageValue;
  if (Array.isArray(errorValue)) {
    const filtered = errorValue.filter((value): value is string => typeof value === "string");
    if (filtered.length) return filtered.join(". ");
  }
  const nestedSources: unknown[] = [];
  if (isRecord(errorValue)) {
    nestedSources.push(errorValue["fieldErrors"], errorValue["formErrors"], errorValue["errors"]);
  }
  nestedSources.push(payload["fieldErrors"], payload["formErrors"]);
  for (const source of nestedSources) {
    const first = collectMessages(source).find((msg) => msg.trim().length);
    if (first) return first;
  }
  return null;
}

export default function AdminPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Term[]>([]);
  const [editing, setEditing] = useState<Term | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [allowBootstrap, setAllowBootstrap] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "admin" as "admin" | "user",
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all");

  const empty: Term = useMemo(
    () => ({
      id: 0,
      term: "",
      translation: "",
      aliases: [],
      tags: [],
      category: "general",
      meaning: "",
      what: "",
      how: "",
      examples: [],
      status: "pending",
      variants: [],
      useCases: [],
      faqs: [],
      exercises: [],
    }),
    [],
  );

  const categoriesCount = useMemo(() => new Set(items.map((item) => item.category)).size, [items]);
  const exampleCount = useMemo(() => items.reduce((sum, item) => sum + (item.examples?.length || 0), 0), [items]);
  const pendingCount = useMemo(() => items.filter((item) => item.status !== "approved").length, [items]);

  const canEdit = session?.role === "admin";
  const selectedCount = selectedIds.length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const selectionDisabled = !items.length || !canEdit;
  const today = new Date().toLocaleDateString("es-ES");

  const adminHeroStats = useMemo(
    () => [
      { label: "Términos visibles", value: items.length },
      { label: "Categorías activas", value: categoriesCount },
      { label: "Snippets guardados", value: exampleCount },
      { label: "Pendientes", value: pendingCount },
    ],
    [items.length, categoriesCount, exampleCount, pendingCount],
  );

  const filteredItems = useMemo(
    () => (statusFilter === "all" ? items : items.filter((item) => item.status === statusFilter)),
    [items, statusFilter],
  );

  const fetchTerms = useCallback(async (query: string) => {
    const params = new URLSearchParams();
    params.set("pageSize", "500");
    if (query) params.set("q", query);
    const url = `/api/terms?${params.toString()}`;
    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include",
      headers: { "cache-control": "no-store" },
    });
    let data: TermsResponse | null = null;
    let textFallback = "";
    try {
      data = (await res.json()) as TermsResponse;
    } catch {
      textFallback = await res.text().catch(() => "");
    }
    if (!res.ok || data?.ok === false) {
      const message = extractErrorMessage(data) || (textFallback?.trim() || res.statusText || "Error cargando términos");
      throw new Error(message);
    }
    const normalized = (Array.isArray(data?.items) ? data.items : []).map((item: UnknownRecord): Term => ({
      id: Number(item.id) || 0,
      term: String(item.term || ""),
      translation: String(item.translation || ""),
      aliases: Array.isArray(item.aliases) ? (item.aliases as string[]) : [],
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
      category: (item.category as Term["category"]) || "general",
      meaning: String(item.meaning || ""),
      what: String(item.what || ""),
      how: String(item.how || ""),
      examples: Array.isArray(item.examples) ? (item.examples as TermExample[]) : [],
      status: (item.status as ReviewStatus) || "pending",
      variants: Array.isArray(item.variants) ? (item.variants as TermVariantForm[]) : [],
      useCases: Array.isArray(item.useCases) ? (item.useCases as TermUseCaseForm[]) : [],
      faqs: Array.isArray(item.faqs) ? (item.faqs as TermFaqForm[]) : [],
      exercises: Array.isArray(item.exercises) ? (item.exercises as TermExerciseForm[]) : [],
    }));
    return [...normalized].sort((a, b) => Number(a.id) - Number(b.id));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchTerms(q)
      .then((fetched) => {
        if (!cancelled) setItems(fetched);
      })
      .catch((error) => {
        console.error("No se pudieron cargar los términos", error);
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchTerms, q, refreshIndex]);

  useEffect(() => {
    refreshSession();
  }, []);

  useEffect(() => {
    if (!canEdit) {
      setSelectedIds([]);
    }
  }, [canEdit]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  async function refreshSession() {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/auth", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      setAllowBootstrap(Boolean(data.allowBootstrap));
      if (res.ok && data?.user) {
        setSession(data.user);
      } else {
        setSession(null);
      }
    } catch {
      setAuthError("No se pudo validar la sesión");
      setSession(null);
    } finally {
      setAuthLoading(false);
    }
  }


  function toggleItemSelection(id: number) {
    if (!canEdit) return;
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((current) => current !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (!items.length || !canEdit) return;
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  }

  function scheduleRefresh() {
    setRefreshIndex((prev) => prev + 1);
  }

  async function login() {
    setAuthError(null);
    setMessage(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAuthError(data?.error || "Credenciales inválidas");
      return;
    }
    setLoginForm({ username: "", password: "" });
    setMessage(`Bienvenido ${data.user?.username}`);
    await refreshSession();
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE", credentials: "include" });
    setSession(null);
    setMessage("Sesión cerrada");
    await refreshSession();
  }

  async function register() {
    setAuthError(null);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ADMIN_TOKEN) {
      headers["x-admin-token"] = process.env.NEXT_PUBLIC_ADMIN_TOKEN as string;
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(registerForm),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAuthError(data?.error || "No se pudo registrar");
      return;
    }
    setMessage(`Usuario ${data.user?.username} creado`);
    if (allowBootstrap) {
      refreshSession();
    }
    setRegisterForm({ username: "", password: "", email: "", role: "user" });
  }

  const requestDeletion = (targetIds: number[], context: "single" | "bulk") => {
    if (session?.role !== "admin") {
      setAuthError("Solo un administrador puede eliminar");
      return;
    }
    const uniqueIds = [...new Set(targetIds)].filter((id) => Number.isInteger(id) && id > 0);
    if (!uniqueIds.length) {
      setAuthError("Selecciona al menos un término");
      return;
    }
    const preview = items
      .filter((item) => uniqueIds.includes(item.id))
      .map((item) => item.term)
      .filter(Boolean);
    const title = context === "single" ? preview[0] || "Eliminar término" : `Eliminar ${uniqueIds.length} términos`;
    const description =
      context === "single"
        ? "Esta acción eliminará el término del catálogo y no se puede deshacer."
        : "Eliminarás de forma permanente todos los términos seleccionados. No podrás deshacerlo.";
    setDeleteDialog({ ids: uniqueIds, context, title, description, preview });
  };

  const handleDeleteClick = (id: number) => {
    requestDeletion([id], "single");
  };

  async function executeDeletion(targetIds: number[]) {
    if (session?.role !== "admin") {
      setAuthError("Solo un administrador puede eliminar");
      return;
    }
    const uniqueIds = [...new Set(targetIds)].filter((id) => Number.isInteger(id) && id > 0);
    if (!uniqueIds.length) {
      setDeleteDialog(null);
      return;
    }
    setDeleteLoading(true);
    setAuthError(null);
    setMessage(null);
    const snapshot = [...items];
    setItems((prev) => prev.filter((item) => !uniqueIds.includes(item.id)));
    setSelectedIds((prev) => prev.filter((id) => !uniqueIds.includes(id)));
    try {
      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          let data: unknown = null;
          let textFallback = "";
          const res = await fetch(`/api/terms/${id}`, {
            method: "DELETE",
            credentials: "include",
            cache: "no-store",
            headers: { "cache-control": "no-store" },
          });
          try {
            data = await res.json();
          } catch {
            textFallback = await res.text().catch(() => "");
          }
          const message = extractErrorMessage(data) || (textFallback?.trim() || res.statusText || "Error eliminando");
          return { id, ok: res.ok, status: res.status, message };
        }),
      );

      const fatal = results.find((result) => !result.ok && result.status !== 404);
      if (fatal) {
        setItems(snapshot);
        setAuthError(fatal.message);
        return;
      }

      const removedCount = results.filter((result) => result.ok).length;
      const missing = results.filter((result) => result.status === 404);

      if (removedCount) {
        setMessage(removedCount === 1 ? "Término eliminado" : `${removedCount} términos eliminados`);
      }
      if (missing.length) {
        const missingLabel =
          missing.length === 1
            ? missing[0].message
            : `Algunos términos ya no existían (${missing.map((result) => `#${result.id}`).join(", ")})`;
        setAuthError(missingLabel);
      }
    } catch (error) {
      console.error("Request falló eliminando término(s)", error);
      setItems(snapshot);
      setAuthError("No se pudo contactar la API");
      return;
    } finally {
      setDeleteLoading(false);
      setDeleteDialog(null);
    }
    try {
      const latestItems = await fetchTerms(q);
      setItems(latestItems);
    } catch (error) {
      console.error("No se pudo sincronizar los términos tras eliminar", error);
    }
    scheduleRefresh();
  }

  async function save(term: Term) {
    if (session?.role !== "admin") {
      setAuthError("Solo un administrador puede guardar cambios");
      return;
    }
    const isNew = !term.id;
    const url = isNew ? "/api/terms" : `/api/terms/${term.id}`;
    const method = isNew ? "POST" : "PATCH";
    let data: unknown = null;
    let textFallback = "";
    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(term),
      });
      try {
        data = await res.json();
      } catch {
        textFallback = await res.text().catch(() => "");
      }
      if (!res.ok) {
        const message = extractErrorMessage(data) || (textFallback?.trim() || res.statusText || "Error guardando");
        console.error("Fallo guardando término", { status: res.status, data, textFallback, message });
        setAuthError(message);
        return;
      }
    } catch (error) {
      console.error("Request falló guardando término", error);
      setAuthError("No se pudo contactar la API");
      return;
    }
    setMessage(isNew ? "Término creado" : "Término actualizado");
    setEditing(null);
    try {
      const updatedItems = await fetchTerms(q);
      setItems(updatedItems);
    } catch (error) {
      console.error("No se pudo sincronizar los términos tras guardar", error);
    }
    scheduleRefresh();
  }

  const showRegisterCard = allowBootstrap || canEdit;

  return (
    <div className="min-h-screen bg-ink-900 text-white">
      <header className="border-b border-white/10 bg-linear-to-r from-ink-900 via-ink-800 to-ink-900">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-3xl border border-white/20 bg-white/10 p-3">
                  <Image src="/logo.png" alt="Diccionario Técnico Web" width={48} height={48} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">Panel de control</p>
                  <h1 className="text-3xl font-semibold">Admin · Diccionario</h1>
                </div>
              </div>
              <p className="text-sm text-white/70">
                Controla el glosario técnico, usuarios y sesiones con herramientas listas para producción.
              </p>
              <dl className="grid gap-4 sm:grid-cols-3">
                {adminHeroStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow-card">
                    <dt className="text-xs uppercase tracking-wide text-white/60">{stat.label}</dt>
                    <dd className="text-2xl font-semibold text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-card">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${session ? "bg-accent-emerald/20 text-accent-emerald" : "bg-accent-danger/20 text-accent-danger"}`}
              >
                {session ? "Sesión activa" : "Sin sesión"}
              </span>
              <p className="mt-2 text-sm text-white/70">
                {authLoading
                  ? "Verificando sesión…"
                  : session
                    ? `Logueado como ${session.username} (${session.role})`
                    : "Inicia sesión para desbloquear todas las herramientas."}
              </p>
              <p className="text-xs text-white/50">Última sincronización: {today}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {session ? (
                  <button className="btn-ghost" type="button" onClick={logout}>
                    Cerrar sesión
                  </button>
                ) : null}
                <button className="btn-ghost" type="button" onClick={refreshSession}>
                  Refrescar
                </button>
                <button className="btn-primary text-sm" type="button" onClick={() => setEditing(empty)} disabled={!canEdit}>
                  Nuevo término
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10">
        <ToastStack
          error={authError}
          message={message}
          onClearError={() => setAuthError(null)}
          onClearMessage={() => setMessage(null)}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          {!session && (
            <AuthCard form={loginForm} onChange={setLoginForm} onSubmit={login} />
          )}
          {showRegisterCard && (
            <RegisterCard
              form={registerForm}
              onChange={setRegisterForm}
              onSubmit={register}
              allowBootstrap={allowBootstrap}
            />
          )}
        </div>
        <AnalyticsPanel />
        <LeaderboardPanel />
        <SelectionToolbar
          count={selectedCount}
          allSelected={allSelected}
          selectionDisabled={selectionDisabled}
          canEdit={canEdit}
          onToggleAll={toggleSelectAll}
          onBulkDelete={() => requestDeletion(selectedIds, "bulk")}
        />
        <TermsTable
          items={filteredItems}
          selectedIds={selectedIds}
          allSelected={allSelected}
          selectionDisabled={selectionDisabled}
          canEdit={canEdit}
          search={q}
          onSearchChange={setQ}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onToggleItem={toggleItemSelection}
          onToggleAll={toggleSelectAll}
          onEdit={setEditing}
          onDelete={handleDeleteClick}
          onCreate={() => setEditing(empty)}
        />
      </main>
      {editing && canEdit && <EditorSheet term={editing} onCancel={() => setEditing(null)} onSave={save} />}
      {deleteDialog && (
        <ConfirmDialog
          title={deleteDialog.title}
          description={deleteDialog.description}
          preview={deleteDialog.preview}
          confirmLabel={deleteDialog.context === "single" ? "Eliminar término" : "Eliminar todo"}
          cancelLabel="Cancelar"
          loading={deleteLoading}
          onCancel={() => setDeleteDialog(null)}
          onConfirm={() => executeDeletion(deleteDialog.ids)}
        />
      )}
    </div>
  );
}

type ToastStackProps = {
  error: string | null;
  message: string | null;
  onClearError: () => void;
  onClearMessage: () => void;
};

function ToastStack({ error, message, onClearError, onClearMessage }: ToastStackProps) {
  if (!error && !message) return null;
  return (
    <div className="space-y-3" aria-live="polite">
      {error ? (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-accent-danger/40 bg-accent-danger/10 px-4 py-3 text-sm text-accent-danger">
          <span>{error}</span>
          <button type="button" onClick={onClearError} className="text-accent-danger/70 hover:text-white">
            ✕
          </button>
        </div>
      ) : null}
      {message ? (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-accent-emerald/30 bg-accent-emerald/10 px-4 py-3 text-sm text-accent-emerald">
          <span>{message}</span>
          <button type="button" onClick={onClearMessage} className="text-accent-emerald/70 hover:text-white">
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}

type AuthCardProps = {
  form: { username: string; password: string };
  onChange: (next: { username: string; password: string }) => void;
  onSubmit: () => void;
};

function AuthCard({ form, onChange, onSubmit }: AuthCardProps) {
  const disabled = !form.username.trim() || !form.password.trim();
  return (
    <section className="glass-panel space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-white/60">Acceso</p>
        <h2 className="text-xl font-semibold">Iniciar sesión</h2>
        <p className="text-sm text-white/60">Accede con tus credenciales de administrador.</p>
      </header>
      <div className="space-y-3">
        <label className="text-sm text-white/70">
          Usuario
          <input
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-accent-secondary focus:outline-none"
            value={form.username}
            onChange={(event) => onChange({ ...form, username: event.target.value })}
          />
        </label>
        <label className="text-sm text-white/70">
          Contraseña
          <input
            type="password"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-accent-secondary focus:outline-none"
            value={form.password}
            onChange={(event) => onChange({ ...form, password: event.target.value })}
          />
        </label>
      </div>
      <button className="btn-primary w-full" type="button" onClick={onSubmit} disabled={disabled}>
        Entrar
      </button>
    </section>
  );
}

type RegisterCardProps = {
  form: { username: string; password: string; email: string; role: "admin" | "user" };
  onChange: (next: { username: string; password: string; email: string; role: "admin" | "user" }) => void;
  onSubmit: () => void;
  allowBootstrap: boolean;
};

function RegisterCard({ form, onChange, onSubmit, allowBootstrap }: RegisterCardProps) {
  const disabled = !form.username.trim() || !form.password.trim();
  return (
    <section className="glass-panel space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wide text-white/60">Usuarios</p>
        <h2 className="text-xl font-semibold">
          {allowBootstrap ? "Crear administrador inicial" : "Registrar usuario"}
        </h2>
        <p className="text-sm text-white/60">
          {allowBootstrap
            ? "El primer usuario será administrador automáticamente."
            : "Solo los administradores autenticados pueden crear nuevas cuentas."}
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-white/70">
          Usuario
          <input
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-accent-secondary focus:outline-none"
            value={form.username}
            onChange={(event) => onChange({ ...form, username: event.target.value })}
          />
        </label>
        <label className="text-sm text-white/70">
          Email (opcional)
          <input
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-accent-secondary focus:outline-none"
            value={form.email}
            onChange={(event) => onChange({ ...form, email: event.target.value })}
          />
        </label>
        <label className="text-sm text-white/70">
          Contraseña
          <input
            type="password"
            className="mt-1 w-full rounded-2xl border border-white/10 bg-transparent px-4 py-2 text-white focus:border-accent-secondary focus:outline-none"
            value={form.password}
            onChange={(event) => onChange({ ...form, password: event.target.value })}
          />
        </label>
        {!allowBootstrap && (
          <label className="text-sm text-white/70">
            Rol
            <select
              className="mt-1 w-full rounded-2xl border border-white/10 bg-ink-900/70 px-4 py-2 text-white focus:border-accent-secondary focus:outline-none"
              value={form.role}
              onChange={(event) => onChange({ ...form, role: event.target.value as "admin" | "user" })}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </label>
        )}
      </div>
      <button className="btn-primary w-full" type="button" onClick={onSubmit} disabled={disabled}>
        {allowBootstrap ? "Crear administrador" : "Registrar usuario"}
      </button>
    </section>
  );
}

type SelectionToolbarProps = {
  count: number;
  allSelected: boolean;
  selectionDisabled: boolean;
  canEdit: boolean;
  onToggleAll: () => void;
  onBulkDelete: () => void;
};

function SelectionToolbar({ count, allSelected, selectionDisabled, canEdit, onToggleAll, onBulkDelete }: SelectionToolbarProps) {
  return (
    <section className="glass-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-white/60">Selección actual</p>
        <div className="flex items-baseline gap-2">
          <strong className="text-2xl">{count}</strong>
          <span className="text-sm text-white/60">seleccionados</span>
        </div>
        <p className="text-xs text-white/60">
          {count
            ? allSelected
              ? "Todos los términos visibles están marcados."
              : "Términos marcados dentro del filtro activo."
            : "Marca términos para habilitar acciones masivas."}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="btn-ghost" type="button" onClick={onToggleAll} disabled={selectionDisabled}>
          {allSelected ? "Limpiar selección" : "Seleccionar visibles"}
        </button>
        <button className="btn-primary" type="button" onClick={onBulkDelete} disabled={!canEdit || !count}>
          Eliminar seleccionados
        </button>
      </div>
    </section>
  );
}

type TermsTableProps = {
  items: Term[];
  selectedIds: number[];
  allSelected: boolean;
  selectionDisabled: boolean;
  canEdit: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ReviewStatus | "all";
  onStatusFilterChange: (value: ReviewStatus | "all") => void;
  onToggleItem: (id: number) => void;
  onToggleAll: () => void;
  onEdit: (term: Term) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
};

function TermsTable({
  items,
  selectedIds,
  allSelected,
  selectionDisabled,
  canEdit,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onToggleItem,
  onToggleAll,
  onEdit,
  onDelete,
  onCreate,
}: TermsTableProps) {
  return (
    <section className="glass-panel space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">Catálogo</p>
          <h2 className="text-2xl font-semibold">Términos técnicos</h2>
          <p className="text-sm text-white/60">Controla y sincroniza el glosario completo en tiempo real.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="w-full text-sm text-white/70 sm:w-64">
            <span className="sr-only">Buscar término</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-ink-900/50 px-3 py-2">
              <span aria-hidden>🔍</span>
              <input
                className="w-full bg-transparent text-sm text-white focus:outline-none"
                type="search"
                value={search}
                placeholder='Ej. "fetch", "JOIN", "JWT"...'
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </label>
          <label className="text-sm text-white/70">
            Estado
            <select
              className="mt-1 rounded-2xl border border-white/10 bg-ink-900/50 px-3 py-2 text-white focus:border-accent-secondary focus:outline-none"
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value as ReviewStatus | "all")}
            >
              <option value="all">Todos</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <button className="btn-primary" type="button" onClick={onCreate} disabled={!canEdit}>
            Crear término
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
        <table className="min-w-[720px] divide-y divide-white/10 text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-white/60">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Seleccionar todos los términos visibles"
                  checked={allSelected && !!items.length}
                  onChange={() => onToggleAll()}
                  disabled={selectionDisabled}
                  className="h-4 w-4 rounded border-white/40 bg-transparent"
                />
              </th>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Traducción</th>
              <th className="px-4 py-3">Término</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length ? (
              items.map((item) => (
                <tr key={item.id} className="bg-white/2">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar término ${item.term}`}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => onToggleItem(item.id)}
                      disabled={!canEdit}
                      className="h-4 w-4 rounded border-white/40 bg-transparent"
                    />
                  </td>
                  <td className="px-4 py-3 text-white/70">{item.id}</td>
                  <td className="px-4 py-3 font-semibold text-white">{item.translation}</td>
                  <td className="px-4 py-3 text-white/80">{item.term}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-xs capitalize text-white/70">{item.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-ghost" type="button" onClick={() => onEdit(item)} disabled={!canEdit}>
                        Editar
                      </button>
                      <button className="btn-ghost" type="button" onClick={() => onDelete(item.id)} disabled={!canEdit}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10">
                  <div className="flex flex-col items-center gap-3 text-center text-white/60">
                    <strong>Sin resultados</strong>
                    <span>Crea un término nuevo o ajusta la búsqueda para ver registros.</span>
                    <button className="btn-primary" type="button" onClick={onCreate} disabled={!canEdit}>
                      Crear término
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function statusBadgeClass(status: ReviewStatus) {
  switch (status) {
    case "approved":
      return "bg-accent-emerald/20 text-accent-emerald";
    case "rejected":
      return "bg-accent-danger/20 text-accent-danger";
    case "in_review":
      return "bg-amber-200/20 text-amber-200";
    default:
      return "bg-white/10 text-white/70";
  }
}

function AnalyticsPanel() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch("/api/analytics", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        if (payload?.ok !== false && payload?.summary) {
          setSummary(payload.summary as AnalyticsSummary);
        } else {
          throw new Error(payload?.error || "Sin datos");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar la analítica");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-3xl border border-white/10 bg-ink-900/70 p-6 text-white shadow-glow-card">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">Observabilidad</p>
          <h2 className="text-lg font-semibold">Consultas y huecos</h2>
        </div>
        {loading ? (
          <span className="text-xs text-white/60">Actualizando…</span>
        ) : error ? (
          <span className="text-xs text-accent-danger">{error}</span>
        ) : null}
      </header>
      {summary ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/60">Consultas resueltas</p>
            {summary.topTerms.length ? (
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                {summary.topTerms.slice(0, 6).map((entry) => (
                  <li key={entry.termId} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 px-3 py-2">
                    <span>{entry.term}</span>
                    <span className="text-white/60">{entry.hits} hits</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-white/60">Aún no hay datos.</p>
            )}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Consultas sin resultados</p>
              {summary.emptyQueries.length ? (
                <ul className="mt-3 space-y-1 text-xs text-white/80">
                  {summary.emptyQueries.slice(0, 4).map((entry) => (
                    <li key={entry.query} className="flex items-center justify-between">
                      <span className="truncate" title={entry.query}>
                        {entry.query}
                      </span>
                      <span className="text-white/50">{entry.attempts}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-white/60">Todo tiene coincidencias.</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-4 text-xs text-white/80">
              <div className="grid gap-3">
                <div>
                  <p className="text-white/60">Idiomas</p>
                  <ul className="mt-1 space-y-1">
                    {summary.languages.slice(0, 3).map((entry) => (
                      <li key={entry.language} className="flex items-center justify-between">
                        <span>{entry.language.toUpperCase()}</span>
                        <span>{entry.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-white/60">Contextos</p>
                  <ul className="mt-1 space-y-1">
                    {summary.contexts.slice(0, 3).map((entry) => (
                      <li key={entry.context} className="flex items-center justify-between">
                        <span>{entry.context}</span>
                        <span>{entry.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        <p className="mt-4 text-xs text-white/60">Recolectando métricas…</p>
      ) : error ? (
        <p className="mt-4 text-xs text-accent-danger">{error}</p>
      ) : (
        <p className="mt-4 text-xs text-white/60">Sin datos aún.</p>
      )}
    </section>
  );
}

function LeaderboardPanel() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        setEntries(Array.isArray(payload?.items) ? (payload.items as LeaderboardEntry[]) : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar el ranking");
        setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-card">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">Gamificación</p>
          <h2 className="text-lg font-semibold text-white">Ranking de contribuidores</h2>
        </div>
        {error ? <span className="text-xs text-accent-danger">{error}</span> : null}
      </header>
      {entries === null ? (
        <p className="mt-4 text-xs text-white/60">Calculando aportes…</p>
      ) : entries.length ? (
        <ul className="mt-4 space-y-3">
          {entries.map((entry, index) => (
            <li key={entry.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  #{index + 1} {entry.username || entry.displayName || entry.id}
                </p>
                {entry.email ? <p className="text-xs text-white/50">{entry.email}</p> : null}
              </div>
              <span className="text-xs font-semibold text-white/70">{entry.points} pts</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-xs text-white/60">Aún no hay contribuciones registradas.</p>
      )}
    </section>
  );
}

function LeaderboardPanel() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leaderboard", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        if (cancelled) return;
        setEntries(payload?.items ?? []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "No se pudo cargar el ranking");
        setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow-card">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">Gamificación</p>
          <h2 className="text-lg font-semibold text-white">Ranking de contribuidores</h2>
        </div>
        {error ? <span className="text-xs text-accent-danger">{error}</span> : null}
      </header>
      {entries === null ? (
        <p className="mt-4 text-xs text-white/60">Calculando aportes…</p>
      ) : entries.length ? (
        <ul className="mt-4 space-y-3">
          {entries.map((entry, index) => (
            <li key={entry.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/60 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  #{index + 1} {entry.username}
                </p>
                {entry.email ? <p className="text-xs text-white/50">{entry.email}</p> : null}
              </div>
              <span className="text-xs font-semibold text-white/70">{entry.points} pts</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-xs text-white/60">Aún no hay contribuciones registradas.</p>
      )}
    </section>
  );
}

type EditorSheetProps = {
  term: Term;
  onCancel: () => void;
  onSave: (term: Term) => void;
};

function EditorSheet({ term, onCancel, onSave }: EditorSheetProps) {
  const [val, setVal] = useState(term);
  const baseFieldClasses =
    "mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-4 py-2 text-white shadow-inner focus:border-accent-secondary focus:outline-none placeholder-white/50";

  useEffect(() => {
    setVal(term);
  }, [term]);

  const requiredFilled = Boolean(val.term.trim() && val.translation.trim() && val.meaning.trim() && val.what.trim() && val.how.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/90 px-4 py-6 backdrop-blur">
      <section className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/15 bg-[#050915] p-6 shadow-glow-card">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/60">{val.id ? "Editar término" : "Nuevo término"}</p>
            <h2 className="text-2xl font-semibold">{val.term || "Término sin título"}</h2>
          </div>
          <button className="btn-ghost" type="button" onClick={onCancel}>
            Cerrar
          </button>
        </header>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-white/70">
            Término
            <input
              className={baseFieldClasses}
              required
              value={val.term}
              onChange={(event) => setVal({ ...val, term: event.target.value })}
            />
          </label>
          <label className="text-sm text-white/70">
            Traducción
            <input
              className={baseFieldClasses}
              required
              value={val.translation}
              onChange={(event) => setVal({ ...val, translation: event.target.value })}
            />
          </label>
          <label className="text-sm text-white/70">
            Categoría
            <select
              className={`${baseFieldClasses} bg-ink-800`}
              value={val.category}
              onChange={(event) => setVal({ ...val, category: event.target.value as Term["category"] })}
            >
              {CATS.map((category) => (
                <option key={category} value={category} className="bg-ink-900 text-white">
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-white/70">
            Estado
            <select
              className={`${baseFieldClasses} bg-ink-800`}
              value={val.status}
              onChange={(event) => setVal({ ...val, status: event.target.value as ReviewStatus })}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status} className="bg-ink-900 text-white">
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-white/70">
            Significado
            <textarea
              className={`${baseFieldClasses} min-h-[96px] resize-none`}
              rows={2}
              required
              value={val.meaning}
              onChange={(event) => setVal({ ...val, meaning: event.target.value })}
            />
          </label>
          <label className="text-sm text-white/70">
            Qué resuelve
            <textarea
              className={`${baseFieldClasses} min-h-[96px] resize-none`}
              rows={2}
              required
              value={val.what}
              onChange={(event) => setVal({ ...val, what: event.target.value })}
            />
          </label>
        </div>
        <label className="mt-4 block text-sm text-white/70">
          Cómo se usa
          <textarea
            className={`${baseFieldClasses} min-h-[160px] bg-ink-900 font-mono text-sm`}
            rows={5}
            required
            value={val.how}
            onChange={(event) => setVal({ ...val, how: event.target.value })}
          />
        </label>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ChipInput
            label="Aliases"
            placeholder="hook, helper..."
            values={val.aliases}
            onChange={(aliases) => setVal({ ...val, aliases })}
          />
          <ChipInput
            label="Tags"
            placeholder="#css, performance..."
            values={val.tags}
            onChange={(tags) => setVal({ ...val, tags })}
          />
        </div>
        <div className="mt-6">
          <ExamplesEditor
            value={val.examples}
            onChange={(examples) =>
              setVal({
                ...val,
                examples,
              })
            }
          />
        </div>
        <div className="mt-6 space-y-6">
          <VariantsEditor value={val.variants} onChange={(variants) => setVal({ ...val, variants })} />
          <UseCasesEditor value={val.useCases} onChange={(useCases) => setVal({ ...val, useCases })} />
          <FaqsEditor value={val.faqs} onChange={(faqs) => setVal({ ...val, faqs })} />
          <ExercisesEditor value={val.exercises} onChange={(exercises) => setVal({ ...val, exercises })} />
        </div>
        {!requiredFilled && <p className="mt-3 text-sm text-accent-danger">Completa traducción, término, significado, qué hace y cómo se usa.</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className="btn-ghost" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-primary" type="button" onClick={() => onSave(val)} disabled={!requiredFilled}>
            Guardar
          </button>
        </div>
      </section>
    </div>
  );
}

type ChipInputProps = {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
};

function ChipInput({ label, placeholder, values, onChange }: ChipInputProps) {
  const [draft, setDraft] = useState("");

  function addDraft() {
    const value = draft.trim();
    if (!value) return;
    if (values.includes(value)) {
      setDraft("");
      return;
    }
    onChange([...values, value]);
    setDraft("");
  }

  function removeChip(target: string) {
    onChange(values.filter((value) => value !== target));
  }

  return (
    <label className="text-sm text-white/70">
      {label}
      <div className="mt-1 flex flex-wrap gap-2 rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 shadow-inner">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs text-white">
            {value}
            <button type="button" aria-label={`Eliminar ${value}`} onClick={() => removeChip(value)} className="text-white/70 hover:text-white">
              ✕
            </button>
          </span>
        ))}
        <input
          className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "Tab" || event.key === ",") {
              event.preventDefault();
              addDraft();
            }
          }}
          onBlur={() => addDraft()}
        />
      </div>
    </label>
  );
}

type ExamplesEditorProps = {
  value: TermExample[];
  onChange: (examples: TermExample[]) => void;
};

function ExamplesEditor({ value, onChange }: ExamplesEditorProps) {
  const [list, setList] = useState<TermExample[]>(value);

  useEffect(() => {
    setList(value);
  }, [value]);

  function sync(next: TermExample[]) {
    setList(next);
    onChange(next);
  }

  function update(index: number, patch: Partial<TermExample>) {
    const next = list.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
    sync(next);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    sync(next);
  }

  function remove(index: number) {
    const next = list.filter((_, idx) => idx !== index);
    sync(next);
  }

  function add() {
    sync([...list, { title: "", code: "", note: "" }]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">Ejemplos interactivos</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir ejemplo
        </button>
      </div>
      {list.length ? (
        <div className="space-y-4">
          {list.map((example, index) => (
            <div key={`${example.title}-${index}`} className="rounded-2xl border border-white/15 bg-[#050915] p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Bloque #{index + 1}</p>
                <div className="flex gap-2">
                  <button className="btn-ghost" type="button" onClick={() => move(index, -1)} disabled={index === 0}>
                    Subir
                  </button>
                  <button className="btn-ghost" type="button" onClick={() => move(index, 1)} disabled={index === list.length - 1}>
                    Bajar
                  </button>
                  <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="text-xs uppercase tracking-wide text-white/50">
                  Título
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white shadow-inner focus:border-accent-secondary focus:outline-none"
                    value={example.title}
                    onChange={(event) => update(index, { title: event.target.value })}
                  />
                </label>
                <label className="text-xs uppercase tracking-wide text-white/50">
                  Nota
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white shadow-inner focus:border-accent-secondary focus:outline-none"
                    value={example.note || ""}
                    onChange={(event) => update(index, { note: event.target.value })}
                  />
                </label>
              </div>
              <label className="mt-3 block text-xs uppercase tracking-wide text-white/50">
                Código
                <textarea
                  className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050915] px-3 py-2 font-mono text-xs text-white shadow-inner focus:border-accent-secondary focus:outline-none"
                  rows={4}
                  value={example.code}
                  onChange={(event) => update(index, { code: event.target.value })}
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/60">Sin ejemplos.</p>
      )}
    </div>
  );
}

type VariantsEditorProps = {
  value: TermVariantForm[];
  onChange: (variants: TermVariantForm[]) => void;
};

function VariantsEditor({ value, onChange }: VariantsEditorProps) {
  const [list, setList] = useState<TermVariantForm[]>(value);
  useEffect(() => {
    setList(value);
  }, [value]);

  const sync = (next: TermVariantForm[]) => {
    setList(next);
    onChange(next);
  };

  const update = (index: number, patch: Partial<TermVariantForm>) => {
    sync(list.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };

  const remove = (index: number) => {
    sync(list.filter((_, idx) => idx !== index));
  };

  const add = () => {
    sync([...list, { language: "js", snippet: "", level: "intermediate", status: "pending" }]);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">Variantes por lenguaje</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir variante
        </button>
      </div>
      {list.length ? (
        <div className="space-y-3">
          {list.map((variant, index) => (
            <div key={`variant-${index}`} className="rounded-2xl border border-white/15 bg-[#050915] p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-white/50">Variante #{index + 1}</p>
                <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                  Eliminar
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-xs text-white/60">
                  Lenguaje
                  <select
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white focus:outline-none"
                    value={variant.language}
                    onChange={(event) => update(index, { language: event.target.value })}
                  >
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-white/60">
                  Nivel
                  <select
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white focus:outline-none"
                    value={variant.level || "intermediate"}
                    onChange={(event) => update(index, { level: event.target.value })}
                  >
                    {LEVEL_OPTIONS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-white/60">
                  Estado
                  <select
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white focus:outline-none"
                    value={variant.status || "pending"}
                    onChange={(event) => update(index, { status: event.target.value as ReviewStatus })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-3 block text-xs text-white/60">
                Snippet
                <textarea
                  className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050915] px-3 py-2 font-mono text-xs text-white focus:outline-none"
                  rows={3}
                  value={variant.snippet}
                  onChange={(event) => update(index, { snippet: event.target.value })}
                />
              </label>
              <label className="mt-3 block text-xs text-white/60">
                Notas
                <input
                  className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                  value={variant.notes || ""}
                  onChange={(event) => update(index, { notes: event.target.value })}
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/60">Sin variantes aún.</p>
      )}
    </section>
  );
}

type UseCasesEditorProps = {
  value: TermUseCaseForm[];
  onChange: (useCases: TermUseCaseForm[]) => void;
};

function UseCasesEditor({ value, onChange }: UseCasesEditorProps) {
  const [list, setList] = useState<TermUseCaseForm[]>(value);
  useEffect(() => setList(value), [value]);
  const sync = (next: TermUseCaseForm[]) => {
    setList(next);
    onChange(next);
  };
  const update = (index: number, patch: Partial<TermUseCaseForm>) => {
    sync(list.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };
  const updateStep = (index: number, stepIndex: number, patch: Partial<UseCaseStepForm>) => {
    const steps = [...(list[index].steps || [])];
    steps[stepIndex] = { ...steps[stepIndex], ...patch };
    update(index, { steps });
  };
  const addStep = (index: number) => {
    update(index, { steps: [...(list[index].steps || []), { es: "", en: "" }] });
  };
  const removeStep = (index: number, stepIndex: number) => {
    const steps = (list[index].steps || []).filter((_, idx) => idx !== stepIndex);
    update(index, { steps });
  };
  const remove = (index: number) => sync(list.filter((_, idx) => idx !== index));
  const add = () => sync([...list, { context: "project", summary: "", steps: [{ es: "" }], status: "pending" }]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">Casos de uso</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir caso
        </button>
      </div>
      {list.length ? (
        <div className="space-y-3">
          {list.map((useCase, index) => (
            <div key={`usecase-${index}`} className="rounded-2xl border border-white/15 bg-[#050915] p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-white/50">Caso #{index + 1}</p>
                <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                  Eliminar
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-xs text-white/60">
                  Contexto
                  <select
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white focus:outline-none"
                    value={useCase.context}
                    onChange={(event) => update(index, { context: event.target.value })}
                  >
                    {(["interview", "project", "bug"] as const).map((ctx) => (
                      <option key={ctx} value={ctx}>
                        {ctx}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-white/60">
                  Estado
                  <select
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white focus:outline-none"
                    value={useCase.status || "pending"}
                    onChange={(event) => update(index, { status: event.target.value as ReviewStatus })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-white/60">
                  Tips
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                    value={useCase.tips || ""}
                    onChange={(event) => update(index, { tips: event.target.value })}
                  />
                </label>
              </div>
              <label className="mt-3 block text-xs text-white/60">
                Resumen
                <textarea
                  className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050915] px-3 py-2 text-sm text-white focus:outline-none"
                  rows={3}
                  value={useCase.summary}
                  onChange={(event) => update(index, { summary: event.target.value })}
                />
              </label>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/60">Pasos</p>
                  <button className="btn-ghost" type="button" onClick={() => addStep(index)}>
                    + Paso
                  </button>
                </div>
                {(useCase.steps || []).map((step, stepIndex) => (
                  <div key={`step-${stepIndex}`} className="grid gap-2 md:grid-cols-2">
                    <label className="text-xs text-white/60">
                      ES
                      <input
                        className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                        value={step.es || ""}
                        onChange={(event) => updateStep(index, stepIndex, { es: event.target.value })}
                      />
                    </label>
                    <div className="flex gap-2">
                      <label className="flex-1 text-xs text-white/60">
                        EN
                        <input
                          className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                          value={step.en || ""}
                          onChange={(event) => updateStep(index, stepIndex, { en: event.target.value })}
                        />
                      </label>
                      <button className="btn-ghost mt-5" type="button" onClick={() => removeStep(index, stepIndex)}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/60">Sin casos de uso todavía.</p>
      )}
    </section>
  );
}

type FaqsEditorProps = {
  value: TermFaqForm[];
  onChange: (faqs: TermFaqForm[]) => void;
};

function FaqsEditor({ value, onChange }: FaqsEditorProps) {
  const [list, setList] = useState<TermFaqForm[]>(value);
  useEffect(() => setList(value), [value]);
  const sync = (next: TermFaqForm[]) => {
    setList(next);
    onChange(next);
  };
  const update = (index: number, patch: Partial<TermFaqForm>) => {
    sync(list.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };
  const remove = (index: number) => sync(list.filter((_, idx) => idx !== index));
  const add = () => sync([...list, { questionEs: "", answerEs: "", status: "pending" }]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">FAQs</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir FAQ
        </button>
      </div>
      {list.length ? (
        <div className="space-y-3">
          {list.map((faq, index) => (
            <div key={`faq-${index}`} className="rounded-2xl border border-white/15 bg-[#050915] p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-white/50">FAQ #{index + 1}</p>
                <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                  Eliminar
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-white/60">
                  Pregunta (ES)
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                    value={faq.questionEs}
                    onChange={(event) => update(index, { questionEs: event.target.value })}
                  />
                </label>
                <label className="text-xs text-white/60">
                  Pregunta (EN)
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                    value={faq.questionEn || ""}
                    onChange={(event) => update(index, { questionEn: event.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-white/60">
                  Respuesta (ES)
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050915] px-3 py-2 text-sm text-white focus:outline-none"
                    rows={3}
                    value={faq.answerEs}
                    onChange={(event) => update(index, { answerEs: event.target.value })}
                  />
                </label>
                <label className="text-xs text-white/60">
                  Respuesta (EN)
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050915] px-3 py-2 text-sm text-white focus:outline-none"
                    rows={3}
                    value={faq.answerEn || ""}
                    onChange={(event) => update(index, { answerEn: event.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-xs text-white/60">
                  Snippet
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                    value={faq.snippet || ""}
                    onChange={(event) => update(index, { snippet: event.target.value })}
                  />
                </label>
                <label className="text-xs text-white/60">
                  Categoría
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                    value={faq.category || ""}
                    onChange={(event) => update(index, { category: event.target.value })}
                  />
                </label>
                <label className="text-xs text-white/60">
                  Estado
                  <select
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white focus:outline-none"
                    value={faq.status || "pending"}
                    onChange={(event) => update(index, { status: event.target.value as ReviewStatus })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-3 block text-xs text-white/60">
                Cómo explicarlo
                <textarea
                  className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050915] px-3 py-2 text-sm text-white focus:outline-none"
                  rows={2}
                  value={faq.howToExplain || ""}
                  onChange={(event) => update(index, { howToExplain: event.target.value })}
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/60">Sin FAQs.</p>
      )}
    </section>
  );
}

type ExercisesEditorProps = {
  value: TermExerciseForm[];
  onChange: (exercises: TermExerciseForm[]) => void;
};

function ExercisesEditor({ value, onChange }: ExercisesEditorProps) {
  const [list, setList] = useState<TermExerciseForm[]>(value);
  useEffect(() => setList(value), [value]);
  const sync = (next: TermExerciseForm[]) => {
    setList(next);
    onChange(next);
  };
  const update = (index: number, patch: Partial<TermExerciseForm>) => {
    sync(list.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };
  const updateSolutions = (index: number, solutions: TermExerciseSolutionForm[]) => {
    update(index, { solutions });
  };
  const remove = (index: number) => sync(list.filter((_, idx) => idx !== index));
  const add = () => sync([...list, { titleEs: "", promptEs: "", difficulty: "medium", solutions: [{ language: "js", code: "", explainEs: "" }], status: "pending" }]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70">Ejercicios</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir ejercicio
        </button>
      </div>
      {list.length ? (
        <div className="space-y-3">
          {list.map((exercise, index) => (
            <div key={`exercise-${index}`} className="rounded-2xl border border-white/15 bg-[#050915] p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-white/50">Ejercicio #{index + 1}</p>
                <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                  Eliminar
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-white/60">
                  Título (ES)
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                    value={exercise.titleEs}
                    onChange={(event) => update(index, { titleEs: event.target.value })}
                  />
                </label>
                <label className="text-xs text-white/60">
                  Título (EN)
                  <input
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-sm text-white focus:outline-none"
                    value={exercise.titleEn || ""}
                    onChange={(event) => update(index, { titleEn: event.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-white/60">
                  Prompt (ES)
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050915] px-3 py-2 text-sm text-white focus:outline-none"
                    rows={2}
                    value={exercise.promptEs}
                    onChange={(event) => update(index, { promptEs: event.target.value })}
                  />
                </label>
                <label className="text-xs text-white/60">
                  Prompt (EN)
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050915] px-3 py-2 text-sm text-white focus:outline-none"
                    rows={2}
                    value={exercise.promptEn || ""}
                    onChange={(event) => update(index, { promptEn: event.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-white/60">
                  Dificultad
                  <select
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white focus:outline-none"
                    value={exercise.difficulty}
                    onChange={(event) => update(index, { difficulty: event.target.value })}
                  >
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-white/60">
                  Estado
                  <select
                    className="mt-1 w-full rounded-2xl border border-white/15 bg-ink-900 px-3 py-2 text-sm text-white focus:outline-none"
                    value={exercise.status || "pending"}
                    onChange={(event) => update(index, { status: event.target.value as ReviewStatus })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <SolutionsEditor value={exercise.solutions || []} onChange={(solutions) => updateSolutions(index, solutions)} />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/60">Sin ejercicios.</p>
      )}
    </section>
  );
}

type SolutionsEditorProps = {
  value: TermExerciseSolutionForm[];
  onChange: (solutions: TermExerciseSolutionForm[]) => void;
};

function SolutionsEditor({ value, onChange }: SolutionsEditorProps) {
  const [list, setList] = useState<TermExerciseSolutionForm[]>(value.length ? value : [{ language: "js", code: "", explainEs: "" }]);
  useEffect(() => setList(value.length ? value : [{ language: "js", code: "", explainEs: "" }]), [value]);
  const sync = (next: TermExerciseSolutionForm[]) => {
    setList(next);
    onChange(next);
  };
  const update = (index: number, patch: Partial<TermExerciseSolutionForm>) => {
    sync(list.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  };
  const remove = (index: number) => sync(list.filter((_, idx) => idx !== index));
  const add = () => sync([...list, { language: "js", code: "", explainEs: "" }]);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-white/60">Soluciones</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir solución
        </button>
      </div>
      {list.map((solution, index) => (
        <div key={`solution-${index}`} className="rounded-2xl border border-white/10 bg-ink-900/50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs text-white/60">
              Lenguaje
              <select
                className="mt-1 rounded-2xl border border-white/10 bg-ink-900 px-2 py-1 text-xs text-white focus:outline-none"
                value={solution.language}
                onChange={(event) => update(index, { language: event.target.value })}
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn-ghost" type="button" onClick={() => remove(index)}>
              Eliminar
            </button>
          </div>
          <label className="mt-2 block text-xs text-white/60">
            Código
            <textarea
              className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050915] px-3 py-2 font-mono text-xs text-white focus:outline-none"
              rows={3}
              value={solution.code}
              onChange={(event) => update(index, { code: event.target.value })}
            />
          </label>
          <label className="mt-2 block text-xs text-white/60">
            Explicación (ES)
            <textarea
              className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-xs text-white focus:outline-none"
              rows={2}
              value={solution.explainEs}
              onChange={(event) => update(index, { explainEs: event.target.value })}
            />
          </label>
          <label className="mt-2 block text-xs text-white/60">
            Explicación (EN)
            <textarea
              className="mt-1 w-full rounded-2xl border border-white/15 bg-[#0d1424] px-3 py-2 text-xs text-white focus:outline-none"
              rows={2}
              value={solution.explainEn || ""}
              onChange={(event) => update(index, { explainEn: event.target.value })}
            />
          </label>
        </div>
      ))}
    </div>
  );
}

type ConfirmDialogProps = {
  title: string;
  description: string;
  preview: string[];
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({ title, description, preview, confirmLabel, cancelLabel = "Cancelar", loading, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <section className="w-full max-w-lg space-y-4 rounded-3xl border border-white/10 bg-ink-900 p-6 shadow-glow-card" role="dialog" aria-modal="true">
        <header>
          <p className="text-xs uppercase tracking-wide text-white/60">Confirmación requerida</p>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </header>
        <p className="text-sm text-white/70">{description}</p>
        {preview?.length ? (
          <div className="flex flex-wrap gap-2">
            {preview.slice(0, 3).map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                {item}
              </span>
            ))}
            {preview.length > 3 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                +{preview.length - 3} más
              </span>
            )}
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button className="btn-ghost" type="button" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className="btn-primary" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
