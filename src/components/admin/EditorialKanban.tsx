"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { Icon } from "@/components/Icon";
import type { SessionUser } from "@/hooks/useUser";
import type { ReviewStatus } from "@/types/term";

type KanbanTerm = {
  id: number;
  term: string;
  translation: string;
  category: string;
  status: ReviewStatus;
  exampleCount?: number;
  exerciseCount?: number;
  reviewedById?: number | null;
  tags?: string[];
  aliases?: string[];
};

type Reviewer = {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  email?: string | null;
  role?: string | null;
};

type KanbanColumnState = {
  items: KanbanTerm[];
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
};

type DragState = {
  id: number;
  from: ReviewStatus;
} | null;

type EditorialKanbanProps = {
  canEdit: boolean;
  session: SessionUser | null;
  refreshToken: number;
  onOpenTerm: (id: number) => void;
  onNotify: (message: string) => void;
  onError: (message: string) => void;
  onGlobalRefresh: () => void;
};

const STATUS_ORDER: ReviewStatus[] = ["pending", "in_review", "approved", "rejected"];
const PAGE_SIZE = 10;

const STATUS_META: Record<ReviewStatus, { label: string; accent: string; icon: string; hint: string }> = {
  pending: {
    label: "Pendiente",
    accent: "from-accent-amber/40 to-accent-amber/10",
    icon: "Clock3",
    hint: "Listos para revision",
  },
  in_review: {
    label: "En revision",
    accent: "from-accent-secondary/40 to-accent-secondary/10",
    icon: "SearchCheck",
    hint: "En evaluacion activa",
  },
  approved: {
    label: "Publicado",
    accent: "from-accent-emerald/40 to-accent-emerald/10",
    icon: "BadgeCheck",
    hint: "Listos para publicar",
  },
  rejected: {
    label: "Rechazado",
    accent: "from-accent-danger/40 to-accent-danger/10",
    icon: "ShieldAlert",
    hint: "Necesita ajustes",
  },
};

const buildEmptyColumns = (): Record<ReviewStatus, KanbanColumnState> => ({
  pending: { items: [], total: 0, page: 1, loading: true, error: null },
  in_review: { items: [], total: 0, page: 1, loading: true, error: null },
  approved: { items: [], total: 0, page: 1, loading: true, error: null },
  rejected: { items: [], total: 0, page: 1, loading: true, error: null },
});

const pickErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (typeof (payload as { error?: unknown }).error === "string") return (payload as { error: string }).error;
  if (typeof (payload as { message?: unknown }).message === "string") return (payload as { message: string }).message;
  const errorArray = (payload as { error?: unknown }).error;
  if (Array.isArray(errorArray)) {
    const joined = errorArray.filter((value): value is string => typeof value === "string").join(". ");
    if (joined) return joined;
  }
  return fallback;
};

async function readResponseMessage(res: Response) {
  let payload: unknown = null;
  let textFallback = "";
  try {
    payload = await res.json();
  } catch {
    textFallback = await res.text().catch(() => "");
  }
  return pickErrorMessage(payload, textFallback?.trim() || res.statusText || "Error inesperado");
}

async function fetchTermsByStatus(status: ReviewStatus, page: number, pageSize: number, signal?: AbortSignal) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("sort", "recent");
  params.set("status", status);

  const res = await fetch(`/api/terms?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
    signal,
  });

  let payload: { items?: unknown; meta?: { total?: number } } | null = null;
  try {
    payload = (await res.json()) as { items?: KanbanTerm[]; meta?: { total?: number } };
  } catch {
    payload = null;
  }

  if (!res.ok || (payload as { ok?: boolean } | null)?.ok === false) {
    throw new Error(pickErrorMessage(payload, res.statusText || "No se pudo cargar el tablero"));
  }

  const rawItems = Array.isArray(payload?.items) ? (payload?.items as Record<string, unknown>[]) : [];
  const normalized = rawItems.map((item) => ({
    id: Number(item.id) || 0,
    term: String(item.term || ""),
    translation: String(item.translation || ""),
    category: String(item.category || "general"),
    status: (item.status as ReviewStatus) || status,
    exampleCount:
      typeof item.exampleCount === "number"
        ? item.exampleCount
        : Array.isArray(item.examples)
          ? item.examples.length
          : 0,
    exerciseCount:
      typeof item.exerciseCount === "number"
        ? item.exerciseCount
        : Array.isArray(item.exercises)
          ? item.exercises.length
          : 0,
    reviewedById: typeof item.reviewedById === "number" ? item.reviewedById : null,
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    aliases: Array.isArray(item.aliases) ? (item.aliases as string[]) : [],
  }));

  return {
    items: normalized.filter((item) => item.id > 0),
    total: typeof payload?.meta?.total === "number" ? payload?.meta?.total : normalized.length,
  };
}

async function fetchReviewers(signal?: AbortSignal) {
  const res = await fetch("/api/admin/reviewers", { cache: "no-store", credentials: "include", signal });
  let payload: { items?: Reviewer[] } | null = null;
  try {
    payload = (await res.json()) as { items?: Reviewer[] };
  } catch {
    payload = null;
  }
  if (!res.ok || (payload as { ok?: boolean } | null)?.ok === false) {
    throw new Error(pickErrorMessage(payload, res.statusText || "No se pudo cargar revisores"));
  }
  return Array.isArray(payload?.items) ? payload?.items : [];
}

async function updateTerm(termId: number, patch: Partial<KanbanTerm>) {
  const res = await fetch(`/api/terms/${termId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const message = await readResponseMessage(res);
    throw new Error(message);
  }
  return res;
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

export default function EditorialKanban({
  canEdit,
  session,
  refreshToken,
  onOpenTerm,
  onNotify,
  onError,
  onGlobalRefresh,
}: EditorialKanbanProps) {
  const [columns, setColumns] = useState<Record<ReviewStatus, KanbanColumnState>>(buildEmptyColumns);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [reviewersLoading, setReviewersLoading] = useState(false);
  const [reviewersError, setReviewersError] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState>(null);
  const [dragOver, setDragOver] = useState<ReviewStatus | null>(null);
  const [busyIds, setBusyIds] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const columnsRef = useRef(columns);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  const reviewerById = useMemo(() => {
    const map = new Map<number, Reviewer>();
    reviewers.forEach((reviewer) => {
      map.set(reviewer.id, reviewer);
    });
    return map;
  }, [reviewers]);

  const markBusy = useCallback((id: number, value: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const loadColumn = useCallback(
    async (status: ReviewStatus, page = 1, append = false, signal?: AbortSignal) => {
      setColumns((prev) => ({
        ...prev,
        [status]: { ...prev[status], loading: true, error: null },
      }));

      try {
        const { items, total } = await fetchTermsByStatus(status, page, PAGE_SIZE, signal);
        if (signal?.aborted) return;
        setColumns((prev) => ({
          ...prev,
          [status]: {
            ...prev[status],
            items: append ? [...prev[status].items, ...items] : items,
            total,
            page,
            loading: false,
            error: null,
          },
        }));
      } catch (error) {
        if (signal?.aborted) return;
        setColumns((prev) => ({
          ...prev,
          [status]: {
            ...prev[status],
            loading: false,
            error: (error as Error)?.message || "No se pudo cargar la columna",
          },
        }));
      }
    },
    [],
  );

  const reloadAll = useCallback(
    async (signal?: AbortSignal) => {
      setRefreshing(true);
      await Promise.all(STATUS_ORDER.map((status) => loadColumn(status, 1, false, signal)));
      if (!signal?.aborted) setRefreshing(false);
    },
    [loadColumn],
  );

  useEffect(() => {
    const controller = new AbortController();
    void reloadAll(controller.signal);
    return () => controller.abort();
  }, [reloadAll, refreshToken]);

  useEffect(() => {
    if (!canEdit) return undefined;
    const controller = new AbortController();
    setReviewersLoading(true);
    setReviewersError(null);
    fetchReviewers(controller.signal)
      .then((items) => {
        if (controller.signal.aborted) return;
        setReviewers(items);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setReviewersError((error as Error)?.message || "No se pudo cargar revisores");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setReviewersLoading(false);
      });
    return () => controller.abort();
  }, [canEdit]);

  const updateColumns = useCallback((updater: (snapshot: Record<ReviewStatus, KanbanColumnState>) => Record<ReviewStatus, KanbanColumnState>) => {
    const snapshot = columnsRef.current;
    const next = updater(snapshot);
    setColumns(next);
    return snapshot;
  }, []);

  const findTerm = useCallback((termId: number) => {
    const current = columnsRef.current;
    for (const status of STATUS_ORDER) {
      const term = current[status].items.find((item) => item.id === termId);
      if (term) return { term, status };
    }
    return null;
  }, []);

  const handleAssign = useCallback(
    async (termId: number, reviewerId: number | null) => {
      const found = findTerm(termId);
      if (!found) return;
      if (!canEdit) return;
      if (busyIds.has(termId)) return;
      markBusy(termId, true);
      const snapshot = updateColumns((prev) => {
        const next = { ...prev };
        const column = next[found.status];
        next[found.status] = {
          ...column,
          items: column.items.map((item) =>
            item.id === termId ? { ...item, reviewedById: reviewerId } : item,
          ),
        };
        return next;
      });

      try {
        await updateTerm(termId, { reviewedById: reviewerId });
        onNotify("Asignacion actualizada");
        onGlobalRefresh();
      } catch (error) {
        setColumns(snapshot);
        onError((error as Error)?.message || "No se pudo actualizar la asignacion");
      } finally {
        markBusy(termId, false);
      }
    },
    [busyIds, canEdit, findTerm, markBusy, onError, onGlobalRefresh, onNotify, updateColumns],
  );

  const applyStatusChange = useCallback(
    async (termId: number, nextStatus: ReviewStatus, originStatus?: ReviewStatus) => {
      const found = originStatus ? { term: columnsRef.current[originStatus].items.find((item) => item.id === termId), status: originStatus } : findTerm(termId);
      if (!found?.term) return;
      if (!canEdit) return;
      if (busyIds.has(termId)) return;
      const fromStatus = found.status;
      if (fromStatus === nextStatus) return;
      const term = found.term;
      markBusy(termId, true);

      const reviewerFallback = session?.id ?? null;
      let nextReviewerId: number | null = term.reviewedById ?? null;
      if (nextStatus === "pending") {
        nextReviewerId = null;
      } else if (nextStatus === "in_review" && !nextReviewerId) {
        nextReviewerId = reviewerFallback;
      } else if ((nextStatus === "approved" || nextStatus === "rejected") && reviewerFallback) {
        nextReviewerId = reviewerFallback;
      }

      const snapshot = updateColumns((prev) => {
        const next = { ...prev };
        const fromColumn = next[fromStatus];
        const toColumn = next[nextStatus];
        const filtered = fromColumn.items.filter((item) => item.id !== termId);
        next[fromStatus] = {
          ...fromColumn,
          items: filtered,
          total: Math.max(0, fromColumn.total - 1),
        };
        next[nextStatus] = {
          ...toColumn,
          items: [{ ...term, status: nextStatus, reviewedById: nextReviewerId }, ...toColumn.items],
          total: toColumn.total + 1,
        };
        return next;
      });

      const patch: Partial<KanbanTerm> = { status: nextStatus };
      if (nextStatus === "pending") {
        patch.reviewedById = null;
      } else if (nextStatus === "in_review" && term.reviewedById) {
        patch.reviewedById = term.reviewedById;
      }

      try {
        await updateTerm(termId, patch);
        onNotify(`Estado actualizado a ${STATUS_META[nextStatus].label.toLowerCase()}`);
        onGlobalRefresh();
      } catch (error) {
        setColumns(snapshot);
        onError((error as Error)?.message || "No se pudo actualizar el estado");
      } finally {
        markBusy(termId, false);
      }
    },
    [busyIds, canEdit, findTerm, markBusy, onError, onGlobalRefresh, onNotify, updateColumns, session?.id],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, targetStatus: ReviewStatus) => {
      event.preventDefault();
      setDragOver(null);
      if (!dragging) return;
      if (dragging.from === targetStatus) return;
      void applyStatusChange(dragging.id, targetStatus, dragging.from);
      setDragging(null);
    },
    [applyStatusChange, dragging],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>, status: ReviewStatus) => {
    event.preventDefault();
    if (dragOver !== status) setDragOver(status);
  }, [dragOver]);

  const handleDragLeave = useCallback((status: ReviewStatus) => {
    if (dragOver === status) setDragOver(null);
  }, [dragOver]);

  const handleRefresh = useCallback(() => {
    onGlobalRefresh();
  }, [onGlobalRefresh]);

  const handleLoadMore = useCallback(
    (status: ReviewStatus) => {
      const column = columnsRef.current[status];
      if (column.loading) return;
      if (column.items.length >= column.total) return;
      void loadColumn(status, column.page + 1, true);
    },
    [loadColumn],
  );

  const renderAssignee = (term: KanbanTerm, isBusy: boolean) => {
    if (!canEdit) {
      const reviewer = term.reviewedById ? reviewerById.get(term.reviewedById) : null;
      return (
        <div className="text-xs text-neo-text-secondary">
          {reviewer ? `Asignado a ${reviewer.displayName}` : "Sin asignar"}
        </div>
      );
    }

    if (reviewersLoading) {
      return <div className="text-xs text-neo-text-secondary">Cargando equipo...</div>;
    }

    if (reviewersError) {
      return <div className="text-xs text-accent-danger">{reviewersError}</div>;
    }

    return (
      <select
        className="w-full rounded-xl border border-neo-border bg-neo-surface px-2 py-1 text-xs text-neo-text-primary focus:border-accent-secondary focus:outline-none"
        value={term.reviewedById ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          const parsed = value ? Number(value) : null;
          if (value && Number.isNaN(parsed)) return;
          void handleAssign(term.id, parsed);
        }}
        disabled={isBusy}
      >
        <option value="">Sin asignar</option>
        {reviewers.map((reviewer) => (
          <option key={reviewer.id} value={reviewer.id}>
            {reviewer.displayName}
            {reviewer.username && reviewer.username !== reviewer.displayName ? ` (@${reviewer.username})` : ""}
          </option>
        ))}
      </select>
    );
  };

  return (
    <section className="rounded-3xl border border-neo-border bg-neo-surface p-6 shadow-glow-card">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Kanban editorial</p>
          <h2 className="text-lg font-semibold">Flujo de revision en vivo</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-neo-text-secondary">
          <span>{refreshing ? "Sincronizando..." : "Arrastra y suelta para cambiar estado"}</span>
          <button className="btn-ghost" type="button" onClick={handleRefresh} disabled={refreshing}>
            <Icon library="lucide" name="RefreshCw" className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STATUS_ORDER.map((status) => {
          const column = columns[status];
          const meta = STATUS_META[status];
          const remaining = Math.max(0, column.total - column.items.length);
          return (
            <div
              key={status}
              className={`rounded-2xl border border-neo-border bg-neo-card p-4 transition ${
                dragOver === status ? "ring-2 ring-accent-secondary/50" : ""
              }`}
              onDragOver={(event) => handleDragOver(event, status)}
              onDragLeave={() => handleDragLeave(status)}
              onDrop={(event) => handleDrop(event, status)}
            >
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.accent}`}>
                    <Icon library="lucide" name={meta.icon} className="h-4 w-4 text-neo-text-primary" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{meta.label}</p>
                    <p className="text-xs text-neo-text-secondary">{meta.hint}</p>
                  </div>
                </div>
                <span className="text-xs text-neo-text-secondary">{column.total}</span>
              </header>

              <div className="mt-4 space-y-3">
                {column.loading && !column.items.length ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="h-24 rounded-xl border border-neo-border bg-neo-surface animate-pulse" />
                    ))}
                  </div>
                ) : column.error ? (
                  <div className="rounded-xl border border-neo-border bg-neo-surface p-3 text-xs text-accent-danger">
                    {column.error}
                  </div>
                ) : column.items.length ? (
                  column.items.map((term) => {
                    const isBusy = busyIds.has(term.id);
                    const reviewer = term.reviewedById ? reviewerById.get(term.reviewedById) : null;
                    return (
                      <article
                        key={term.id}
                        className={`rounded-xl border border-neo-border bg-neo-surface p-3 shadow-sm transition ${
                          dragging?.id === term.id ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-neo-text-primary">
                              {term.translation || term.term}
                            </p>
                            <p className="truncate text-xs text-neo-text-secondary">{term.term}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(term.status)}`}>
                              {STATUS_META[term.status]?.label || term.status}
                            </span>
                            <span
                              draggable={canEdit && !isBusy}
                              onDragStart={(event) => {
                                if (!canEdit || isBusy) return;
                                setDragging({ id: term.id, from: status });
                                event.dataTransfer.effectAllowed = "move";
                                event.dataTransfer.setData("text/plain", String(term.id));
                              }}
                              onDragEnd={() => {
                                setDragging(null);
                                setDragOver(null);
                              }}
                              className={`rounded-lg border border-neo-border bg-neo-card p-1 ${
                                canEdit && !isBusy ? "cursor-grab" : "cursor-not-allowed opacity-60"
                              }`}
                              aria-label="Arrastrar"
                            >
                              <Icon library="lucide" name="GripVertical" className="h-3.5 w-3.5 text-neo-text-secondary" />
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neo-text-secondary">
                          <span className="rounded-full bg-neo-card px-2 py-0.5 capitalize">{term.category}</span>
                          <span className="rounded-full bg-neo-card px-2 py-0.5">Ejemplos: {term.exampleCount ?? 0}</span>
                          <span className="rounded-full bg-neo-card px-2 py-0.5">Ejercicios: {term.exerciseCount ?? 0}</span>
                          {reviewer ? (
                            <span className="rounded-full bg-neo-card px-2 py-0.5">Asignado: {reviewer.displayName}</span>
                          ) : null}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            className="btn-ghost text-xs"
                            type="button"
                            onClick={() => onOpenTerm(term.id)}
                          >
                            Abrir
                          </button>
                          {status !== "in_review" && (
                            <button
                              className="btn-ghost text-xs"
                              type="button"
                              onClick={() => applyStatusChange(term.id, "in_review", status)}
                              disabled={!canEdit || isBusy}
                            >
                              Revisar
                            </button>
                          )}
                          {status !== "approved" && (
                            <button
                              className="btn-ghost text-xs"
                              type="button"
                              onClick={() => applyStatusChange(term.id, "approved", status)}
                              disabled={!canEdit || isBusy}
                            >
                              Aprobar
                            </button>
                          )}
                          {status !== "rejected" && (
                            <button
                              className="btn-ghost text-xs"
                              type="button"
                              onClick={() => applyStatusChange(term.id, "rejected", status)}
                              disabled={!canEdit || isBusy}
                            >
                              Rechazar
                            </button>
                          )}
                          {status !== "pending" && (
                            <button
                              className="btn-ghost text-xs"
                              type="button"
                              onClick={() => applyStatusChange(term.id, "pending", status)}
                              disabled={!canEdit || isBusy}
                            >
                              Reabrir
                            </button>
                          )}
                          {canEdit && session?.id && !term.reviewedById && status === "pending" ? (
                            <button
                              className="btn-primary text-xs"
                              type="button"
                              onClick={() => handleAssign(term.id, session.id)}
                              disabled={isBusy}
                            >
                              Asignarme
                            </button>
                          ) : null}
                        </div>

                        <div className="mt-3 space-y-1">
                          <p className="text-[10px] uppercase tracking-wide text-neo-text-secondary">Asignacion</p>
                          {renderAssignee(term, isBusy)}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-neo-border bg-neo-surface p-3 text-xs text-neo-text-secondary">
                    Sin tarjetas en esta columna.
                  </div>
                )}
              </div>

              {column.items.length > 0 && remaining > 0 ? (
                <button
                  className="btn-ghost mt-3 w-full text-xs"
                  type="button"
                  onClick={() => handleLoadMore(status)}
                  disabled={column.loading}
                >
                  {column.loading ? "Cargando..." : `Cargar mas (${remaining})`}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
