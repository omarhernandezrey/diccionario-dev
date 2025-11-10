"use client";
import { useEffect, useMemo, useState } from "react";

type Term = {
  id: number;
  term: string;
  aliases: string[];
  category: "frontend" | "backend" | "database" | "devops" | "general";
  meaning: string;
  what: string;
  how: string;
  examples: { title: string; code: string; note?: string }[];
};

const CATS = ["frontend", "backend", "database", "devops", "general"] as const;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Term[]>([]);
  const [editing, setEditing] = useState<Term | null>(null);

  useEffect(() => {
    // Could check session by calling a protected endpoint in the future.
    // Check if we already have a valid session cookie
    (async () => {
      try {
        const r = await fetch("/api/auth", { method: "GET", credentials: "include" });
        setLoggedIn(r.ok);
      } catch (e) {
        setLoggedIn(false);
      }
    })();
  }, []);

  useEffect(() => {
    const url = q ? `/api/terms?q=${encodeURIComponent(q)}` : `/api/terms`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []));
  }, [q]);

  const empty: Term = useMemo(
    () => ({
      id: 0,
      term: "",
      aliases: [],
      category: "general",
      meaning: "",
      what: "",
      how: "",
      examples: [],
    }),
    [],
  );

  async function save(term: Term) {
    const isNew = !term.id;
    const url = isNew ? "/api/terms" : `/api/terms/${term.id}`;
    const method = isNew ? "POST" : "PATCH";
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        term: term.term,
        aliases: term.aliases,
        category: term.category,
        meaning: term.meaning,
        what: term.what,
        how: term.how,
        examples: term.examples,
      }),
    });
    if (!res.ok) {
      alert("Error guardando (ver consola)");
      console.error(await res.json());
      return;
    }
    setEditing(null);
    const url2 = q ? `/api/terms?q=${encodeURIComponent(q)}` : `/api/terms`;
    const d = await fetch(url2).then((r) => r.json());
    setItems(d.items || []);
  }

  async function remove(id: number) {
    if (!confirm("Eliminar término?")) return;
    const res = await fetch(`/api/terms/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      alert("Error eliminando");
      return;
    }
    setItems(items.filter((i) => i.id !== id));
  }

  return (
    <main className="container">
      <h1>Admin · Diccionario</h1>
      <div className="card">
        <div className="row row-2">
          <div>
            <label>
              <small>Administrador (contraseña)</small>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                type="password"
                value={password}
                placeholder="Ingresa la contraseña"
                onChange={(e) => setPassword(e.target.value)}
              />
              {loggedIn ? (
                <button
                  className="btn"
                  onClick={async () => {
                    await fetch("/api/auth", { method: "DELETE", credentials: "include" });
                    setLoggedIn(false);
                  }}
                >
                  Logout
                </button>
              ) : (
                <button
                  className="btn"
                  onClick={async () => {
                    const res = await fetch("/api/auth", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ password }),
                      credentials: "include",
                    });
                    if (!res.ok) {
                      alert("Credenciales incorrectas");
                      return;
                    }
                    setPassword("");
                    setLoggedIn(true);
                  }}
                >
                  Login
                </button>
              )}
            </div>
          </div>
          <div>
            <label>
              <small>Buscar</small>
            </label>
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar término" />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={() => setEditing(empty)}>
            + Nuevo término
          </button>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Término</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.term}</td>
                <td>
                  <span className="badge">{i.category}</span>
                </td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button className="btn" onClick={() => setEditing(i)}>
                    Editar
                  </button>
                  <button className="btn" onClick={() => remove(i.id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <small>Sin resultados.</small>}
      </div>

      {editing && <Editor term={editing} onCancel={() => setEditing(null)} onSave={save} />}
    </main>
  );
}

function Editor({ term, onCancel, onSave }: { term: Term; onCancel: () => void; onSave: (t: Term) => void }) {
  const [val, setVal] = useState<Term>({ ...term });

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{val.id ? `Editar #${val.id}` : "Nuevo término"}</h2>
      <div className="row row-2">
        <div>
          <label>
            <small>Término</small>
          </label>
          <input className="input" value={val.term} onChange={(e) => setVal({ ...val, term: e.target.value })} />
        </div>
        <div>
          <label>
            <small>Categoría</small>
          </label>
          <select className="select" value={val.category} onChange={(e) => setVal({ ...val, category: e.target.value as Term["category"] })}>
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="row">
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
                aliases: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </div>
      </div>

      <div className="row">
        <div>
          <label>
            <small>Significado</small>
          </label>
          <textarea className="textarea" rows={2} value={val.meaning} onChange={(e) => setVal({ ...val, meaning: e.target.value })} />
        </div>
        <div>
          <label>
            <small>Qué hace</small>
          </label>
          <textarea className="textarea" rows={2} value={val.what} onChange={(e) => setVal({ ...val, what: e.target.value })} />
        </div>
      </div>

      <div className="row">
        <div>
          <label>
            <small>Cómo se usa</small>
          </label>
          <textarea className="textarea code" rows={4} value={val.how} onChange={(e) => setVal({ ...val, how: e.target.value })} />
        </div>
      </div>

      <div className="row">
        <ExamplesEditor value={val.examples} onChange={(examples) => setVal({ ...val, examples })} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn" onClick={() => onSave(val)}>
          Guardar
        </button>
        <button className="btn" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function ExamplesEditor({
  value,
  onChange,
}: {
  value: { title: string; code: string; note?: string }[];
  onChange: (v: { title: string; code: string; note?: string }[]) => void;
}) {
  const [list, setList] = useState(value);

  useEffect(() => {
    setList(value);
  }, [value]);

  function update(i: number, k: "title" | "code" | "note", v: string) {
    const cp = list.slice();
    (cp[i] as any)[k] = v;
    setList(cp);
    onChange(cp);
  }
  function add() {
    const cp = [...list, { title: "", code: "", note: "" }];
    setList(cp);
    onChange(cp);
  }
  function del(i: number) {
    const cp = list.slice();
    cp.splice(i, 1);
    setList(cp);
    onChange(cp);
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
      {list.map((e, i) => (
        <div key={i} className="card" style={{ marginTop: 8 }}>
          <div className="row row-2">
            <div>
              <label>
                <small>Título</small>
              </label>
              <input className="input" value={e.title} onChange={(ev) => update(i, "title", ev.target.value)} />
            </div>
            <div>
              <label>
                <small>Nota (opcional)</small>
              </label>
              <input className="input" value={e.note || ""} onChange={(ev) => update(i, "note", ev.target.value)} />
            </div>
          </div>
          <div className="row">
            <div>
              <label>
                <small>Código</small>
              </label>
              <textarea className="textarea code" rows={4} value={e.code} onChange={(ev) => update(i, "code", ev.target.value)} />
            </div>
          </div>
          <div>
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
