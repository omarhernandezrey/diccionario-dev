"use client";
import { useEffect, useState } from "react";

import type { TermDTO } from "@/types/term";

const quickTerms = ["fetch", "useState", "REST", "JOIN", "JWT", "Docker"];

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<TermDTO[]>([]);
  const [selected, setSelected] = useState<TermDTO | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const debounced = useDebounce(q, 180);
  const hasQuery = Boolean(debounced);
  const hasResults = Boolean(items?.length);

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
        setErrorMsg(null);
      })
      .catch((err) => {
        setItems([]);
        setSelected(null);
        setErrorMsg(err?.message || "Error cargando resultados");
      });
  }, [debounced]);

  return (
    <section id="search" className="panel search-panel">
      <div className="search-header">
        <span className="hero-eyebrow">Buscador inteligente</span>
        <h2 style={{ margin: 0, fontSize: 32 }}>Encuentra el concepto perfecto</h2>
        <p className="sub" style={{ margin: 0 }}>Escribe un término técnico y recibe definiciones, ejemplos y snippets listos.</p>
      </div>

      <div className="search-input-shell">
        <span aria-hidden style={{ fontSize: 20, color: "#8f7dff" }}>🔍</span>
        <input
          className="code"
          placeholder='Escribe un término: ej. "fetch", "useState", "JOIN", "JWT"...'
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span style={{ fontSize: 12, color: "#9aa6c8", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: "6px 10px" }}>
          Enter ↵
        </span>
      </div>

      <div className="quick-list">
        {quickTerms.map(term => (
          <button key={term} type="button" onClick={() => setQ(term)} className="quick-chip">
            #{term}
          </button>
        ))}
      </div>

      {hasResults ? (
        <div
          className="card"
          style={{
            marginTop: 28,
            background: "rgba(8,16,36,.85)",
            border: "1px solid rgba(141,125,255,.15)",
          }}
        >
          <div className="row row-2" style={{ marginTop: 0 }}>
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Término</th>
                    <th>Cat.</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(t => (
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
        </div>
      ) : hasQuery ? (
        <div className="card" style={{ marginTop: 28, textAlign: "center", background: "rgba(8,16,36,.85)" }}>
          <small>Sin resultados.</small>
          {errorMsg ? (
            <div style={{ marginTop: 12 }}>
              <small style={{ color: "#ff9b9b" }}>Error: {errorMsg}</small>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="card" style={{ marginTop: 28, textAlign: "center", background: "rgba(8,16,36,.85)" }}>
          <small>Escribe un término técnico o concepto para comenzar.</small>
        </div>
      )}
    </section>
  );
}

function Result({ result }: { result: TermDTO }) {
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>{result.term}</h2>
        <span className="badge">{result.category}</span>
      </div>
      <div style={{ marginTop: 6 }}>
        <span className="badge" style={{ background: "rgba(61,107,255,.15)", borderColor: "rgba(61,107,255,.4)" }}>
          Traducción: {result.translation}
        </span>
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
        <CodeCard code={result.how} label="Cómo se usa" />
      </div>
      {result.examples?.length ? (
        <>
          <hr />
          <small>Ejemplos:</small>
          {result.examples.map((ex, i) => (
            <ExampleCard key={`${ex.title}-${i}`} example={ex} index={i + 1} />
          ))}
        </>
      ) : null}
    </div>
  );
}

function CodeCard({ code, note, label }: { code: string; note?: string; label?: string }) {
  return (
    <div className="code-card">
      <div className="code-toolbar">
        <div className="code-title">{label || "Snippet"}</div>
        <CopyButton code={code} />
      </div>
      <CodeBlock code={code} />
      {note ? <small className="code-note">{note}</small> : null}
    </div>
  );
}

type Example = TermDTO["examples"][number];

function ExampleCard({ example, index }: { example: Example; index: number }) {
  return (
    <div className="code-card">
      <div className="code-toolbar">
        <div>
          <div className="code-title">{example.title || `Ejemplo ${index}`}</div>
          <small className="code-note">Bloque #{index}</small>
        </div>
        <CopyButton code={example.code} />
      </div>
      <CodeBlock code={example.code} />
      {example.note ? <small className="code-note">{example.note}</small> : null}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const normalized = code.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  return (
    <pre className="code-block">
      {lines.map((line, idx) => (
        <div className="code-line" key={`${idx}-${line.slice(0, 12)}`}>
          <span className="code-line-number">{String(idx + 1).padStart(2, "0")}</span>
          <span className="code-line-content">{line || "\u00A0"}</span>
        </div>
      ))}
    </pre>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy} type="button">
      {copied ? "Copiado" : "Copiar"}
    </button>
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
