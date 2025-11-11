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

  useEffect(() => {
    fetchTerms(q).then(setItems).catch(() => setItems([]));
  }, [q]);

  useEffect(() => {
    refreshSession();
  }, []);

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
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error cargando términos");
    const data = await res.json();
    return data.items || [];
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
    setItems(await fetchTerms(q));
  }

  async function remove(id: number) {
    if (session?.role !== "admin") {
      setAuthError("Solo un administrador puede eliminar");
      return;
    }
    if (!confirm("¿Eliminar término?")) return;
    const res = await fetch(`/api/terms/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setAuthError(data?.error || "Error eliminando");
      return;
    }
    setMessage("Término eliminado");
    setItems(await fetchTerms(q));
  }

  const showRegisterCard = allowBootstrap || session?.role === "admin";
  const canEdit = session?.role === "admin";

  return (
    <main className="admin-shell">
      <section className="hero-card">
        <div className="hero-meta">
          <div className="hero-brand">
            <div className="hero-logo">
              <Image src="/logo.png" alt="Diccionario Técnico Web" width={48} height={48} />
            </div>
            <div>
              <p className="eyebrow">Diccionario Técnico Web</p>
              <h1>Admin · Diccionario</h1>
            </div>
          </div>
          <p className="sub">Control total del glosario técnico con un diseño mobile-first, listo para cualquier pantalla.</p>
        </div>
        <div className="hero-actions">
          <div className="hero-status">
            <span className={`pill ${session ? "online" : "offline"}`}>
              {session ? "Sesión activa" : "Sin sesión"}
            </span>
            <small>
              {authLoading
                ? "Verificando sesión…"
                : session
                  ? `Logueado como ${session.username} (${session.role})`
                  : "Inicia sesión para desbloquear todas las herramientas."}
            </small>
          </div>
          <div className="button-row">
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
      </section>

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
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              )}
            </div>
            <div className="button-row">
              <button className="btn-primary" onClick={register}>
                Registrar
              </button>
            </div>
          </section>
        )}
      </div>

      <section className="panel table-panel">
        <div className="table-header">
          <div style={{ flex: 1 }}>
            <p className="panel-sub" style={{ marginBottom: 6 }}>
              Catálogo
            </p>
            <h2 className="panel-title" style={{ margin: 0 }}>
              Términos técnicos
            </h2>
          </div>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <label>
              <small>Buscar término</small>
            </label>
            <input
              className="input"
              value={q}
              placeholder='Ej. "fetch", "JOIN", "JWT"...'
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="table-body table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Traducción</th>
                <th>Término</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
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
                    <button className="btn" disabled={!canEdit} onClick={() => remove(i.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <small>Sin resultados.</small>}
        </div>
      </section>

      {editing && canEdit && (
        <EditorModal term={editing} onCancel={() => setEditing(null)} onSave={save} />
      )}
      {!canEdit && (
        <div className="alert-card">
          <small>Inicia sesión como administrador para crear o editar términos.</small>
        </div>
      )}
    </main>
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
