"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type TermExample = { title: string; code: string; note?: string };

type Term = {
  id: number;
  term: string;
  translation: string;
  aliases: string[];
  category: "frontend" | "backend" | "database" | "devops" | "general";
  meaning: string;
  what: string;
  how: string;
  examples: TermExample[];
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

  const empty: Term = useMemo(
    () => ({
      id: 0,
      term: "",
      translation: "",
      aliases: [],
      category: "general",
      meaning: "",
      what: "",
      how: "",
      examples: [],
    }),
    [],
  );

  const categoriesCount = useMemo(() => {
    const categories = new Set(items.map(item => item.category));
    return categories.size;
  }, [items]);

  const exampleCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.examples?.length || 0), 0),
    [items],
  );

  const canEdit = session?.role === "admin";
  const selectedCount = selectedIds.length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const bulkDeleteEnabled = canEdit && selectedCount > 0;
  const selectionDisabled = !items.length || !canEdit;

  const adminHeroStats = [
    { label: "Términos visibles", value: items.length },
    { label: "Categorías activas", value: categoriesCount },
    { label: "Snippets guardados", value: exampleCount },
  ];

  const today = new Date().toLocaleDateString("es-ES");

  useEffect(() => {
    let cancelled = false;
    fetchTerms(q)
      .then((fetched) => {
        if (!cancelled) {
          setItems(fetched);
        }
      })
      .catch((error) => {
        console.error("No se pudieron cargar los términos", error);
        if (!cancelled) {
          setItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [q, refreshIndex]);

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

  async function fetchTerms(query: string) {
    const url = query ? `/api/terms?q=${encodeURIComponent(query)}` : `/api/terms`;
    const res = await fetch(url, {
      cache: "no-store",
      credentials: "include",
      headers: { "cache-control": "no-store" },
    });
    let data: any = null;
    let textFallback = "";
    try {
      data = await res.json();
    } catch {
      textFallback = await res.text().catch(() => "");
    }
    if (!res.ok) {
      const message =
        extractErrorMessage(data) ||
        (textFallback?.trim() || res.statusText || "Error cargando términos");
      throw new Error(message);
    }
    const items = Array.isArray(data?.items) ? data.items : [];
    return [...items].sort((a: Term, b: Term) => Number(a.id) - Number(b.id));
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

  function collectMessages(entry: unknown): string[] {
    if (!entry) return [];
    if (Array.isArray(entry)) {
      return entry.filter((msg): msg is string => typeof msg === "string");
    }
    if (typeof entry === "object") {
      return Object.values(entry as Record<string, unknown>).flatMap((value) => collectMessages(value));
    }
    return [];
  }

  function extractErrorMessage(payload: any): string | null {
    if (!payload) return null;
    if (typeof payload.error === "string") return payload.error;
    if (typeof payload.message === "string") return payload.message;
    if (Array.isArray(payload.error)) {
      return payload.error.filter(Boolean).join(". ");
    }
    const sources = [
      payload.error?.fieldErrors,
      payload.error?.formErrors,
      payload.error?.errors,
      payload.fieldErrors,
      payload.formErrors,
    ];
    for (const source of sources) {
      const first = collectMessages(source).find((msg) => msg.trim().length);
      if (first) return first;
    }
    return null;
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
    const title =
      context === "single"
        ? preview[0]
          ? `Eliminar ${preview[0]}`
          : "Eliminar término"
        : `Eliminar ${uniqueIds.length} términos`;
    const description =
      context === "single"
        ? "Esta acción eliminará el término del catálogo y no se puede deshacer."
        : "Eliminarás de forma permanente todos los términos seleccionados. No podrás deshacerlo.";
    setDeleteDialog({
      ids: uniqueIds,
      context,
      title,
      description,
      preview,
    });
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
          let data: any = null;
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
          const message =
            extractErrorMessage(data) ||
            (textFallback?.trim() || res.statusText || "Error eliminando");
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
    let data: any = null;
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
        const message =
          extractErrorMessage(data) ||
          (textFallback?.trim() || res.statusText || "Error guardando");
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
    <div className="admin-page">
      <header className="admin-hero">
        <div className="admin-hero__grid">
          <div className="admin-hero__brand">
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div className="hero-logo">
                <Image src="/logo.png" alt="Diccionario Técnico Web" width={48} height={48} />
              </div>
              <div>
                <p className="hero-eyebrow" style={{ marginBottom: 4 }}>
                  Panel de control
                </p>
                <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "-1px" }}>Admin · Diccionario</h1>
              </div>
            </div>
            <p className="sub" style={{ maxWidth: 520 }}>
              Controla el glosario técnico, usuarios y sesiones con herramientas listas para producción.
            </p>
            <div className="admin-hero__stats">
              {adminHeroStats.map(stat => (
                <div key={stat.label} className="admin-hero__stats-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="admin-hero__status">
            <span className={`pill ${session ? "online" : "offline"}`}>
              {session ? "Sesión activa" : "Sin sesión"}
            </span>
            <small style={{ color: "rgba(255,255,255,.75)" }}>
              {authLoading
                ? "Verificando sesión…"
                : session
                  ? `Logueado como ${session.username} (${session.role})`
                  : "Inicia sesión para desbloquear todas las herramientas."}
            </small>
            <small style={{ color: "rgba(255,255,255,.6)" }}>
              Última sincronización: <b>{today}</b>
            </small>
            <div className="admin-hero__actions">
              {session ? (
                <button className="btn-primary" onClick={logout}>
                  Cerrar sesión
                </button>
              ) : null}
              <button className="btn" onClick={refreshSession}>
                Refrescar
              </button>
              <button className="btn" onClick={() => setEditing(empty)} disabled={!canEdit}>
                Nuevo término
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="admin-shell">
        {authError && (
          <div className="alert-card">
            <small>{authError}</small>
          </div>
        )}
        {message && (
          <div className="success-card">
            <small>{message}</small>
          </div>
        )}

      <div className="grid-stack">
        {!session && (
          <section className="panel">
            <div>
              <h2 className="panel-title">Iniciar sesión</h2>
              <p className="panel-sub">Accede con tus credenciales de administrador.</p>
            </div>
            <div className="form-grid">
              <div>
                <label>
                  <small>Usuario</small>
                </label>
                <input
                  className="input"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div>
                <label>
                  <small>Contraseña</small>
                </label>
                <input
                  className="input"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
            </div>
            <div className="button-row">
              <button className="btn-primary" onClick={login}>
                Entrar
              </button>
            </div>
          </section>
        )}

        {showRegisterCard && (
          <section className="panel">
            <div>
              <h2 className="panel-title">
                {allowBootstrap ? "Crear administrador inicial" : "Registrar usuario"}
              </h2>
              <p className="panel-sub">
                {allowBootstrap
                  ? "El primer usuario será administrador automáticamente."
                  : "Solo los administradores autenticados pueden crear nuevas cuentas."}
              </p>
            </div>
            <div className="form-grid two">
              <div>
                <label>
                  <small>Usuario</small>
                </label>
                <input
                  className="input"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                />
              </div>
              <div>
                <label>
                  <small>Email (opcional)</small>
                </label>
                <input
                  className="input"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="form-grid two">
              <div>
                <label>
                  <small>Contraseña</small>
                </label>
                <input
                  className="input"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
              {!allowBootstrap && (
                <div>
                  <label>
                    <small>Rol</small>
                  </label>
                  <select
                    className="select"
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as "admin" | "user" })}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
              )}
            </div>
            <div className="button-row">
              <button className="btn-primary" onClick={register}>
                {allowBootstrap ? "Crear administrador" : "Registrar usuario"}
              </button>
            </div>
          </section>
        )}
      </div>

      <section className="panel table-panel">
        <div className="table-header">
          <div className="table-headline">
            <p className="panel-sub eyebrow">Catálogo</p>
            <h2 className="panel-title">Términos técnicos</h2>
            <p className="panel-sub">Controla y sincroniza el glosario completo en tiempo real.</p>
          </div>
          <div className="table-search">
            <label>
              <small>Buscar término</small>
            </label>
            <div className="input-shell">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27a6 6 0 1 0-.71.71l.27.28v.79l5 5L20.49 19l-5-5zm-5.5 1a4.5 4.5 0 1 1 0-9a4.5 4.5 0 0 1 0 9"
                />
              </svg>
              <input
                className="input input-ghost"
                type="search"
                value={q}
                placeholder='Ej. "fetch", "JOIN", "JWT"...'
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="table-toolbar">
          <div>
            <p className="toolbar-eyebrow">Selección actual</p>
            <div className="toolbar-count">
              <strong>{selectedCount}</strong>
              <span>seleccionados</span>
            </div>
            <p className="toolbar-note">
              {selectedCount
                ? allSelected
                  ? "Todos los términos visibles están marcados."
                  : "Términos marcados dentro del filtro activo."
                : "Marca términos para habilitar acciones masivas."}
            </p>
          </div>
          <div className="toolbar-actions">
            <button className="btn ghost" onClick={toggleSelectAll} disabled={selectionDisabled}>
              {allSelected ? "Limpiar selección" : "Seleccionar visibles"}
            </button>
            <button
              className={`btn ${bulkDeleteEnabled ? "btn-danger" : "btn-disabled"}`}
              disabled={!bulkDeleteEnabled}
              onClick={() => requestDeletion(selectedIds, "bulk")}
            >
              Eliminar seleccionados
            </button>
          </div>
        </div>
        <div className="table-body table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los términos visibles"
                    checked={allSelected && !!items.length}
                    onChange={() => toggleSelectAll()}
                    disabled={selectionDisabled}
                  />
                </th>
                <th>#</th>
                <th>Traducción</th>
                <th>Término</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar término ${i.term}`}
                        checked={selectedIds.includes(i.id)}
                        onChange={() => toggleItemSelection(i.id)}
                        disabled={!canEdit}
                      />
                    </td>
                    <td>{i.id}</td>
                    <td>{i.translation}</td>
                    <td>{i.term}</td>
                    <td>
                      <span className="badge">{i.category}</span>
                    </td>
                    <td style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button className="btn" disabled={!canEdit} onClick={() => setEditing(i)}>
                        Editar
                      </button>
                      <button className="btn" disabled={!canEdit} onClick={() => handleDeleteClick(i.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty">
                      <div>
                        <strong>Sin resultados</strong>
                        <span>Crea un término nuevo o ajusta la búsqueda para ver registros.</span>
                      </div>
                      {canEdit && (
                        <button className="btn-primary" onClick={() => setEditing(empty)}>
                          Crear término
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {!canEdit && (
        <div className="alert-card">
          <small>Inicia sesión como administrador para crear o editar términos.</small>
        </div>
      )}
    </main>

      {editing && canEdit && (
        <EditorModal term={editing} onCancel={() => setEditing(null)} onSave={save} />
      )}
      {deleteDialog && (
        <ConfirmModal
          title={deleteDialog.title}
          description={deleteDialog.description}
          preview={deleteDialog.preview}
          confirmLabel={deleteDialog.context === "single" ? "Eliminar término" : "Eliminar todo"}
          loading={deleteLoading}
          onCancel={() => {
            if (!deleteLoading) setDeleteDialog(null);
          }}
          onConfirm={() => executeDeletion(deleteDialog.ids)}
        />
      )}
    </div>
  );
}

function EditorModal({
  term,
  onCancel,
  onSave,
}: {
  term: Term;
  onCancel: () => void;
  onSave: (t: Term) => void;
}) {
  const [val, setVal] = useState<Term>({ ...term });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  const requiredFilled =
    val.term.trim().length > 0 &&
    val.translation.trim().length > 0 &&
    val.meaning.trim().length > 0 &&
    val.what.trim().length > 0 &&
    val.how.trim().length > 0;

  return (
    <div className="modal-backdrop">
      <section className="modal-panel" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{val.id ? "Editar término" : "Nuevo término"}</p>
            <h2 className="panel-title">{val.id ? `Edición #${val.id}` : "Añadir término"}</h2>
          </div>
          <button className="modal-close" onClick={onCancel} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="form-grid two">
          <div>
            <label>
              <small>Traducción (ES)</small>
            </label>
            <input
              className="input"
              required
              value={val.translation}
              onChange={(e) => setVal({ ...val, translation: e.target.value })}
            />
          </div>
          <div>
            <label>
              <small>Término (EN)</small>
            </label>
            <input className="input" required value={val.term} onChange={(e) => setVal({ ...val, term: e.target.value })} />
          </div>
        </div>

        <div className="form-grid two">
          <div>
            <label>
              <small>Categoría</small>
            </label>
            <select
              className="select"
              value={val.category}
              onChange={(e) => setVal({ ...val, category: e.target.value as Term["category"] })}
            >
              {CATS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>
              <small>Aliases (coma separada)</small>
            </label>
            <input
              className="input"
              value={val.aliases.join(", ")}
              onChange={(e) =>
                setVal({
                  ...val,
                  aliases: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>

        <div className="form-grid two">
          <div>
            <label>
              <small>Significado</small>
            </label>
            <textarea
              className="textarea"
              rows={2}
              required
              value={val.meaning}
              onChange={(e) => setVal({ ...val, meaning: e.target.value })}
            />
          </div>
          <div>
            <label>
              <small>Qué hace</small>
            </label>
            <textarea
              className="textarea"
              rows={2}
              required
              value={val.what}
              onChange={(e) => setVal({ ...val, what: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label>
            <small>Cómo se usa</small>
          </label>
          <textarea
            className="textarea code"
            rows={4}
            required
            value={val.how}
            onChange={(e) => setVal({ ...val, how: e.target.value })}
          />
        </div>

        <ExamplesEditor
          value={val.examples}
          onChange={(examples) =>
            setVal({
              ...val,
              examples,
            })
          }
        />

        {!requiredFilled && (
          <small style={{ color: "var(--danger)", display: "block", marginTop: 12 }}>
            Completa traducción, término, significado, qué hace y cómo se usa.
          </small>
        )}

        <div className="button-row">
          <button className="btn-primary" disabled={!requiredFilled} onClick={() => onSave(val)}>
            Guardar
          </button>
          <button className="btn" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}

type ConfirmModalProps = {
  title: string;
  description: string;
  preview?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmModal({
  title,
  description,
  preview,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="modal-backdrop">
      <section className="modal-panel" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Confirmación requerida</p>
            <h2 className="panel-title" style={{ marginBottom: 0 }}>
              {title}
            </h2>
          </div>
          <button className="modal-close" onClick={onCancel} aria-label="Cerrar" disabled={loading}>
            ✕
          </button>
        </div>
        <p className="panel-sub" style={{ marginTop: 0 }}>{description}</p>
        {preview?.length ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {preview.slice(0, 3).map((item) => (
              <span key={item} className="badge">
                {item}
              </span>
            ))}
            {preview.length > 3 && (
              <span className="badge" style={{ background: "rgba(255,255,255,0.1)" }}>
                +{preview.length - 3} más
              </span>
            )}
          </div>
        ) : null}
        <div className="button-row" style={{ marginTop: 32 }}>
          <button className="btn" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className="btn-primary" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function ExamplesEditor({
  value,
  onChange,
}: {
  value: TermExample[];
  onChange: (v: TermExample[]) => void;
}) {
  const [list, setList] = useState(value);

  useEffect(() => {
    setList(value);
  }, [value]);

  function update(i: number, key: keyof TermExample, v: string) {
    const copy = list.map((item, idx) => (idx === i ? { ...item, [key]: v } : item));
    setList(copy);
    onChange(copy);
  }

  function add() {
    const copy = [...list, { title: "", code: "", note: "" }];
    setList(copy);
    onChange(copy);
  }

  function del(i: number) {
    const copy = list.slice();
    copy.splice(i, 1);
    setList(copy);
    onChange(copy);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label>
          <small>Ejemplos</small>
        </label>
        <button className="btn" onClick={add}>
          + Añadir ejemplo
        </button>
      </div>
      {list.map((example, i) => (
        <div key={i} className="card" style={{ marginTop: 12 }}>
          <div className="form-grid two">
            <div>
              <label>
                <small>Título</small>
              </label>
              <input className="input" value={example.title} onChange={(ev) => update(i, "title", ev.target.value)} />
            </div>
            <div>
              <label>
                <small>Nota (opcional)</small>
              </label>
              <input className="input" value={example.note || ""} onChange={(ev) => update(i, "note", ev.target.value)} />
            </div>
          </div>
          <div className="form-grid">
            <div>
              <label>
                <small>Código</small>
              </label>
              <textarea className="textarea code" rows={4} value={example.code} onChange={(ev) => update(i, "code", ev.target.value)} />
            </div>
          </div>
          <div className="button-row">
            <button className="btn" onClick={() => del(i)}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
      {!list.length && <small>Sin ejemplos.</small>}
    </div>
  );
}
