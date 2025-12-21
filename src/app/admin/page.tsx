"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminDashboard from "@/components/admin/Dashboard";
import EditorialKanban from "@/components/admin/EditorialKanban";
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
  exerciseCount?: number;
  exampleCount?: number;
};

type SessionUser = {
  id: number;
  username: string;
  role: "admin" | "user";
  email?: string | null;
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
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
const QUALITY_SECTIONS = [
  { key: "examples", label: "Ejemplos" },
  { key: "exercises", label: "Ejercicios" },
  { key: "variants", label: "Variantes" },
  { key: "faqs", label: "FAQs" },
] as const;

type QualitySectionKey = (typeof QUALITY_SECTIONS)[number]["key"];

type QualityScore = {
  score: number;
  missing: string[];
  counts: Record<QualitySectionKey, number>;
};

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
  meta?: TermsMeta;
};

type TermsMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type AdminSummary = {
  totalTerms: number;
  exampleCount: number;
  exerciseCount: number;
  statusCounts: Record<ReviewStatus, number>;
  categoryCounts: Array<{ category: Term["category"]; value: number }>;
  recentTerms: Array<{ id: number; term: string; translation: string; status: ReviewStatus }>;
  scope?: "all" | "approved";
};

type SummaryResponse = {
  ok?: boolean;
  summary?: AdminSummary;
  error?: string;
};

type MissingTerm = {
  query: string;
  attempts: number;
  lastSeen?: string | null;
};

type MissingTermsResponse = {
  ok?: boolean;
  items?: MissingTerm[];
  error?: string;
};

type UsageTerm = {
  id: number;
  term: string;
  translation: string;
  category: Term["category"];
  views: number;
  favorites: number;
  copies: number;
  total: number;
};

type UsageHeatmap = {
  days: string[];
  hours: number[];
  matrix: number[][];
  max: number;
  windowDays: number;
};

type UsageTotals = {
  views: number;
  favorites: number;
  copies: number;
};

type UsageResponse = {
  ok?: boolean;
  terms?: UsageTerm[];
  heatmap?: UsageHeatmap;
  totals?: UsageTotals;
  error?: string;
};

type FetchTermsInput = {
  query: string;
  page: number;
  pageSize: number;
  status: ReviewStatus | "all";
  signal?: AbortSignal;
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

function computeQualityScore(term: Term): QualityScore {
  const counts: Record<QualitySectionKey, number> = {
    examples: term.exampleCount ?? term.examples?.length ?? 0,
    exercises: term.exerciseCount ?? term.exercises?.length ?? 0,
    variants: term.variants?.length ?? 0,
    faqs: term.faqs?.length ?? 0,
  };
  const missing = QUALITY_SECTIONS.filter((section) => counts[section.key] <= 0).map((section) => section.label);
  const completed = QUALITY_SECTIONS.length - missing.length;
  const score = Math.round((completed / QUALITY_SECTIONS.length) * 100);
  return { score, missing, counts };
}

function qualityBadgeClass(score: number) {
  if (score >= 100) {
    return "border border-accent-emerald/40 bg-accent-emerald/10 text-accent-emerald";
  }
  if (score >= 75) {
    return "border border-accent-secondary/40 bg-accent-secondary/10 text-accent-secondary";
  }
  if (score >= 50) {
    return "border border-accent-amber/40 bg-accent-amber/10 text-accent-amber";
  }
  return "border border-accent-danger/40 bg-accent-danger/10 text-accent-danger";
}

type AdminConsoleProps = {
  initialView?: AdminView;
};

export function AdminConsole({ initialView = "overview" }: AdminConsoleProps) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [items, setItems] = useState<Term[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [termsMeta, setTermsMeta] = useState<TermsMeta | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [missingTerms, setMissingTerms] = useState<MissingTerm[]>([]);
  const [missingLoading, setMissingLoading] = useState(false);
  const [missingError, setMissingError] = useState<string | null>(null);
  const [usageTerms, setUsageTerms] = useState<UsageTerm[]>([]);
  const [usageHeatmap, setUsageHeatmap] = useState<UsageHeatmap | null>(null);
  const [usageTotals, setUsageTotals] = useState<UsageTotals | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Term | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [allowBootstrap, setAllowBootstrap] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);
  const { notifications, alertCount, refresh: refreshNotifications, loading: notificationsLoading } = useNotifications();

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

  const fallbackStatusSummary = useMemo(
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

  const statusSummary = summary?.statusCounts ?? fallbackStatusSummary;
  const totalTerms = summary?.totalTerms ?? termsMeta?.total ?? items.length;
  const categoriesCount = summary?.categoryCounts?.length ?? new Set(items.map((item) => item.category)).size;
  const exampleCount =
    summary?.exampleCount ?? items.reduce((sum, item) => sum + (item.exampleCount ?? item.examples?.length ?? 0), 0);
  const pendingCount = (statusSummary.pending || 0) + (statusSummary.in_review || 0);

  const canEdit = session?.role === "admin";
  const selectedCount = selectedIds.length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const selectionDisabled = !items.length || !canEdit;
  const today = new Date().toLocaleDateString("es-ES");
  const panelLoading = authLoading || itemsLoading || summaryLoading;
  const termsStatus: IntegrationStatus = itemsLoading || summaryLoading ? "loading" : totalTerms ? "ok" : "warning";
  const panelError = authError || summaryError;

  const adminHeroStats = useMemo(
    () => [
      { label: "Términos visibles", value: totalTerms },
      { label: "Categorías activas", value: categoriesCount },
      { label: "Snippets guardados", value: exampleCount },
      { label: "Pendientes", value: pendingCount },
    ],
    [totalTerms, categoriesCount, exampleCount, pendingCount],
  );

  const categoryHighlights = useMemo(() => {
    if (summary?.categoryCounts?.length) {
      return [...summary.categoryCounts].sort((a, b) => b.value - a.value);
    }
    const buckets = new Map<Term["category"], number>();
    items.forEach((item) => {
      buckets.set(item.category, (buckets.get(item.category) || 0) + 1);
    });
    return [...buckets.entries()]
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  }, [items, summary?.categoryCounts]);

  const recentTerms = useMemo(() => {
    if (summary?.recentTerms?.length) return summary.recentTerms;
    return items.slice(0, 3).map((item) => ({
      id: item.id,
      term: item.term,
      translation: item.translation,
      status: item.status,
    }));
  }, [items, summary?.recentTerms]);

  const fetchTerms = useCallback(async ({ query, page, pageSize, status, signal }: FetchTermsInput) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("sort", "recent");
    if (query) params.set("q", query);
    if (status !== "all") params.set("status", status);
    const url = `/api/terms?${params.toString()}`;
    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include",
      headers: { "cache-control": "no-store" },
      signal,
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
      exerciseCount: typeof (item as { exerciseCount?: unknown })?.exerciseCount === "number" ? (item as { exerciseCount: number }).exerciseCount : undefined,
      exampleCount: typeof (item as { exampleCount?: unknown })?.exampleCount === "number" ? (item as { exampleCount: number }).exampleCount : undefined,
    }));
    const meta = isRecord(data?.meta) ? (data?.meta as TermsMeta) : null;
    return { items: normalized, meta };
  }, []);

  const loadTerms = useCallback(
    async (input: FetchTermsInput) => {
      setItemsLoading(true);
      setItemsError(null);
      try {
        const fetched = await fetchTerms(input);
        if (input.signal?.aborted) return;
        setItems(fetched.items);
        if (fetched.meta) {
          setTermsMeta(fetched.meta);
          if (input.page > fetched.meta.totalPages && fetched.meta.totalPages > 0) {
            setPage(fetched.meta.totalPages);
          }
        } else {
          setTermsMeta(null);
        }
      } catch (error) {
        if ((error as Error)?.name === "AbortError") return;
        console.error("No se pudieron cargar los términos", error);
        setItems([]);
        setTermsMeta(null);
        setItemsError((error as Error)?.message || "No se pudieron cargar los términos");
      } finally {
        if (input.signal?.aborted) return;
        setItemsLoading(false);
      }
    },
    [fetchTerms],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadTerms({ query: q, page, pageSize, status: statusFilter, signal: controller.signal });
    return () => {
      controller.abort();
    };
  }, [loadTerms, q, page, pageSize, refreshIndex, statusFilter]);

  const loadSummary = useCallback(async (signal?: AbortSignal) => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/admin/summary", { cache: "no-store", credentials: "include", signal });
      let payload: SummaryResponse | null = null;
      let textFallback = "";
      try {
        payload = (await res.json()) as SummaryResponse;
      } catch {
        textFallback = await res.text().catch(() => "");
      }
      if (!res.ok || payload?.ok === false) {
        const message = extractErrorMessage(payload) || (textFallback?.trim() || res.statusText || "Error cargando resumen");
        throw new Error(message);
      }
      setSummary(payload?.summary ?? null);
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return;
      console.error("No se pudo cargar el resumen", error);
      setSummary(null);
      setSummaryError((error as Error)?.message || "No se pudo cargar el resumen");
    } finally {
      if (signal?.aborted) return;
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadSummary(controller.signal);
    return () => {
      controller.abort();
    };
  }, [loadSummary, refreshIndex]);

  const loadMissingTerms = useCallback(async (signal?: AbortSignal) => {
    setMissingLoading(true);
    setMissingError(null);
    try {
      const res = await fetch("/api/admin/missing-terms?limit=8", {
        cache: "no-store",
        credentials: "include",
        signal,
      });
      let payload: MissingTermsResponse | null = null;
      let textFallback = "";
      try {
        payload = (await res.json()) as MissingTermsResponse;
      } catch {
        textFallback = await res.text().catch(() => "");
      }
      if (!res.ok || payload?.ok === false) {
        const message = extractErrorMessage(payload) || (textFallback?.trim() || res.statusText || "Error cargando radar");
        throw new Error(message);
      }
      setMissingTerms(Array.isArray(payload?.items) ? payload.items : []);
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return;
      console.error("No se pudo cargar el radar de términos faltantes", error);
      setMissingTerms([]);
      setMissingError((error as Error)?.message || "No se pudo cargar el radar");
    } finally {
      if (signal?.aborted) return;
      setMissingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canEdit) {
      setMissingTerms([]);
      setMissingError(null);
      setMissingLoading(false);
      return;
    }
    const controller = new AbortController();
    loadMissingTerms(controller.signal);
    return () => {
      controller.abort();
    };
  }, [canEdit, loadMissingTerms, refreshIndex, analyticsRefreshKey]);

  const loadUsage = useCallback(async (signal?: AbortSignal) => {
    setUsageLoading(true);
    setUsageError(null);
    try {
      const res = await fetch("/api/admin/usage?days=30&limit=12", {
        cache: "no-store",
        credentials: "include",
        signal,
      });
      let payload: UsageResponse | null = null;
      let textFallback = "";
      try {
        payload = (await res.json()) as UsageResponse;
      } catch {
        textFallback = await res.text().catch(() => "");
      }
      if (!res.ok || payload?.ok === false) {
        const message = extractErrorMessage(payload) || (textFallback?.trim() || res.statusText || "Error cargando uso real");
        throw new Error(message);
      }
      setUsageTerms(Array.isArray(payload?.terms) ? payload.terms : []);
      setUsageHeatmap(payload?.heatmap ?? null);
      setUsageTotals(payload?.totals ?? null);
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return;
      console.error("No se pudo cargar el uso real", error);
      setUsageTerms([]);
      setUsageHeatmap(null);
      setUsageTotals(null);
      setUsageError((error as Error)?.message || "No se pudo cargar el uso real");
    } finally {
      if (signal?.aborted) return;
      setUsageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!canEdit) {
      setUsageTerms([]);
      setUsageHeatmap(null);
      setUsageTotals(null);
      setUsageLoading(false);
      setUsageError(null);
      return;
    }
    const controller = new AbortController();
    loadUsage(controller.signal);
    return () => {
      controller.abort();
    };
  }, [canEdit, loadUsage, refreshIndex]);

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

  const handleSearchChange = useCallback((value: string) => {
    setQ(value);
    setPage(1);
  }, []);

  const handleStatusFilterChange = useCallback((value: ReviewStatus | "all") => {
    setStatusFilter(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((value: number) => {
    setPage(value);
  }, []);

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setPage(1);
  }, []);

  const handleMissingRefresh = useCallback(() => {
    if (!canEdit) return;
    void loadMissingTerms();
  }, [canEdit, loadMissingTerms]);

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

  const handleCreateFromQuery = useCallback(
    (query: string) => {
      const normalized = query.trim();
      if (!normalized) return;
      handleViewChange("terms");
      setEditing({ ...empty, term: normalized });
    },
    [empty, handleViewChange],
  );

  const loadTermDetail = useCallback(
    async (id: number) => {
      setEditing(null);
      setDetailLoading(true);
      setAuthError(null);
      try {
        const res = await fetch(`/api/terms/${id}`, { cache: "no-store", credentials: "include" });
        let payload: unknown = null;
        try {
          payload = await res.json();
        } catch {
          // ignore parse
        }
        if (!res.ok || !payload || typeof payload !== "object" || !("item" in (payload as Record<string, unknown>))) {
          throw new Error((payload as { error?: string })?.error || res.statusText || "No se pudo cargar el término");
        }
        const item = (payload as { item: Term }).item;
        setEditing(item);
        setMessage("Término listo para edición");
      } catch (error) {
        console.error("No se pudo cargar el detalle del término", error);
        setAuthError((error as Error)?.message || "No se pudo cargar el término");
      } finally {
        setDetailLoading(false);
      }
    },
    [],
  );

  const handleEditTerm = useCallback(
    (id: number) => {
      handleViewChange("terms");
      loadTermDetail(id);
    },
    [handleViewChange, loadTermDetail],
  );

  const handleManualRefresh = useCallback(() => {
    scheduleRefresh();
    setLastManualRefresh(new Date().toLocaleTimeString("es-ES"));
  }, [scheduleRefresh]);

  const exportCatalog = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const snapshot: Term[] = [];
      const exportPageSize = 50;
      let currentPage = 1;
      let totalPages = 1;
      do {
        const { items: batch, meta } = await fetchTerms({
          query: "",
          page: currentPage,
          pageSize: exportPageSize,
          status: "all",
        });
        snapshot.push(...batch);
        totalPages = meta?.totalPages ?? currentPage;
        currentPage += 1;
      } while (currentPage <= totalPages);

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
      setAnalyticsRefreshKey((prev) => prev + 1);
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

  async function logout() {
    await fetch("/api/auth", { method: "DELETE", credentials: "include" });
    setSession(null);
    setMessage("Sesión cerrada");
    await refreshSession();
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
      await loadTerms({ query: q, page, pageSize, status: statusFilter });
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
      await loadTerms({ query: q, page, pageSize, status: statusFilter });
    } catch (error) {
      console.error("No se pudo sincronizar los términos tras guardar", error);
    }
    scheduleRefresh();
  }

  return (
    <div className="min-w-0 space-y-8 text-neo-text-primary">
      {panelLoading && (
        <div className="flex items-center gap-3 rounded-3xl border border-neo-primary/40 bg-neo-surface px-4 py-3 text-sm">
          <Icon library="lucide" name="Loader2" className="h-5 w-5 animate-spin text-neo-primary" />
          <div className="min-w-0 flex flex-col">
            <span className="font-semibold text-neo-text-primary">Sincronizando panel</span>
            <span className="text-xs text-neo-text-secondary">
              {authLoading
                ? "Validando sesión y permisos..."
                : summaryLoading
                  ? "Cargando métricas globales..."
                  : "Cargando catálogo y métricas..."}
            </span>
          </div>
        </div>
      )}
      {detailLoading && (
        <div className="flex items-center gap-3 rounded-3xl border border-neo-border bg-neo-surface px-4 py-3 text-sm">
          <Icon library="lucide" name="FileSignature" className="h-4 w-4 text-neo-primary" />
          <div className="min-w-0 flex flex-col">
            <span className="font-semibold text-neo-text-primary">Cargando detalle del término…</span>
            <span className="text-xs text-neo-text-secondary">Prepara la edición segura sin bloquear la tabla.</span>
          </div>
        </div>
      )}

      <section className="relative min-w-0 overflow-hidden rounded-4xl border border-neo-border bg-neo-card p-5 sm:p-8 shadow-glow-card">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-linear-to-l from-neo-primary/10 to-transparent blur-3xl lg:block" />
        <div className="flex flex-wrap items-center gap-4">
          <div className="shrink-0 rounded-3xl border border-neo-border bg-neo-surface p-3 shadow-glow-card">
            <Icon library="lucide" name="BookOpenCheck" className="h-7 w-7 text-neo-text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">Panel de control</p>
            <h1 className="text-2xl font-semibold sm:text-3xl">Diccionario Dev · Admin</h1>
          </div>
        </div>
        <p className="mt-4 w-full text-sm text-neo-text-secondary">
          Controla el glosario técnico, detecta huecos y administra accesos en un solo flujo operacional.
        </p>
        {session && (!session.bio || !session.avatarUrl || session.displayName === session.username) ? (
          <div className="mt-4 flex flex-wrap items-start gap-3 rounded-2xl border border-amber-400/60 bg-amber-500/10 p-3">
            <div className="rounded-xl bg-white/40 p-2">
              <Icon library="lucide" name="Sparkles" className="h-4 w-4 text-amber-700" />
            </div>
            <div className="flex-1 min-w-[200px]">
              <p className="text-sm font-semibold text-amber-900">Completa tu perfil</p>
              <p className="text-xs text-amber-900/80">Agrega bio y foto para personalizar tu sesión y mantener tus datos únicos.</p>
            </div>
            <a
              href="/admin/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-amber-500 bg-white px-3 py-2 text-xs font-semibold text-amber-900 shadow-sm hover:bg-amber-50"
            >
              <Icon library="lucide" name="Edit" className="h-4 w-4" />
              Actualizar perfil
            </a>
          </div>
        ) : null}
        <dl className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminHeroStats.map((stat) => {
            const iconName = HERO_STAT_ICONS[stat.label] || "ActivitySquare";
            return (
              <div key={stat.label} className="flex flex-col gap-3 rounded-3xl border border-neo-border bg-neo-surface p-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-neo-card">
                  <Icon library="lucide" name={iconName} className="h-5 w-5 text-neo-primary" />
                </div>
                <dt className="text-xs uppercase tracking-wide text-neo-text-secondary">{stat.label}</dt>
                <dd className="text-2xl font-semibold text-neo-text-primary sm:text-3xl">{stat.value}</dd>
              </div>
            );
          })}
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          {canEdit ? (
            <>
              <button className="btn-primary" type="button" onClick={handleCreateTerm}>
                <Icon library="lucide" name="Plus" className="h-4 w-4 mr-2" />
                Nuevo término
              </button>
              <button className="btn-ghost" type="button" onClick={() => handleViewChange("terms")}>
                <Icon library="lucide" name="List" className="h-4 w-4 mr-2" />
                Revisar catálogo
              </button>
            </>
          ) : (
            <div className="rounded-lg border border-neo-border bg-neo-surface px-4 py-2 text-sm text-neo-text-secondary">
              <Icon library="lucide" name="Lock" className="h-4 w-4 inline mr-2" />
              Inicia sesión como admin para gestionar términos
            </div>
          )}
          <button className="btn-ghost" type="button" onClick={refreshSession}>
            <Icon library="lucide" name="RefreshCw" className="h-4 w-4 mr-2" />
            Revalidar sesión
          </button>
        </div>
        <p className="mt-4 text-xs text-neo-text-secondary">Última sincronización: {today}</p>
      </section>

      <ViewSwitcher
        activeView={activeView}
        onChange={handleViewChange}
        itemsCount={totalTerms}
        pendingCount={pendingCount}
        session={session}
        allowBootstrap={allowBootstrap}
      />

      <ToastStack
        error={panelError}
        message={message}
        onClearError={() => {
          setAuthError(null);
          setSummaryError(null);
        }}
        onClearMessage={() => setMessage(null)}
      />

      {activeView === "overview" ? (
        <div className="space-y-6">
          <AdminDashboard refreshToken={analyticsRefreshKey} />
          <TermPipelinePanel statusSummary={statusSummary} categories={categoryHighlights} />
          <QualityScorePanel
            items={items}
            loading={itemsLoading}
            error={itemsError}
            canEdit={canEdit}
            onOpenTerm={handleEditTerm}
          />
          <UsageInsightsPanel
            terms={usageTerms}
            heatmap={usageHeatmap}
            totals={usageTotals}
            loading={usageLoading}
            error={usageError}
            canEdit={canEdit}
            onOpenTerm={handleEditTerm}
          />
          <EditorialKanban
            canEdit={canEdit}
            session={session}
            refreshToken={refreshIndex}
            onOpenTerm={handleEditTerm}
            onNotify={(text) => setMessage(text)}
            onError={(text) => setAuthError(text)}
            onGlobalRefresh={scheduleRefresh}
          />
          <MissingTermsPanel
            items={missingTerms}
            loading={missingLoading}
            error={missingError}
            canEdit={canEdit}
            onCreateFromQuery={handleCreateFromQuery}
            onRefresh={handleMissingRefresh}
          />
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
            recentTerms={recentTerms}
            notifications={notifications}
            lastManualRefresh={lastManualRefresh}
            lastAutoRefresh={lastAutoRefresh}
            lastExportedAt={lastExportedAt}
          />
          <IntegrationsStatusPanel
            termsStatus={termsStatus}
            analyticsStatus={analyticsPulse}
            notificationsStatus={notificationsLoading ? "loading" : alertCount ? "warning" : "ok"}
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
            items={items}
            selectedIds={selectedIds}
            allSelected={allSelected}
            selectionDisabled={selectionDisabled}
            canEdit={canEdit}
            search={q}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            onToggleItem={toggleItemSelection}
            onToggleAll={toggleSelectAll}
            onEdit={handleEditTerm}
            onDelete={handleDeleteClick}
            onCreate={handleCreateTerm}
            autoRefreshEnabled={autoRefresh}
            lastAutoRefreshTime={lastAutoRefresh}
            loading={itemsLoading}
            error={itemsError}
            onRetry={handleManualRefresh}
            page={page}
            pageSize={pageSize}
            total={termsMeta?.total ?? items.length}
            totalPages={termsMeta?.totalPages ?? 1}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
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
            alertCount={alertCount}
            alertsSyncing={notificationsLoading}
            onSyncAlerts={refreshNotifications}
          />

          {/* Enlace a la página de autenticación dedicada */}
          {!session && (
            <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-accent-secondary/40 bg-accent-secondary/10 p-3">
                  <Icon library="lucide" name="ShieldCheck" className="h-8 w-8 text-accent-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neo-text-primary">Gestión de autenticación</h3>
                  <p className="text-sm text-neo-text-secondary">
                    Inicia sesión o crea una cuenta desde la página dedicada de autenticación.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <a href="/admin/access" className="btn-primary">
                  Ir a Autenticación
                </a>
              </div>
            </section>
          )}

          <div className="grid gap-6 lg:grid-cols-1">
            <LeaderboardPanel />
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
	          <h2 className="text-lg font-semibold">
	            {session ? (
	              <span className="inline-flex items-center gap-2">
	                Hola {session.displayName || session.username}
	                <span className="inline-flex h-2 w-2 rounded-full bg-accent-emerald"></span>
	              </span>
	            ) : (
	              "Gestiona los accesos"
	            )}
	          </h2>
        </div>
	        <span
	          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${authLoading ? "bg-neo-surface text-neo-text-secondary" : session ? "bg-accent-emerald/20 text-accent-emerald" : "bg-accent-danger/20 text-accent-danger"
	            }`}
	        >
	          {session && <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald"></span>}
	          {authLoading ? "Validando…" : session ? "En línea" : "Sin sesión"}
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
    team: session ? `Activo: ${session.displayName || session.username}` : allowBootstrap ? "Bootstrap abierto" : "Requiere sesión",
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
              ? "border-accent-secondary/60 bg-linear-to-br from-accent-secondary/20 via-neo-surface to-neo-surface shadow-lg shadow-accent-secondary/30"
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
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  autoRefreshEnabled: boolean;
  lastAutoRefreshTime: string | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (value: number) => void;
  onPageSizeChange: (value: number) => void;
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
  loading,
  error,
  onRetry,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: TermsTableProps) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const canPrev = page > 1;
  const canNext = page < safeTotalPages;
  return (
    <section className="min-w-0 space-y-6 rounded-3xl border border-neo-border bg-neo-surface p-4 shadow-glow-card sm:p-6" aria-busy={loading}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Catálogo</p>
          <h2 className="text-xl font-semibold sm:text-2xl">Términos técnicos</h2>
          <p className="text-sm text-neo-text-secondary">Controla y sincroniza el glosario completo en tiempo real.</p>
          <p className="text-xs text-neo-text-secondary">
            {total ? `${total} términos indexados` : "Sin términos registrados"}
          </p>
          <p className="text-xs text-neo-text-secondary">
            {autoRefreshEnabled ? (
              <span className="text-accent-secondary" suppressHydrationWarning>
                Autorefresco cada 30s{lastAutoRefreshTime ? ` · último a las ${lastAutoRefreshTime}` : ""}
              </span>
            ) : (
              "Autorefresco inactivo"
            )}
          </p>
        </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
        <label className="w-full text-sm text-neo-text-secondary sm:flex-1 sm:min-w-56 lg:min-w-64 xl:min-w-80">
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
          <label className="shrink-0 text-sm text-neo-text-secondary sm:min-w-40">
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
          <button className="btn-primary shrink-0" type="button" onClick={onCreate} disabled={!canEdit}>
            Crear término
          </button>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`mobile-skeleton-${index}`} className="animate-pulse rounded-2xl border border-neo-border bg-neo-card p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-4 w-4 rounded border border-neo-border bg-neo-surface" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-2/3 rounded bg-neo-surface" />
                  <div className="h-3 w-1/2 rounded bg-neo-surface" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-neo-surface" />
                    <div className="h-6 w-20 rounded-full bg-neo-surface" />
                    <div className="h-6 w-24 rounded-full bg-neo-surface" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-9 rounded-xl bg-neo-surface" />
                    <div className="h-9 rounded-xl bg-neo-surface" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="rounded-2xl border border-accent-danger/40 bg-accent-danger/10 p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full border border-accent-danger/40 bg-accent-danger/10 p-4">
                <Icon library="lucide" name="AlertCircle" className="h-8 w-8 text-accent-danger" />
              </div>
              <div className="flex flex-col gap-2">
                <strong className="text-lg font-semibold text-neo-text-primary">Error cargando términos</strong>
                <span className="text-sm text-neo-text-secondary">{error}</span>
              </div>
              <button className="btn-primary inline-flex items-center gap-2" type="button" onClick={onRetry}>
                <Icon library="lucide" name="RefreshCw" className="h-4 w-4" />
                Reintentar
              </button>
            </div>
          </div>
        ) : items.length ? (
          items.map((item) => {
            const exercisesCount = item.exerciseCount ?? item.exercises?.length ?? 0;
            const quality = computeQualityScore(item);
            return (
              <div key={item.id} className="rounded-2xl border border-neo-border bg-neo-card p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Seleccionar término ${item.term}`}
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onToggleItem(item.id)}
                    disabled={!canEdit}
                    className="mt-1 h-4 w-4 rounded border-neo-border bg-transparent"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neo-text-primary line-clamp-2">{item.translation || item.term}</p>
                        <p className="mt-1 text-xs text-neo-text-secondary line-clamp-1">{item.term}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-neo-surface px-2 py-1 text-neo-text-secondary">#{item.id}</span>
                      <span className="rounded-full bg-neo-surface px-2 py-1 capitalize text-neo-text-secondary">{item.category}</span>
                      {exercisesCount > 0 ? (
                        <span className="rounded-full bg-accent-secondary/10 px-2 py-1 font-medium text-accent-secondary">
                          {exercisesCount} ejer.
                        </span>
                      ) : (
                        <span className="rounded-full bg-neo-surface px-2 py-1 text-neo-text-secondary">Sin ejercicios</span>
                      )}
                      <span className={`rounded-full px-2 py-1 font-semibold ${qualityBadgeClass(quality.score)}`}>
                        {quality.score}%
                      </span>
                    </div>
                    <p className={`mt-2 text-xs ${quality.missing.length ? "text-neo-text-secondary" : "text-accent-emerald"}`}>
                      {quality.missing.length ? `Falta: ${quality.missing.join(", ")}` : "Completo"}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button className="btn-ghost w-full" type="button" onClick={() => onEdit(item.id)} disabled={!canEdit}>
                        Editar
                      </button>
                      <button className="btn-ghost w-full" type="button" onClick={() => onDelete(item.id)} disabled={!canEdit}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-neo-border bg-neo-card p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-full border border-neo-border bg-neo-surface p-4">
                <Icon library="lucide" name="Inbox" className="h-8 w-8 text-neo-text-secondary" />
              </div>
              <div className="flex flex-col gap-2">
                <strong className="text-lg font-semibold text-neo-text-primary">Sin resultados</strong>
                <span className="text-sm text-neo-text-secondary">Crea un término nuevo o ajusta la búsqueda para ver registros.</span>
              </div>
              <button className="btn-primary inline-flex items-center gap-2" type="button" onClick={onCreate} disabled={!canEdit}>
                <Icon library="lucide" name="Plus" className="h-4 w-4" />
                Crear término
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop / Tablet table */}
      <div className="hidden overflow-hidden rounded-3xl border border-neo-border bg-neo-surface md:block">
        <table className="w-full table-fixed divide-y divide-neo-border text-sm">
          <thead className="bg-neo-card text-left text-xs uppercase tracking-wide text-neo-text-secondary">
            <tr>
              <th className="w-10 px-2 py-3 lg:px-4">
                <input
                  type="checkbox"
                  aria-label="Seleccionar todos los términos visibles"
                  checked={allSelected && !!items.length}
                  onChange={() => onToggleAll()}
                  disabled={selectionDisabled}
                  className="h-4 w-4 rounded border-neo-border bg-transparent"
                />
              </th>
              <th className="hidden w-16 px-2 py-3 xl:table-cell lg:px-4">#</th>
              <th className="px-2 py-3 lg:px-4">Traducción</th>
              <th className="hidden px-2 py-3 2xl:table-cell lg:px-4">Término</th>
              <th className="hidden w-20 px-2 py-3 xl:table-cell lg:px-4">Ejer.</th>
              <th className="w-20 px-2 py-3 lg:w-24 lg:px-4">Calidad</th>
              <th className="w-20 px-2 py-3 lg:w-24 lg:px-4">Estado</th>
              <th className="hidden w-24 px-2 py-3 2xl:table-cell lg:px-4">Categoría</th>
              <th className="w-24 px-2 py-3 lg:w-24 xl:w-28 2xl:w-40 lg:px-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neo-border">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-2 py-3 lg:px-4">
                    <div className="h-4 w-4 rounded border border-neo-border bg-neo-card" />
                  </td>
                  <td className="hidden px-2 py-3 xl:table-cell lg:px-4">
                    <div className="h-4 w-12 rounded bg-neo-card" />
                  </td>
                  <td className="px-2 py-3 lg:px-4">
                    <div className="h-4 w-full rounded bg-neo-card" />
                  </td>
                  <td className="hidden px-2 py-3 2xl:table-cell lg:px-4">
                    <div className="h-4 w-full rounded bg-neo-card" />
                  </td>
                  <td className="hidden px-2 py-3 xl:table-cell lg:px-4">
                    <div className="h-4 w-8 rounded bg-neo-card" />
                  </td>
                  <td className="px-2 py-3 lg:px-4">
                    <div className="h-5 w-12 rounded-full bg-neo-card" />
                  </td>
                  <td className="px-2 py-3 lg:px-4">
                    <div className="h-5 w-16 rounded-full bg-neo-card" />
                  </td>
                  <td className="hidden px-2 py-3 2xl:table-cell lg:px-4">
                    <div className="h-5 w-16 rounded-full bg-neo-card" />
                  </td>
                  <td className="px-2 py-3 lg:px-4">
                    <div className="flex gap-1">
                      <div className="h-7 w-12 rounded bg-neo-card lg:w-16" />
                      <div className="h-7 w-12 rounded bg-neo-card lg:w-16" />
                    </div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={9} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="rounded-full border border-accent-danger/40 bg-accent-danger/10 p-4">
                      <Icon library="lucide" name="AlertCircle" className="h-8 w-8 text-accent-danger" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <strong className="text-lg font-semibold text-neo-text-primary">Error cargando términos</strong>
                      <span className="text-sm text-neo-text-secondary break-word">{error}</span>
                    </div>
                    <button className="btn-primary inline-flex items-center gap-2" type="button" onClick={onRetry}>
                      <Icon library="lucide" name="RefreshCw" className="h-4 w-4" />
                      Reintentar
                    </button>
                  </div>
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => {
                const quality = computeQualityScore(item);
                return (
                <tr key={item.id} className="bg-neo-surface hover:bg-neo-card transition-colors">
                  <td className="px-2 py-3 lg:px-4">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar término ${item.term}`}
                      checked={selectedIds.includes(item.id)}
                      onChange={() => onToggleItem(item.id)}
                      disabled={!canEdit}
                      className="h-4 w-4 rounded border-neo-border bg-transparent"
                    />
                  </td>
                  <td className="hidden px-2 py-3 text-neo-text-secondary xl:table-cell lg:px-4">{item.id}</td>
                  <td className="px-2 py-3 lg:px-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-neo-text-primary">{item.translation}</p>
                      <p className="truncate text-xs text-neo-text-secondary 2xl:hidden">{item.term}</p>
                    </div>
                  </td>
                  <td className="hidden px-2 py-3 2xl:table-cell lg:px-4">
                    <span className="truncate text-neo-text-secondary">{item.term}</span>
                  </td>
                  <td className="hidden px-2 py-3 xl:table-cell lg:px-4">
                    {item.exerciseCount && item.exerciseCount > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-accent-secondary/10 px-2 py-1 text-xs font-medium text-accent-secondary">
                        {item.exerciseCount}
                      </span>
                    ) : item.exercises && item.exercises.length > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-accent-secondary/10 px-2 py-1 text-xs font-medium text-accent-secondary">
                        {item.exercises.length}
                      </span>
                    ) : (
                      <span className="text-xs text-neo-text-secondary">-</span>
                    )}
                  </td>
                  <td className="px-2 py-3 lg:px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className={`inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold lg:px-2 lg:py-1 lg:text-xs ${qualityBadgeClass(quality.score)}`}>
                        {quality.score}%
                      </span>
                      <span className={`hidden text-[10px] lg:block ${quality.missing.length ? "text-neo-text-secondary" : "text-accent-emerald"}`}>
                        {quality.missing.length ? "Incompleto" : "OK"}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3 lg:px-4">
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold lg:px-2 lg:py-1 lg:text-xs ${statusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="hidden px-2 py-3 2xl:table-cell lg:px-4">
                    <span className="truncate rounded-full bg-neo-card px-2 py-1 text-xs capitalize text-neo-text-secondary">{item.category}</span>
                  </td>
                  <td className="px-2 py-3 lg:px-4">
                    <div className="flex flex-col gap-1 xl:flex-row xl:items-center">
                      <button className="btn-ghost btn-ghost-compact" type="button" onClick={() => onEdit(item.id)} disabled={!canEdit}>
                        <span className="hidden 2xl:inline">Editar</span>
                        <Icon library="lucide" name="Pencil" className="h-3.5 w-3.5 2xl:hidden" />
                      </button>
                      <button className="btn-ghost btn-ghost-compact" type="button" onClick={() => onDelete(item.id)} disabled={!canEdit}>
                        <span className="hidden 2xl:inline">Eliminar</span>
                        <Icon library="lucide" name="Trash2" className="h-3.5 w-3.5 2xl:hidden" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="rounded-full border border-neo-border bg-neo-card p-4">
                      <Icon library="lucide" name="Inbox" className="h-8 w-8 text-neo-text-secondary" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <strong className="text-lg font-semibold text-neo-text-primary">Sin resultados</strong>
                      <span className="text-sm text-neo-text-secondary">Crea un término nuevo o ajusta la búsqueda para ver registros.</span>
                    </div>
                    <button className="btn-primary inline-flex items-center gap-2" type="button" onClick={onCreate} disabled={!canEdit}>
                      <Icon library="lucide" name="Plus" className="h-4 w-4" />
                      Crear término
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neo-border bg-neo-card px-4 py-3 text-xs text-neo-text-secondary">
        <span>
          Página {page} de {safeTotalPages}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="btn-ghost"
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
          >
            Anterior
          </button>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
          >
            Siguiente
          </button>
          <label className="flex items-center gap-2 text-xs text-neo-text-secondary">
            <span>Tamaño</span>
            <select
              className="rounded-xl border border-neo-border bg-neo-surface px-2 py-1 text-xs text-neo-text-primary focus:border-accent-secondary focus:outline-none"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {[10, 25, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
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
                  <div className={`h-full rounded-full bg-linear-to-r ${status.accent}`} style={{ width: `${pct}%` }} />
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

type QualityScorePanelProps = {
  items: Term[];
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  onOpenTerm: (id: number) => void;
};

function QualityScorePanel({ items, loading, error, canEdit, onOpenTerm }: QualityScorePanelProps) {
  const scored = useMemo(
    () => items.map((term) => ({ term, ...computeQualityScore(term) })),
    [items],
  );

  const averageScore = useMemo(() => {
    if (!scored.length) return 0;
    const total = scored.reduce((sum, entry) => sum + entry.score, 0);
    return Math.round(total / scored.length);
  }, [scored]);

  const improveNow = useMemo(
    () =>
      scored
        .filter((entry) => entry.missing.length > 0)
        .sort((a, b) => {
          if (a.score !== b.score) return a.score - b.score;
          if (a.missing.length !== b.missing.length) return b.missing.length - a.missing.length;
          return a.term.term.localeCompare(b.term.term);
        })
        .slice(0, 6),
    [scored],
  );

  const completeCount = scored.filter((entry) => entry.score === 100).length;

  return (
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Calidad editorial</p>
          <h2 className="text-lg font-semibold">Mejorar ahora</h2>
          <p className="text-xs text-neo-text-secondary">
            Completitud por termino basada en ejemplos, ejercicios, variantes y FAQs segun filtros activos.
          </p>
        </div>
        <span className="text-xs text-neo-text-secondary">
          {items.length ? `${items.length} terminos visibles` : "Sin datos"}
        </span>
      </header>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-neo-text-secondary">
        <span className="rounded-full bg-neo-card px-2 py-1">Promedio {averageScore}%</span>
        <span className="rounded-full bg-neo-card px-2 py-1">Completos {completeCount}</span>
        <span className="rounded-full bg-neo-card px-2 py-1">Por mejorar {improveNow.length}</span>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`quality-skeleton-${index}`} className="h-24 rounded-2xl border border-neo-border bg-neo-card animate-pulse" />
          ))
        ) : error ? (
          <div className="rounded-2xl border border-accent-danger/40 bg-accent-danger/10 p-4 text-xs text-accent-danger">
            {error}
          </div>
        ) : improveNow.length ? (
          improveNow.map((entry) => (
            <article key={entry.term.id} className="rounded-2xl border border-neo-border bg-neo-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neo-text-primary">
                    {entry.term.translation || entry.term.term}
                  </p>
                  <p className="text-xs text-neo-text-secondary">{entry.term.term}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${qualityBadgeClass(entry.score)}`}>
                  {entry.score}%
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-neo-text-secondary">
                <span className="rounded-full bg-neo-surface px-2 py-0.5">Ejemplos {entry.counts.examples}</span>
                <span className="rounded-full bg-neo-surface px-2 py-0.5">Ejercicios {entry.counts.exercises}</span>
                <span className="rounded-full bg-neo-surface px-2 py-0.5">Variantes {entry.counts.variants}</span>
                <span className="rounded-full bg-neo-surface px-2 py-0.5">FAQs {entry.counts.faqs}</span>
              </div>
              <p className="mt-2 text-xs text-neo-text-secondary">Falta: {entry.missing.join(", ")}</p>
              <div className="mt-3 flex gap-2">
                <button
                  className="btn-ghost text-xs"
                  type="button"
                  onClick={() => onOpenTerm(entry.term.id)}
                  disabled={!canEdit}
                >
                  Abrir
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-neo-border bg-neo-card p-4 text-xs text-neo-text-secondary">
            Todo el catalogo cumple con la completitud minima.
          </div>
        )}
      </div>
    </section>
  );
}

type UsageInsightsPanelProps = {
  terms: UsageTerm[];
  heatmap: UsageHeatmap | null;
  totals: UsageTotals | null;
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  onOpenTerm: (id: number) => void;
};

function UsageInsightsPanel({
  terms,
  heatmap,
  totals,
  loading,
  error,
  canEdit,
  onOpenTerm,
}: UsageInsightsPanelProps) {
  const safeHeatmap: UsageHeatmap = heatmap ?? {
    days: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"],
    hours: Array.from({ length: 24 }, (_, idx) => idx),
    matrix: Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0)),
    max: 0,
    windowDays: 30,
  };

  const maxValue = safeHeatmap.max || 0;
  const hasHeatmapData = maxValue > 0;

  return (
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Insights de uso real</p>
          <h2 className="text-lg font-semibold">Vistas, favoritos y copias</h2>
          <p className="text-xs text-neo-text-secondary">
            Ventana de {safeHeatmap.windowDays} dias con actividad agregada por hora y dia.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-neo-text-secondary">
          <span className="rounded-full bg-neo-card px-2 py-1">Vistas {totals?.views ?? 0}</span>
          <span className="rounded-full bg-neo-card px-2 py-1">Favoritos {totals?.favorites ?? 0}</span>
          <span className="rounded-full bg-neo-card px-2 py-1">Copias {totals?.copies ?? 0}</span>
        </div>
      </header>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-neo-border bg-neo-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Top terminos por uso</p>
            <span className="text-xs text-neo-text-secondary">{terms.length} items</span>
          </div>
          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`usage-term-skeleton-${index}`} className="h-12 rounded-xl border border-neo-border bg-neo-surface animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="mt-4 rounded-xl border border-accent-danger/40 bg-accent-danger/10 p-3 text-xs text-accent-danger">
              {error}
            </div>
          ) : terms.length ? (
            <div className="mt-4 space-y-3">
              {terms.map((term) => (
                <div key={term.id} className="rounded-xl border border-neo-border bg-neo-surface p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neo-text-primary">
                        {term.translation || term.term}
                      </p>
                      <p className="truncate text-xs text-neo-text-secondary">{term.term}</p>
                    </div>
                    <span className="rounded-full bg-neo-card px-2 py-0.5 text-[11px] text-neo-text-secondary">
                      {term.total}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-neo-text-secondary">
                    <span className="rounded-full bg-neo-card px-2 py-0.5">Vistas {term.views}</span>
                    <span className="rounded-full bg-neo-card px-2 py-0.5">Favoritos {term.favorites}</span>
                    <span className="rounded-full bg-neo-card px-2 py-0.5">Copias {term.copies}</span>
                  </div>
                  <div className="mt-3">
                    <button
                      className="btn-ghost text-xs"
                      type="button"
                      onClick={() => onOpenTerm(term.id)}
                      disabled={!canEdit}
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-neo-border bg-neo-surface p-3 text-xs text-neo-text-secondary">
              Aun no hay actividad registrada.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neo-border bg-neo-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Heatmap hora / dia</p>
            <span className="text-xs text-neo-text-secondary">{hasHeatmapData ? "Actividad detectada" : "Sin actividad"}</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="flex items-center gap-2 text-[10px] text-neo-text-secondary">
                <span className="w-10" />
                <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                  {safeHeatmap.hours.map((hour) => (
                    <span key={`hour-${hour}`} className="text-center">
                      {hour % 6 === 0 ? String(hour).padStart(2, "0") : ""}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2 space-y-2">
                {safeHeatmap.days.map((day, dayIndex) => (
                  <div key={`day-${day}`} className="flex items-center gap-2">
                    <span className="w-10 text-[11px] text-neo-text-secondary">{day}</span>
                    <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
                      {safeHeatmap.hours.map((hour, hourIndex) => {
                        const value = safeHeatmap.matrix?.[dayIndex]?.[hourIndex] ?? 0;
                        const intensity = maxValue ? value / maxValue : 0;
                        const opacity = value ? 0.2 + intensity * 0.75 : 0.08;
                        return (
                          <span
                            key={`cell-${day}-${hour}`}
                            title={`${day} ${String(hour).padStart(2, "0")}:00 · ${value}`}
                            className="h-4 w-4 rounded-md bg-accent-secondary"
                            style={{ opacity }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-neo-text-secondary">
                <span>0</span>
                <div className="h-2 flex-1 rounded-full bg-neo-surface">
                  <div className="h-2 rounded-full bg-accent-secondary" style={{ width: "100%", opacity: 0.6 }} />
                </div>
                <span>{maxValue}</span>
              </div>
            </div>
          </div>
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
          <p className="mt-3 text-xs text-neo-text-secondary" suppressHydrationWarning>
            {autoRefresh ? `Pulso cada 30s${lastAutoRefresh ? ` · último a las ${lastAutoRefresh}` : ""}` : "Pulse manual para evitar ruido"}
          </p>
        </article>
        <article className="rounded-2xl border border-neo-border bg-neo-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Sincronizar catálogo</p>
            <Icon library="lucide" name="RefreshCcw" className="h-4 w-4 text-accent-secondary" />
          </div>
          <p className="mt-2 text-xs text-neo-text-secondary" suppressHydrationWarning>{lastManualRefresh ? `Última manual: ${lastManualRefresh}` : "Sin ejecutar hoy."}</p>
          <button className="btn-ghost mt-3 w-full text-sm" type="button" onClick={onManualRefresh}>
            Forzar refresco
          </button>
        </article>
        <article className="rounded-2xl border border-neo-border bg-neo-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Exportar catálogo</p>
            <Icon library="lucide" name="Download" className="h-4 w-4 text-accent-secondary" />
          </div>
          <p className="mt-2 text-xs text-neo-text-secondary" suppressHydrationWarning>{lastExportedAt ? `Último export: ${lastExportedAt}` : "Aún sin exportar esta sesión."}</p>
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

type MissingTermsPanelProps = {
  items: MissingTerm[];
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  onCreateFromQuery: (query: string) => void;
  onRefresh: () => void;
};

function MissingTermsPanel({ items, loading, error, canEdit, onCreateFromQuery, onRefresh }: MissingTermsPanelProps) {
  return (
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Radar editorial</p>
          <h2 className="text-lg font-semibold">Términos faltantes</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-neo-text-secondary">
          <span>{items.length ? `${items.length} señales activas` : "Sin señales"}</span>
          <button className="btn-ghost text-xs" type="button" onClick={onRefresh} disabled={!canEdit || loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </header>
      <p className="mt-2 text-sm text-neo-text-secondary">
        Prioriza los términos que la audiencia busca sin encontrar respuesta.
      </p>

      {!canEdit ? (
        <div className="mt-4 rounded-2xl border border-neo-border bg-neo-card px-4 py-4 text-sm text-neo-text-secondary">
          Inicia sesión como admin para ver el radar y crear términos desde las búsquedas fallidas.
        </div>
      ) : loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`missing-skeleton-${index}`} className="flex items-center justify-between rounded-2xl border border-neo-border bg-neo-card px-4 py-3">
              <div className="h-4 w-2/3 rounded bg-neo-surface animate-pulse" />
              <div className="h-8 w-28 rounded-xl bg-neo-surface animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-accent-danger/40 bg-accent-danger/10 px-4 py-4 text-sm text-accent-danger">
          <div className="flex items-center justify-between gap-3">
            <span>{error}</span>
            <button className="btn-ghost text-xs" type="button" onClick={onRefresh}>
              Reintentar
            </button>
          </div>
        </div>
      ) : items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const lastSeen = item.lastSeen ? new Date(item.lastSeen).toLocaleString("es-ES") : "Sin fecha";
            return (
              <li key={item.query} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neo-border bg-neo-card px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neo-text-primary line-clamp-1">{item.query}</p>
                  <p className="text-xs text-neo-text-secondary" suppressHydrationWarning>
                    {item.attempts} intento(s) · Último: {lastSeen}
                  </p>
                </div>
                <button className="btn-primary text-xs" type="button" onClick={() => onCreateFromQuery(item.query)}>
                  Crear término
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl border border-neo-border bg-neo-card px-4 py-4 text-sm text-neo-text-secondary">
          No hay búsquedas sin resultados registradas recientemente.
        </div>
      )}
    </section>
  );
}

type OpsTimelinePanelProps = {
  recentTerms: Array<{ id: number; term: string; translation: string; status: ReviewStatus }>;
  notifications: AdminNotification[];
  lastManualRefresh: string | null;
  lastAutoRefresh: string | null;
  lastExportedAt: string | null;
};

function OpsTimelinePanel({ recentTerms, notifications, lastManualRefresh, lastAutoRefresh, lastExportedAt }: OpsTimelinePanelProps) {
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
    recentTerms.slice(0, 3).forEach((term) => {
      events.push({
        title: `Edición · ${term.term || "Sin título"}`,
        detail: `Estado ${term.status} · ${term.translation || "-"}`,
        time: `#${term.id}`,
        tone: term.status === "approved" ? "success" : term.status === "rejected" ? "alert" : "info",
      });
    });
    const sortedNotifications = [...notifications].sort((a, b) => {
      if (a.type !== b.type) return a.type === "alert" ? -1 : 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    sortedNotifications.slice(0, 3).forEach((notif) => {
      events.push({
        title: notif.title,
        detail: notif.detail,
        time: new Date(notif.timestamp).toLocaleTimeString("es-ES"),
        tone: notif.type === "alert" ? "alert" : "info",
      });
    });
    return events.slice(0, 6);
  }, [recentTerms, notifications, lastManualRefresh, lastAutoRefresh, lastExportedAt]);

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
              <span className="text-xs text-neo-text-secondary" suppressHydrationWarning>{event.time}</span>
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
            {card.meta ? <p className="mt-1 text-xs text-neo-text-secondary" suppressHydrationWarning>{card.meta}</p> : null}
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
    "mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-4 py-2 text-neo-text-primary focus:border-accent-secondary focus:outline-none placeholder-neo-text-secondary";

  useEffect(() => {
    setVal(term);
  }, [term]);

  const exercisesValid = useMemo(() => {
    if (!val.exercises || val.exercises.length === 0) return true;
    return val.exercises.every((ex) => {
      const basicValid = ex.titleEs.trim() && ex.promptEs.trim();
      const solutionsValid =
        ex.solutions &&
        ex.solutions.length > 0 &&
        ex.solutions.every((sol) => sol.code.trim() && sol.explainEs.trim());
      return basicValid && solutionsValid;
    });
  }, [val.exercises]);

  const requiredFilled = Boolean(
    val.term.trim() &&
    val.translation.trim() &&
    val.meaning.trim() &&
    val.what.trim() &&
    val.how.trim() &&
    exercisesValid,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--admin-backdrop) px-4 py-6 backdrop-blur-sm">
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
              className={`${baseFieldClasses} min-h-24 resize-none`}
              rows={2}
              required
              value={val.meaning}
              onChange={(event) => setVal({ ...val, meaning: event.target.value })}
            />
          </label>
          <label className="text-sm text-neo-text-secondary">
            Qué resuelve
            <textarea
              className={`${baseFieldClasses} min-h-24 resize-none`}
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
            className={`${baseFieldClasses} min-h-40 bg-neo-surface font-mono text-sm`}
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
        {!requiredFilled && (
          <p className="mt-3 text-sm text-accent-danger">
            {!exercisesValid
              ? "Revisa los ejercicios: faltan títulos, prompts o soluciones completas."
              : "Completa traducción, término, significado, qué hace y cómo se usa."}
          </p>
        )}
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
      <div className="mt-1 flex flex-wrap gap-2 rounded-2xl border border-neo-border bg-neo-surface px-3 py-2">
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
            <div key={`${example.title}-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4">
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
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:border-accent-secondary focus:outline-none"
                    value={example.title}
                    onChange={(event) => update(index, { title: event.target.value })}
                  />
                </label>
                <label className="text-xs uppercase tracking-wide text-neo-text-secondary">
                  Nota
                  <input
                    className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:border-accent-secondary focus:outline-none"
                    value={example.note || ""}
                    onChange={(event) => update(index, { note: event.target.value })}
                  />
                </label>
              </div>
              <label className="mt-3 block text-xs uppercase tracking-wide text-neo-text-secondary">
                Código
                <textarea
                  className="mt-1 w-full rounded-2xl border border-neo-border bg-neo-surface px-3 py-2 font-mono text-xs text-neo-text-primary focus:border-accent-secondary focus:outline-none"
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
            <div key={`variant-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4">
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
            <div key={`usecase-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4">
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
  value?: TermFaqForm[];
  onChange: (faqs: TermFaqForm[]) => void;
};

function FaqsEditor({ value, onChange }: FaqsEditorProps) {
  const normalize = (items?: TermFaqForm[]) => (Array.isArray(items) ? items : []);
  const [list, setList] = useState<TermFaqForm[]>(normalize(value));
  useEffect(() => setList(normalize(value)), [value]);
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
            <div key={`faq-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4">
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
            <div key={`exercise-${index}`} className="rounded-2xl border border-neo-border bg-neo-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Ejercicio #{index + 1}</p>
                <button className="btn-ghost" type="button" onClick={() => remove(index)}>
                  Eliminar
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs text-neo-text-secondary">
                  Título (ES) <span className="text-accent-danger">*</span>
                  <input
                    className={`mt-1 w-full rounded-2xl border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none ${!exercise.titleEs.trim() ? "border-accent-danger/50" : "border-neo-border"
                      }`}
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
                  Prompt (ES) <span className="text-accent-danger">*</span>
                  <textarea
                    className={`mt-1 w-full rounded-2xl border bg-neo-surface px-3 py-2 text-sm text-neo-text-primary focus:outline-none ${!exercise.promptEs.trim() ? "border-accent-danger/50" : "border-neo-border"
                      }`}
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
            Código <span className="text-accent-danger">*</span>
            <textarea
              className={`mt-1 w-full rounded-2xl border bg-neo-bg px-3 py-2 font-mono text-xs text-neo-text-primary focus:outline-none ${!solution.code.trim() ? "border-accent-danger/50" : "border-neo-border"
                }`}
              rows={3}
              value={solution.code}
              onChange={(event) => update(index, { code: event.target.value })}
            />
          </label>
          <label className="mt-2 block text-xs text-neo-text-secondary">
            Explicación (ES) <span className="text-accent-danger">*</span>
            <textarea
              className={`mt-1 w-full rounded-2xl border bg-neo-bg px-3 py-2 text-xs text-neo-text-primary focus:outline-none ${!solution.explainEs.trim() ? "border-accent-danger/50" : "border-neo-border"
                }`}
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-(--admin-backdrop) px-4 backdrop-blur-sm">
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
