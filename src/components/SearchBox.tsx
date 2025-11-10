"use client";
import { useEffect, useState } from "react";

type Term = {
  id: number;
  term: string;
  category: string;
  meaning: string;
  what: string;
  how: string;
  examples: { title: string; code: string; note?: string }[];
};

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Term[]>([]);
  const [selected, setSelected] = useState<Term | null>(null);
  const [debugRaw, setDebugRaw] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const debounced = useDebounce(q, 180);

  useEffect(() => {
    if (!debounced) {
      setItems([]);
      setSelected(null);
      return;
    }
    const url = `/api/terms?q=${encodeURIComponent(debounced)}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setItems(d.items || []);
        setSelected(d.items?.[0] || null);
        setDebugRaw(null); // limpiar debug al funcionar
        setErrorMsg(null);
      })
      .catch((err) => {
        setItems([]);
        setSelected(null);
        setDebugRaw(null);
        setErrorMsg(err?.message || "Error cargando resultados");
      });
  }, [debounced]);

  return (
    <div className="card">
      <input
        className="input code"
        placeholder='Escribe un término: ej. "fetch", "useState", "JOIN", "JWT"...'
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {items?.length ? (
        <div className="row row-2" style={{ marginTop: 16 }}>
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>Término</th>
                  <th>Cat.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id} onClick={() => setSelected(t)} style={{ cursor: "pointer" }}>
                    <td>{t.term}</td>
                    <td>
                      <span className="badge">{t.category}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>{selected ? <Result result={selected} /> : <small>Selecciona un resultado</small>}</div>
        </div>
      ) : debounced ? (
        <div style={{ marginTop: 12 }}>
          <small>Sin resultados.</small>
          {errorMsg ? (
            <div style={{ marginTop: 12 }}>
              <small style={{ color: "#ff9b9b" }}>Error: {errorMsg}</small>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Result({ result }: { result: Term }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>{result.term}</h2>
        <span className="badge">{result.category}</span>
      </div>
      <hr />
      <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "8px 12px" }}>
        <div>
          <small>Significado</small>
        </div>
        <div>{result.meaning}</div>
        <div>
          <small>Qué hace</small>
        </div>
        <div>{result.what}</div>
        <div>
          <small>Cómo se usa</small>
        </div>
        <div className="code">
          <pre>{result.how}</pre>
        </div>
      </div>
      {result.examples?.length ? (
        <>
          <hr />
          <small>Ejemplos:</small>
          {result.examples.map((ex, i) => (
            <div key={i} className="card" style={{ marginTop: 8 }}>
              <div style={{ marginBottom: 6 }}>
                <b>{ex.title}</b>
              </div>
              <pre className="code">{ex.code}</pre>
              {ex.note ? <small>{ex.note}</small> : null}
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
}

function useDebounce<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
