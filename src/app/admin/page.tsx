"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminDashboard from "@/components/admin/Dashboard";
import { Icon } from "@/components/Icon";
import { useNotifications } from "@/components/admin/NotificationsProvider";
import type { AdminNotification } from "@/components/admin/NotificationsProvider";

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

const ADMIN_VIEWS = [
  { id: "overview", label: "Inteligencia", description: "Analítica en vivo y tendencias", iconName: "ActivitySquare" },
  { id: "terms", label: "Colección", description: "Gestión total del glosario", iconName: "BookOpenCheck" },
  { id: "team", label: "Equipo", description: "Accesos, reputación y comunidad", iconName: "Users2" },
] as const;

type AdminView = (typeof ADMIN_VIEWS)[number]["id"];

const HERO_STAT_ICONS: Record<string, string> = {
  "Términos visibles": "BookOpenCheck",
  "Categorías activas": "Layers",
  "Snippets guardados": "Code2",
  Pendientes: "AlertTriangle",
};

type TermsResponse = {
  ok?: boolean;
  items?: Term[];
};

type UnknownRecord = Record<string, unknown>;

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

type AdminConsoleProps = {
  initialView?: AdminView;
};

export function AdminConsole({ initialView = "overview" }: AdminConsoleProps) {
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
  const [activeView, setActiveView] = useState<AdminView>(initialView);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastAutoRefresh, setLastAutoRefresh] = useState<string | null>(null);
  const [lastManualRefresh, setLastManualRefresh] = useState<string | null>(null);
  const [lastExportedAt, setLastExportedAt] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [analyticsPulse, setAnalyticsPulse] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [lastAnalyticsPing, setLastAnalyticsPing] = useState<string | null>(null);
  const { notifications, unreadCount, refresh: refreshNotifications, loading: notificationsLoading } = useNotifications();

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

  const statusSummary = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        },
        { pending: 0, in_review: 0, approved: 0, rejected: 0 } as Record<ReviewStatus, number>,
      ),
    [items],
  );

  const categoryHighlights = useMemo(() => {
    const buckets = new Map<Term["category"], number>();
    items.forEach((item) => {
      buckets.set(item.category, (buckets.get(item.category) || 0) + 1);
    });
    return [...buckets.entries()]
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [items]);

  const filteredItems = useMemo(
    () => (statusFilter === "all" ? items : items.filter((item) => item.status === statusFilter)),
    [items, statusFilter],
  );

  const fetchTerms = useCallback(async (query: string) => {
    const params = new URLSearchParams();
    params.set("pageSize", "100");
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

  const scheduleRefresh = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => {
      scheduleRefresh();
      setLastAutoRefresh(new Date().toLocaleTimeString("es-ES"));
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, scheduleRefresh]);

  const handleViewChange = useCallback((next: AdminView) => {
    setActiveView(next);
    if (next !== "terms") {
      setEditing(null);
    }
  }, []);

  const handleCreateTerm = useCallback(() => {
    handleViewChange("terms");
    setEditing(empty);
  }, [empty, handleViewChange]);

  const handleEditTerm = useCallback(
    (term: Term) => {
      handleViewChange("terms");
      setEditing(term);
    },
    [handleViewChange],
  );

  const handleManualRefresh = useCallback(() => {
    scheduleRefresh();
    setLastManualRefresh(new Date().toLocaleTimeString("es-ES"));
  }, [scheduleRefresh]);

  const exportCatalog = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const snapshot = await fetchTerms("");
      const payload = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `diccionario-terms-${new Date().toISOString().replace(/[:]/g, "-")}.json`;
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setMessage(`Exportados ${snapshot.length} términos`);
      setLastExportedAt(new Date().toLocaleTimeString("es-ES"));
    } catch (error) {
      console.error("No se pudo exportar el catálogo", error);
      setAuthError("No se pudo exportar el catálogo");
    } finally {
      setExporting(false);
    }
  }, [exporting, fetchTerms]);

  const pingAnalytics = useCallback(async () => {
    setAnalyticsPulse("loading");
    try {
      const res = await fetch("/api/analytics", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnalyticsPulse("ok");
      setLastAnalyticsPing(new Date().toLocaleTimeString("es-ES"));
    } catch (error) {
      console.error("No se pudo sincronizar analytics manualmente", error);
      setAnalyticsPulse("error");
      setAuthError("No se pudo sincronizar analytics manualmente");
    } finally {
      setTimeout(() => setAnalyticsPulse("idle"), 2500);
    }
  }, []);

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
    <div className="space-y-8 text-neo-text-primary">
      <section className="relative overflow-hidden rounded-[32px] border border-neo-border bg-neo-card p-8 shadow-glow-card">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-neo-primary/10 to-transparent blur-3xl lg:block" />
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-3xl border border-neo-border bg-neo-surface p-3 shadow-glow-card">
            <Icon library="lucide" name="BookOpenCheck" className="h-7 w-7 text-neo-text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">Panel de control</p>
            <h1 className="text-3xl font-semibold">Diccionario Dev · Admin</h1>
          </div>
          <div className="ml-auto flex items-center gap-3 rounded-full border border-neo-border bg-neo-surface px-4 py-2 text-xs text-neo-text-secondary">
            <Icon
              library="lucide"
              name="ShieldCheck"
              className={`h-4 w-4 ${session ? "text-accent-emerald" : "text-accent-danger"}`}
            />
            <span>{session ? `Activo: ${session.username} (${session.role})` : "Acceso restringido"}</span>
            <button type="button" className="text-neo-primary underline-offset-2 hover:underline" onClick={() => handleViewChange("team")}>
              Gestionar
            </button>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-neo-text-secondary">
          Controla el glosario técnico, detecta huecos y administra accesos en un solo flujo operacional.
        </p>
        <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminHeroStats.map((stat) => {
            const iconName = HERO_STAT_ICONS[stat.label] || "ActivitySquare";
            return (
              <div key={stat.label} className="flex flex-col gap-3 rounded-3xl border border-neo-border bg-neo-surface p-4 shadow-inner">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-neo-card">
                  <Icon library="lucide" name={iconName} className="h-5 w-5 text-neo-primary" />
                </div>
                <dt className="text-xs uppercase tracking-wide text-neo-text-secondary">{stat.label}</dt>
                <dd className="text-3xl font-semibold text-neo-text-primary">{stat.value}</dd>
              </div>
            );
          })}
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="btn-primary" type="button" onClick={handleCreateTerm} disabled={!canEdit}>
            Nuevo término
          </button>
          <button className="btn-ghost" type="button" onClick={() => handleViewChange("terms")}>
            Revisar catálogo
          </button>
          <button className="btn-ghost" type="button" onClick={refreshSession}>
            Revalidar sesión
          </button>
        </div>
        <p className="mt-4 text-xs text-neo-text-secondary">Última sincronización: {today}</p>
      </section>

      <ViewSwitcher
        activeView={activeView}
        onChange={handleViewChange}
        itemsCount={items.length}
        pendingCount={pendingCount}
        session={session}
        allowBootstrap={allowBootstrap}
      />

      <ToastStack
        error={authError}
        message={message}
        onClearError={() => setAuthError(null)}
        onClearMessage={() => setMessage(null)}
      />

      {activeView === "overview" ? (
        <div className="space-y-6">
          <AdminDashboard />
          <TermPipelinePanel statusSummary={statusSummary} categories={categoryHighlights} />
          <QuickActionsPanel
            autoRefresh={autoRefresh}
            lastAutoRefresh={lastAutoRefresh}
            lastManualRefresh={lastManualRefresh}
            lastExportedAt={lastExportedAt}
            exporting={exporting}
            analyticsStatus={analyticsPulse}
            analyticsLabel={lastAnalyticsPing}
            onToggleAutoRefresh={() => setAutoRefresh((prev) => !prev)}
            onManualRefresh={handleManualRefresh}
            onExport={exportCatalog}
            onPingAnalytics={pingAnalytics}
          />
          <OpsTimelinePanel
            items={items}
            notifications={notifications}
            lastManualRefresh={lastManualRefresh}
            lastAutoRefresh={lastAutoRefresh}
            lastExportedAt={lastExportedAt}
          />
          <IntegrationsStatusPanel
            termsStatus={items.length ? "ok" : "warning"}
            analyticsStatus={analyticsPulse}
            notificationsStatus={notificationsLoading ? "loading" : unreadCount ? "warning" : "ok"}
            authStatus={session ? "ok" : authLoading ? "loading" : "error"}
            lastAnalyticsPing={lastAnalyticsPing}
            lastAutoRefresh={lastAutoRefresh}
            allowBootstrap={allowBootstrap}
          />
        </div>
      ) : null}

      {activeView === "terms" ? (
        <div className="space-y-6">
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
            onEdit={handleEditTerm}
            onDelete={handleDeleteClick}
            onCreate={handleCreateTerm}
            autoRefreshEnabled={autoRefresh}
            lastAutoRefreshTime={lastAutoRefresh}
          />
        </div>
      ) : null}

      {activeView === "team" ? (
        <div className="space-y-6">
          <TeamPlaybookPanel
            session={session}
            authLoading={authLoading}
            allowBootstrap={allowBootstrap}
            today={today}
            onLogout={logout}
            onRefresh={refreshSession}
            alertCount={unreadCount}
            alertsSyncing={notificationsLoading}
            onSyncAlerts={refreshNotifications}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {!session && <AuthCard form={loginForm} onChange={setLoginForm} onSubmit={login} />}
            {showRegisterCard && (
              <RegisterCard form={registerForm} onChange={setRegisterForm} onSubmit={register} allowBootstrap={allowBootstrap} />
            )}
            <div className="lg:col-span-2">
              <LeaderboardPanel />
            </div>
          </div>
        </div>
      ) : null}

      {editing && canEdit && activeView === "terms" && <EditorSheet term={editing} onCancel={() => setEditing(null)} onSave={save} />}
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
          <button type="button" onClick={onClearError} className="text-accent-danger/70 hover:text-accent-danger">
            ✕
          </button>
        </div>
      ) : null}
      {message ? (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-accent-emerald/30 bg-accent-emerald/10 px-4 py-3 text-sm text-accent-emerald">
          <span>{message}</span>
          <button type="button" onClick={onClearMessage} className="text-accent-emerald/70 hover:text-accent-emerald">
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
    <section className="glass-panel space-y-4 border border-neo-border bg-neo-card">
      <header>
        <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Acceso</p>
        <h2 className="text-xl font-semibold">Iniciar sesión</h2>
        <p className="text-sm text-neo-text-secondary">Accede con tus credenciales de administrador.</p>
      </header>
      <div className="space-y-3">
        <label className="text-sm text-neo-text-secondary">
          Usuario
          <input
            className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
            value={form.username}
            onChange={(event) => onChange({ ...form, username: event.target.value })}
          />
        </label>
        <label className="text-sm text-neo-text-secondary">
          Contraseña
          <input
            type="password"
            className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
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
    <section className="glass-panel space-y-4 border border-neo-border bg-neo-card">
      <header>
        <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Usuarios</p>
        <h2 className="text-xl font-semibold">
          {allowBootstrap ? "Crear administrador inicial" : "Registrar usuario"}
        </h2>
        <p className="text-sm text-neo-text-secondary">
          {allowBootstrap
            ? "El primer usuario será administrador automáticamente."
            : "Solo los administradores autenticados pueden crear nuevas cuentas."}
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-neo-text-secondary">
          Usuario
          <input
            className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
            value={form.username}
            onChange={(event) => onChange({ ...form, username: event.target.value })}
          />
        </label>
        <label className="text-sm text-neo-text-secondary">
          Email (opcional)
          <input
            className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
            value={form.email}
            onChange={(event) => onChange({ ...form, email: event.target.value })}
          />
        </label>
        <label className="text-sm text-neo-text-secondary">
          Contraseña
          <input
            type="password"
            className="mt-1 w-full rounded-2xl border border-neo-border bg-transparent px-4 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
            value={form.password}
            onChange={(event) => onChange({ ...form, password: event.target.value })}
          />
        </label>
        {!allowBootstrap && (
          <label className="text-sm text-neo-text-secondary">
            Rol
            <select
              className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-4 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
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

type TeamPlaybookPanelProps = {
  session: SessionUser | null;
  authLoading: boolean;
  allowBootstrap: boolean;
  today: string;
  onLogout: () => void;
  onRefresh: () => void;
  alertCount: number;
  alertsSyncing: boolean;
  onSyncAlerts: () => void;
};

function TeamPlaybookPanel({
  session,
  authLoading,
  allowBootstrap,
  today,
  onLogout,
  onRefresh,
  alertCount,
  alertsSyncing,
  onSyncAlerts,
}: TeamPlaybookPanelProps) {
  return (
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Operaciones del equipo</p>
          <h2 className="text-lg font-semibold">{session ? `Hola ${session.username}` : "Gestiona los accesos"}</h2>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${authLoading ? "bg-neo-surface text-neo-text-secondary" : session ? "bg-accent-emerald/20 text-accent-emerald" : "bg-accent-danger/20 text-accent-danger"
            }`}
        >
          {authLoading ? "Validando…" : session ? "Sesión activa" : "Sin sesión"}
        </span>
      </header>
      <p className="mt-2 text-sm text-neo-text-secondary">
        {session
          ? "Invita nuevos editores, mantén tu sesión fresca y coordina la moderación."
          : allowBootstrap
            ? "Crea el primer administrador para levantar el panel completo."
            : "Inicia sesión con tu usuario o solicita un acceso administrador."}
      </p>
      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neo-border bg-neo-card p-3">
          <dt className="text-xs uppercase tracking-wide text-neo-text-secondary">Rol</dt>
          <dd className="text-sm font-semibold text-neo-text-primary">{session ? session.role : "Invitado"}</dd>
        </div>
        <div className="rounded-2xl border border-neo-border bg-neo-card p-3">
          <dt className="text-xs uppercase tracking-wide text-neo-text-secondary">Bootstrap</dt>
          <dd className="text-sm font-semibold text-neo-text-primary">{allowBootstrap ? "Disponible" : "Cerrado"}</dd>
        </div>
        <div className="rounded-2xl border border-neo-border bg-neo-card p-3">
          <dt className="text-xs uppercase tracking-wide text-neo-text-secondary">Sincronización</dt>
          <dd className="text-sm font-semibold text-neo-text-primary">{today}</dd>
        </div>
        <div className="rounded-2xl border border-neo-border bg-neo-card p-3">
          <dt className="text-xs uppercase tracking-wide text-neo-text-secondary">Alertas activas</dt>
          <dd className="text-sm font-semibold text-neo-text-primary">{alertsSyncing ? "Sync…" : alertCount}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        {session ? (
          <button className="btn-ghost" type="button" onClick={onLogout}>
            Cerrar sesión
          </button>
        ) : null}
        <button className="btn-primary" type="button" onClick={onRefresh}>
          {session ? "Refrescar sesión" : "Validar estado"}
        </button>
        <button className="btn-ghost" type="button" onClick={onSyncAlerts}>
          {alertsSyncing ? "Cargando alertas…" : "Sincronizar alertas"}
        </button>
      </div>
    </section>
  );
}

type ViewSwitcherProps = {
  activeView: AdminView;
  onChange: (view: AdminView) => void;
  itemsCount: number;
  pendingCount: number;
  session: SessionUser | null;
  allowBootstrap: boolean;
};

function ViewSwitcher({ activeView, onChange, itemsCount, pendingCount, session, allowBootstrap }: ViewSwitcherProps) {
  const meta: Record<AdminView, string> = {
    overview: `${itemsCount} términos indexados`,
    terms: pendingCount ? `${pendingCount} pendientes` : "Sin pendientes",
    team: session ? `Activo: ${session.username}` : allowBootstrap ? "Bootstrap abierto" : "Requiere sesión",
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {ADMIN_VIEWS.map((view) => {
        const isActive = view.id === activeView;
        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={`flex flex-col gap-3 rounded-3xl border p-5 text-left transition-all ${isActive
              ? "border-accent-secondary/60 bg-gradient-to-br from-accent-secondary/20 via-neo-surface to-neo-surface shadow-lg shadow-accent-secondary/30"
              : "border-neo-border bg-neo-surface hover:border-neo-primary/30"
              }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? "bg-white text-neo-bg" : "bg-neo-card text-neo-text-primary"
                  }`}
              >
                <Icon library="lucide" name={view.iconName} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{view.label}</p>
                <p className="text-xs text-neo-text-secondary">{view.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-neo-text-secondary">
              <span>{meta[view.id]}</span>
              {isActive ? <span className="text-accent-secondary">Activo</span> : <span>Explorar</span>}
            </div>
          </button>
        );
      })}
    </div>
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
    <section className="flex flex-col gap-4 rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Selección actual</p>
        <div className="flex items-baseline gap-2">
          <strong className="text-2xl">{count}</strong>
          <span className="text-sm text-neo-text-secondary">seleccionados</span>
        </div>
        <p className="text-xs text-neo-text-secondary">
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
  autoRefreshEnabled: boolean;
  lastAutoRefreshTime: string | null;
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
  autoRefreshEnabled,
  lastAutoRefreshTime,
}: TermsTableProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Catálogo</p>
          <h2 className="text-2xl font-semibold">Términos técnicos</h2>
          <p className="text-sm text-neo-text-secondary">Controla y sincroniza el glosario completo en tiempo real.</p>
          <p className="text-xs text-neo-text-secondary">
            {autoRefreshEnabled ? (
              <span className="text-accent-secondary">
                Autorefresco cada 30s{lastAutoRefreshTime ? ` · último a las ${lastAutoRefreshTime}` : ""}
              </span>
            ) : (
              "Autorefresco inactivo"
            )}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="w-full text-sm text-neo-text-secondary sm:w-64">
            <span className="sr-only">Buscar término</span>
            <div className="flex items-center gap-2 rounded-2xl border border-neo-border bg-neo-card px-3 py-2">
              <span aria-hidden>🔍</span>
              <input
                className="w-full bg-transparent text-sm text-neo-text-primary focus:outline-none"
                type="search"
                value={search}
                placeholder='Ej. "fetch", "JOIN", "JWT"...'
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </label>
          <label className="text-sm text-neo-text-secondary">
            Estado
            <select
              className="mt-1 rounded-2xl border border-neo-border bg-neo-card px-3 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none"
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
      <div className="overflow-x-auto rounded-3xl border border-neo-border bg-neo-surface">
        <table className="min-w-[720px] divide-y divide-neo-border text-sm">
          <thead className="bg-neo-card text-left text-xs uppercase tracking-wide text-neo-text-secondary">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Seleccionar todos los términos visibles"
                  checked={allSelected && !!items.length}
                  onChange={() => onToggleAll()}
                  disabled={selectionDisabled}
                  className="h-4 w-4 rounded border-neo-border bg-transparent"
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
          <tbody className="divide-y divide-neo-border">
            {items.length ? (
              items.map((item) => (
                <tr key={item.id} className="bg-neo-surface hover:bg-neo-card transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar término ${item.term}`}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => onToggleItem(item.id)}
                      disabled={!canEdit}
                      className="h-4 w-4 rounded border-neo-border bg-transparent"
                    />
                  </td>
                  <td className="px-4 py-3 text-neo-text-secondary">{item.id}</td>
                  <td className="px-4 py-3 font-semibold text-neo-text-primary">{item.translation}</td>
                  <td className="px-4 py-3 text-neo-text-secondary">{item.term}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-neo-card px-2 py-1 text-xs capitalize text-neo-text-secondary">{item.category}</span>
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
                  <div className="flex flex-col items-center gap-3 text-center text-neo-text-secondary">
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

type TermPipelinePanelProps = {
  statusSummary: Record<ReviewStatus, number>;
  categories: Array<{ category: Term["category"]; value: number }>;
};

function TermPipelinePanel({ statusSummary, categories }: TermPipelinePanelProps) {
  const total = Object.values(statusSummary).reduce((sum, value) => sum + value, 0) || 1;
  const statuses: Array<{ key: ReviewStatus; label: string; accent: string }> = [
    { key: "pending", label: "Pendiente", accent: "from-accent-amber/50 to-accent-amber/20" },
    { key: "in_review", label: "En revisión", accent: "from-accent-secondary/50 to-accent-secondary/20" },
    { key: "approved", label: "Publicado", accent: "from-accent-emerald/50 to-accent-emerald/20" },
    { key: "rejected", label: "Rechazado", accent: "from-accent-danger/50 to-accent-danger/20" },
  ];

  const topCategories = categories.slice(0, 4);

  return (
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Pipeline editorial</p>
          <h2 className="text-lg font-semibold">Salud del catálogo</h2>
        </div>
        <span className="text-xs text-neo-text-secondary">{total} registros</span>
      </header>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {statuses.map((status) => {
            const count = statusSummary[status.key] || 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={status.key}>
                <div className="flex items-center justify-between text-xs text-neo-text-secondary">
                  <span>{status.label}</span>
                  <span>{count}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-neo-card">
                  <div className={`h-full rounded-full bg-gradient-to-r ${status.accent}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-2xl border border-neo-border bg-neo-card p-4">
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Categorías más consultadas</p>
          {topCategories.length ? (
            <ul className="mt-4 space-y-3 text-sm text-neo-text-secondary">
              {topCategories.map((entry) => (
                <li key={entry.category} className="flex items-center justify-between">
                  <span className="capitalize">{entry.category}</span>
                  <span className="inline-flex items-center rounded-full bg-neo-surface px-2 py-0.5 text-xs text-neo-text-secondary">
                    {entry.value}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-neo-text-secondary">Aún no hay categorías registradas.</p>
          )}
        </div>
      </div>
    </section>
  );
}

type QuickActionsPanelProps = {
  autoRefresh: boolean;
  lastAutoRefresh: string | null;
  lastManualRefresh: string | null;
  lastExportedAt: string | null;
  exporting: boolean;
  analyticsStatus: "idle" | "loading" | "ok" | "error";
  analyticsLabel: string | null;
  onToggleAutoRefresh: () => void;
  onManualRefresh: () => void;
  onExport: () => void;
  onPingAnalytics: () => void;
};

function QuickActionsPanel({
  autoRefresh,
  lastAutoRefresh,
  lastManualRefresh,
  lastExportedAt,
  exporting,
  analyticsStatus,
  analyticsLabel,
  onToggleAutoRefresh,
  onManualRefresh,
  onExport,
  onPingAnalytics,
}: QuickActionsPanelProps) {
  const analyticsBadge =
    analyticsStatus === "ok"
      ? "text-accent-emerald"
      : analyticsStatus === "error"
        ? "text-accent-danger"
        : analyticsStatus === "loading"
          ? "text-accent-secondary"
          : "text-neo-text-secondary";

  return (
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Operaciones rápidas</p>
          <h2 className="text-lg font-semibold">Automatiza y sincroniza</h2>
        </div>
      </header>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-neo-border bg-neo-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Autorefresco</p>
            <button
              type="button"
              aria-pressed={autoRefresh}
              onClick={onToggleAutoRefresh}
              className={`relative h-6 w-12 rounded-full transition ${autoRefresh ? "bg-accent-secondary" : "bg-neo-surface"}`}
            >
              <span
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white transition ${autoRefresh ? "right-1" : "left-1"
                  }`}
              />
            </button>
          </div>
          <p className="mt-3 text-xs text-neo-text-secondary">
            {autoRefresh ? `Pulso cada 30s${lastAutoRefresh ? ` · último a las ${lastAutoRefresh}` : ""}` : "Pulse manual para evitar ruido"}
          </p>
        </article>
        <article className="rounded-2xl border border-neo-border bg-neo-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Sincronizar catálogo</p>
            <Icon library="lucide" name="RefreshCcw" className="h-4 w-4 text-accent-secondary" />
          </div>
          <p className="mt-2 text-xs text-neo-text-secondary">{lastManualRefresh ? `Última manual: ${lastManualRefresh}` : "Sin ejecutar hoy."}</p>
          <button className="btn-ghost mt-3 w-full text-sm" type="button" onClick={onManualRefresh}>
            Forzar refresco
          </button>
        </article>
        <article className="rounded-2xl border border-neo-border bg-neo-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Exportar catálogo</p>
            <Icon library="lucide" name="Download" className="h-4 w-4 text-accent-secondary" />
          </div>
          <p className="mt-2 text-xs text-neo-text-secondary">{lastExportedAt ? `Último export: ${lastExportedAt}` : "Aún sin exportar esta sesión."}</p>
          <button className="btn-primary mt-3 w-full text-sm" type="button" onClick={onExport} disabled={exporting}>
            {exporting ? "Generando..." : "Descargar JSON"}
          </button>
        </article>
        <article className="rounded-2xl border border-neo-border bg-neo-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Validar analytics</p>
            <span className={`text-xs font-semibold ${analyticsBadge}`}>
              {analyticsStatus === "loading" ? "Sincronizando..." : analyticsLabel || "Idle"}
            </span>
          </div>
          <p className="mt-2 text-xs text-neo-text-secondary">Recalcula el resumen para asegurar coherencia.</p>
          <button className="btn-ghost mt-3 w-full text-sm" type="button" onClick={onPingAnalytics}>
            Recalcular
          </button>
        </article>
      </div>
    </section>
  );
}

type OpsTimelinePanelProps = {
  items: Term[];
  notifications: AdminNotification[];
  lastManualRefresh: string | null;
  lastAutoRefresh: string | null;
  lastExportedAt: string | null;
};

function OpsTimelinePanel({ items, notifications, lastManualRefresh, lastAutoRefresh, lastExportedAt }: OpsTimelinePanelProps) {
  const timeline = useMemo(() => {
    const events: Array<{ title: string; detail: string; time: string; tone: "info" | "alert" | "success" }> = [];
    if (lastManualRefresh) {
      events.push({ title: "Sincronización manual", detail: "Forzaste un refresco del catálogo.", time: lastManualRefresh, tone: "success" });
    }
    if (lastAutoRefresh) {
      events.push({ title: "Pulso automático", detail: "El monitor actualizó los datos.", time: lastAutoRefresh, tone: "info" });
    }
    if (lastExportedAt) {
      events.push({ title: "Exportación JSON", detail: "Se generó un respaldo del catálogo.", time: lastExportedAt, tone: "info" });
    }
    items
      .slice(-3)
      .reverse()
      .forEach((term) => {
        events.push({
          title: `Edición · ${term.term || "Sin título"}`,
          detail: `Estado ${term.status} · ${term.translation}`,
          time: `#${term.id}`,
          tone: term.status === "approved" ? "success" : term.status === "rejected" ? "alert" : "info",
        });
      });
    notifications.slice(0, 3).forEach((notif) => {
      events.push({
        title: notif.title,
        detail: notif.detail,
        time: new Date(notif.timestamp).toLocaleTimeString("es-ES"),
        tone: notif.type === "alert" ? "alert" : "info",
      });
    });
    return events.slice(0, 6);
  }, [items, notifications, lastManualRefresh, lastAutoRefresh, lastExportedAt]);

  return (
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Timeline operativo</p>
          <h2 className="text-lg font-semibold">Últimas acciones</h2>
        </div>
      </header>
      <ul className="mt-4 space-y-3">
        {timeline.length ? (
          timeline.map((event, index) => (
            <li key={`${event.title}-${index}`} className="flex items-center gap-3 rounded-2xl border border-neo-border bg-neo-card px-4 py-3">
              <span
                className={`h-2.5 w-2.5 rounded-full ${event.tone === "alert" ? "bg-accent-danger" : event.tone === "success" ? "bg-accent-emerald" : "bg-accent-secondary"
                  }`}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-neo-text-primary">{event.title}</p>
                <p className="text-xs text-neo-text-secondary">{event.detail}</p>
              </div>
              <span className="text-xs text-neo-text-secondary">{event.time}</span>
            </li>
          ))
        ) : (
          <li className="rounded-2xl border border-neo-border bg-neo-card px-4 py-6 text-center text-xs text-neo-text-secondary">Sin eventos recientes.</li>
        )}
      </ul>
    </section>
  );
}

type IntegrationStatus = "ok" | "warning" | "error" | "loading";

type IntegrationsStatusPanelProps = {
  termsStatus: IntegrationStatus;
  analyticsStatus: "idle" | "loading" | "ok" | "error";
  notificationsStatus: IntegrationStatus;
  authStatus: IntegrationStatus;
  lastAnalyticsPing: string | null;
  lastAutoRefresh: string | null;
  allowBootstrap: boolean;
};

function IntegrationsStatusPanel({
  termsStatus,
  analyticsStatus,
  notificationsStatus,
  authStatus,
  lastAnalyticsPing,
  lastAutoRefresh,
  allowBootstrap,
}: IntegrationsStatusPanelProps) {
  const analyticsTone: IntegrationStatus =
    analyticsStatus === "loading" ? "loading" : analyticsStatus === "error" ? "error" : analyticsStatus === "ok" ? "ok" : "warning";

  const cards: Array<{ label: string; detail: string; status: IntegrationStatus; iconName: string; meta?: string }> = [
    { label: "API términos", detail: termsStatus === "ok" ? "Online" : "Sin datos recientes", status: termsStatus, iconName: "BookOpenCheck", meta: lastAutoRefresh || "—" },
    {
      label: "Analytics",
      detail: analyticsStatus === "loading" ? "Sincronizando…" : analyticsStatus === "ok" ? "Coherente" : analyticsStatus === "error" ? "Fallo" : "En espera",
      status: analyticsTone,
      iconName: "Signal",
      meta: lastAnalyticsPing || "—",
    },
    {
      label: "Alertas",
      detail: notificationsStatus === "ok" ? "Monitor activo" : notificationsStatus === "warning" ? "Alertas pendientes" : notificationsStatus === "loading" ? "Cargando" : "Fallo",
      status: notificationsStatus,
      iconName: "Link2",
    },
    {
      label: "Autenticación",
      detail: authStatus === "ok" ? "Sesión válida" : authStatus === "loading" ? "Validando…" : "No autenticado",
      status: authStatus,
      iconName: "ShieldCheck",
      meta: allowBootstrap ? "Bootstrap abierto" : "Bootstrap cerrado",
    },
  ];

  const badgeClass = (status: IntegrationStatus) => {
    switch (status) {
      case "ok":
        return "text-accent-emerald";
      case "warning":
        return "text-accent-amber";
      case "error":
        return "text-accent-danger";
      case "loading":
        return "text-accent-secondary";
      default:
        return "text-neo-text-secondary";
    }
  };

  return (
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header>
        <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Integraciones críticas</p>
        <h2 className="text-lg font-semibold">Salud de servicios</h2>
      </header>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-neo-border bg-neo-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-neo-text-primary">
                <Icon library="lucide" name={card.iconName} className="h-4 w-4 text-accent-secondary" />
                {card.label}
              </div>
              <span className={`text-xs font-semibold ${badgeClass(card.status)}`}>{card.detail}</span>
            </div>
            {card.meta ? <p className="mt-1 text-xs text-neo-text-secondary">{card.meta}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function statusBadgeClass(status: ReviewStatus) {
  switch (status) {
    case "pending":
      return "border border-accent-amber/40 bg-accent-amber/10 text-accent-amber";
    case "in_review":
      return "border border-accent-secondary/40 bg-accent-secondary/10 text-accent-secondary";
    case "approved":
      return "border border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald";
    case "rejected":
      return "border border-accent-danger/40 bg-accent-danger/10 text-accent-danger";
    default:
      return "border border-neo-border bg-neo-surface text-neo-text-secondary";
  }
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
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Gamificación</p>
          <h2 className="text-lg font-semibold text-neo-text-primary">Ranking de contribuidores</h2>
        </div>
        {error ? <span className="text-xs text-accent-danger">{error}</span> : null}
      </header>
      {entries === null ? (
        <p className="mt-4 text-xs text-neo-text-secondary">Calculando aportes…</p>
      ) : entries.length ? (
        <ul className="mt-4 space-y-3">
          {entries.map((entry, index) => (
            <li key={entry.id} className="flex items-center justify-between rounded-2xl border border-neo-border bg-neo-card px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-neo-text-primary">
                  #{index + 1} {entry.username || entry.displayName || entry.id}
                </p>
                {entry.email ? <p className="text-xs text-neo-text-secondary">{entry.email}</p> : null}
              </div>
              <span className="text-xs font-semibold text-neo-text-secondary">{entry.points} pts</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-xs text-neo-text-secondary">Aún no hay contribuciones registradas.</p>
      )}
    </section>
  );
}

export default function AdminPage() {
  return <AdminConsole initialView="overview" />;
}

type EditorSheetProps = {
  term: Term;
  onCancel: () => void;
  onSave: (term: Term) => void;
};

function EditorSheet({ term, onCancel, onSave }: EditorSheetProps) {
  const [val, setVal] = useState(term);
  const baseFieldClasses =
    "mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-4 py-2 text-neo-text-primary shadow-inner focus:border-accent-secondary focus:outline-none placeholder-neo-text-secondary";

  useEffect(() => {
    setVal(term);
  }, [term]);

  const requiredFilled = Boolean(val.term.trim() && val.translation.trim() && val.meaning.trim() && val.what.trim() && val.how.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--admin-backdrop)] px-4 py-6 backdrop-blur-sm">
      <section className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-neo-border bg-neo-card p-6 shadow-glow-card">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">{val.id ? "Editar término" : "Nuevo término"}</p>
            <h2 className="text-2xl font-semibold">{val.term || "Término sin título"}</h2>
          </div>
          <button className="btn-ghost" type="button" onClick={onCancel}>
            Cerrar
          </button>
        </header>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-neo-text-secondary">
            Término
            <input
              className={baseFieldClasses}
              required
              value={val.term}
              onChange={(event) => setVal({ ...val, term: event.target.value })}
            />
          </label>
          <label className="text-sm text-neo-text-secondary">
            Traducción
            <input
              className={baseFieldClasses}
              required
              value={val.translation}
              onChange={(event) => setVal({ ...val, translation: event.target.value })}
            />
          </label>
          <label className="text-sm text-neo-text-secondary">
            Categoría
            <select
              className={`${baseFieldClasses} bg-neo-surface`}
              value={val.category}
              onChange={(event) => setVal({ ...val, category: event.target.value as Term["category"] })}
            >
              {CATS.map((category) => (
                <option key={category} value={category} className="bg-neo-card text-neo-text-primary">
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-neo-text-secondary">
            Estado
            <select
              className={`${baseFieldClasses} bg-neo-surface`}
              value={val.status}
              onChange={(event) => setVal({ ...val, status: event.target.value as ReviewStatus })}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status} className="bg-neo-card text-neo-text-primary">
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-neo-text-secondary">
            Significado
            <textarea
              className={`${baseFieldClasses} min-h-[96px] resize-none`}
              rows={2}
              required
              value={val.meaning}
              onChange={(event) => setVal({ ...val, meaning: event.target.value })}
            />
          </label>
          <label className="text-sm text-neo-text-secondary">
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
        <label className="mt-4 block text-sm text-neo-text-secondary">
          Cómo se usa
          <textarea
            className={`${baseFieldClasses} min-h-[160px] bg-neo-surface font-mono text-sm`}
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
    <label className="text-sm text-neo-text-secondary">
      {label}
      <div className="mt-1 flex flex-wrap gap-2 rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 shadow-inner">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-2 rounded-full bg-neo-bg px-3 py-1 text-xs text-neo-text-primary">
            {value}
            <button type="button" aria-label={`Eliminar ${value}`} onClick={() => removeChip(value)} className="text-neo-text-secondary hover:text-neo-text-primary">
              ✕
            </button>
          </span>
        ))}
        <input
          className="flex-1 bg-transparent text-sm text-neo-text-primary placeholder-neo-text-secondary focus:outline-none"
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
        <p className="text-sm text-neo-text-secondary">Ejemplos interactivos</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir ejemplo
        </button>
      </div>
      {list.length ? (
        <div className="space-y-4">
          {list.map((example, index) => (
            <div key={`${example.title}-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neo-text-primary">Bloque #{index + 1}</p>
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
                <label className="text-xs uppercase tracking-wide text-neo-text-secondary">
                  Título
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary shadow-inner focus:border-accent-secondary focus:outline-none"
                    value={example.title}
                    onChange={(event) => update(index, { title: event.target.value })}
                  />
                </label>
                <label className="text-xs uppercase tracking-wide text-neo-text-secondary">
                  Nota
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary shadow-inner focus:border-accent-secondary focus:outline-none"
                    value={example.note || ""}
                    onChange={(event) => update(index, { note: event.target.value })}
                  />
                </label>
              </div>
              <label className="mt-3 block text-xs uppercase tracking-wide text-neo-text-secondary">
                Código
                <textarea
                  className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 font-mono text-xs text-neo-text-primary shadow-inner focus:border-accent-secondary focus:outline-none"
                  rows={4}
                  value={example.code}
                  onChange={(event) => update(index, { code: event.target.value })}
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-neo-border px-4 py-6 text-center text-sm text-neo-text-secondary">Sin ejemplos.</p>
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
        <p className="text-sm text-neo-text-secondary">Variantes por lenguaje</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir variante
        </button>
      </div>
      {list.length ? (
        <div className="space-y-3">
          {list.map((variant, index) => (
            <div key={`variant-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Variante #{index + 1}</p>
                <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                  Eliminar
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-xs text-neo-text-secondary">
                  Lenguaje
                  <select
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
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
                <label className="text-xs text-neo-text-secondary">
                  Nivel
                  <select
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
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
                <label className="text-xs text-neo-text-secondary">
                  Estado
                  <select
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
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
              <label className="mt-3 block text-xs text-neo-text-secondary">
                Snippet
                <textarea
                  className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 font-mono text-xs text-neo-text-primary focus:outline-none"
                  rows={3}
                  value={variant.snippet}
                  onChange={(event) => update(index, { snippet: event.target.value })}
                />
              </label>
              <label className="mt-3 block text-xs text-neo-text-secondary">
                Notas
                <input
                  className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                  value={variant.notes || ""}
                  onChange={(event) => update(index, { notes: event.target.value })}
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-neo-border px-4 py-6 text-center text-sm text-neo-text-secondary">Sin variantes aún.</p>
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
        <p className="text-sm text-neo-text-secondary">Casos de uso</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir caso
        </button>
      </div>
      {list.length ? (
        <div className="space-y-3">
          {list.map((useCase, index) => (
            <div key={`usecase-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Caso #{index + 1}</p>
                <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                  Eliminar
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-xs text-neo-text-secondary">
                  Contexto
                  <select
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
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
                <label className="text-xs text-neo-text-secondary">
                  Estado
                  <select
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
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
                <label className="text-xs text-neo-text-secondary">
                  Tips
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    value={useCase.tips || ""}
                    onChange={(event) => update(index, { tips: event.target.value })}
                  />
                </label>
              </div>
              <label className="mt-3 block text-xs text-neo-text-secondary">
                Resumen
                <textarea
                  className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                  rows={3}
                  value={useCase.summary}
                  onChange={(event) => update(index, { summary: event.target.value })}
                />
              </label>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neo-text-secondary">Pasos</p>
                  <button className="btn-ghost" type="button" onClick={() => addStep(index)}>
                    + Paso
                  </button>
                </div>
                {(useCase.steps || []).map((step, stepIndex) => (
                  <div key={`step-${stepIndex}`} className="grid gap-2 md:grid-cols-2">
                    <label className="text-xs text-neo-text-secondary">
                      ES
                      <input
                        className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                        value={step.es || ""}
                        onChange={(event) => updateStep(index, stepIndex, { es: event.target.value })}
                      />
                    </label>
                    <div className="flex gap-2">
                      <label className="flex-1 text-xs text-neo-text-secondary">
                        EN
                        <input
                          className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
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
        <p className="rounded-2xl border border-dashed border-neo-border px-4 py-6 text-center text-sm text-neo-text-secondary">Sin casos de uso todavía.</p>
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
        <p className="text-sm text-neo-text-secondary">FAQs</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir FAQ
        </button>
      </div>
      {list.length ? (
        <div className="space-y-3">
          {list.map((faq, index) => (
            <div key={`faq-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-neo-text-secondary">FAQ #{index + 1}</p>
                <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                  Eliminar
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-neo-text-secondary">
                  Pregunta (ES)
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    value={faq.questionEs}
                    onChange={(event) => update(index, { questionEs: event.target.value })}
                  />
                </label>
                <label className="text-xs text-neo-text-secondary">
                  Pregunta (EN)
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    value={faq.questionEn || ""}
                    onChange={(event) => update(index, { questionEn: event.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-neo-text-secondary">
                  Respuesta (ES)
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    rows={3}
                    value={faq.answerEs}
                    onChange={(event) => update(index, { answerEs: event.target.value })}
                  />
                </label>
                <label className="text-xs text-neo-text-secondary">
                  Respuesta (EN)
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    rows={3}
                    value={faq.answerEn || ""}
                    onChange={(event) => update(index, { answerEn: event.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <label className="text-xs text-neo-text-secondary">
                  Snippet
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    value={faq.snippet || ""}
                    onChange={(event) => update(index, { snippet: event.target.value })}
                  />
                </label>
                <label className="text-xs text-neo-text-secondary">
                  Categoría
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    value={faq.category || ""}
                    onChange={(event) => update(index, { category: event.target.value })}
                  />
                </label>
                <label className="text-xs text-neo-text-secondary">
                  Estado
                  <select
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
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
              <label className="mt-3 block text-xs text-neo-text-secondary">
                Cómo explicarlo
                <textarea
                  className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                  rows={2}
                  value={faq.howToExplain || ""}
                  onChange={(event) => update(index, { howToExplain: event.target.value })}
                />
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-neo-border px-4 py-6 text-center text-sm text-neo-text-secondary">Sin FAQs.</p>
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
        <p className="text-sm text-neo-text-secondary">Ejercicios</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir ejercicio
        </button>
      </div>
      {list.length ? (
        <div className="space-y-3">
          {list.map((exercise, index) => (
            <div key={`exercise-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Ejercicio #{index + 1}</p>
                <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                  Eliminar
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-neo-text-secondary">
                  Título (ES)
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    value={exercise.titleEs}
                    onChange={(event) => update(index, { titleEs: event.target.value })}
                  />
                </label>
                <label className="text-xs text-neo-text-secondary">
                  Título (EN)
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    value={exercise.titleEn || ""}
                    onChange={(event) => update(index, { titleEn: event.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-neo-text-secondary">
                  Prompt (ES)
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    rows={2}
                    value={exercise.promptEs}
                    onChange={(event) => update(index, { promptEs: event.target.value })}
                  />
                </label>
                <label className="text-xs text-neo-text-secondary">
                  Prompt (EN)
                  <textarea
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
                    rows={2}
                    value={exercise.promptEn || ""}
                    onChange={(event) => update(index, { promptEn: event.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-neo-text-secondary">
                  Dificultad
                  <select
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
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
                <label className="text-xs text-neo-text-secondary">
                  Estado
                  <select
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none"
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
        <p className="rounded-2xl border border-dashed border-neo-border px-4 py-6 text-center text-sm text-neo-text-secondary">Sin ejercicios.</p>
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
        <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Soluciones</p>
        <button className="btn-ghost" type="button" onClick={add}>
          + Añadir solución
        </button>
      </div>
      {list.map((solution, index) => (
        <div key={`solution-${index}`} className="rounded-2xl border border-neo-border bg-neo-surface p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs text-neo-text-secondary">
              Lenguaje
              <select
                className="mt-1 rounded-2xl border border-neo-border bg-neo-bg px-2 py-1 text-xs text-neo-text-primary focus:outline-none"
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
          <label className="mt-2 block text-xs text-neo-text-secondary">
            Código
            <textarea
              className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-bg px-3 py-2 font-mono text-xs text-neo-text-primary focus:outline-none"
              rows={3}
              value={solution.code}
              onChange={(event) => update(index, { code: event.target.value })}
            />
          </label>
          <label className="mt-2 block text-xs text-neo-text-secondary">
            Explicación (ES)
            <textarea
              className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-bg px-3 py-2 text-xs text-neo-text-primary focus:outline-none"
              rows={2}
              value={solution.explainEs}
              onChange={(event) => update(index, { explainEs: event.target.value })}
            />
          </label>
          <label className="mt-2 block text-xs text-neo-text-secondary">
            Explicación (EN)
            <textarea
              className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-bg px-3 py-2 text-xs text-neo-text-primary focus:outline-none"
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--admin-backdrop)] px-4 backdrop-blur-sm">
      <section className="w-full max-w-lg space-y-4 rounded-3xl border border-neo-border bg-neo-card p-6 shadow-glow-card" role="dialog" aria-modal="true">
        <header>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Confirmación requerida</p>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </header>
        <p className="text-sm text-neo-text-secondary">{description}</p>
        {preview?.length ? (
          <div className="flex flex-wrap gap-2">
            {preview.slice(0, 3).map((item) => (
              <span key={item} className="rounded-full border border-neo-border bg-neo-surface px-3 py-1 text-xs text-neo-text-secondary">
                {item}
              </span>
            ))}
            {preview.length > 3 && (
              <span className="rounded-full border border-neo-border bg-neo-surface px-3 py-1 text-xs text-neo-text-secondary">
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
