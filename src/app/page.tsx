import Link from "next/link";
import SearchBox from "@/components/SearchBox";

export default function Page() {
  return (
    <main className="container">
      <h1>Diccionario Técnico Web (ES)</h1>
      <p className="sub">
        Escribe un término y obtén: significado, qué hace y cómo implementarlo. Cubre Frontend / Backend / BD / DevOps.
      </p>
      <SearchBox />
      <div className="card" style={{ marginTop: 16 }}>
        <small>
          Tip: prueba <code>fetch</code>, <code>useState</code>, <code>REST</code>, <code>JOIN</code>, <code>Docker</code>,{' '}
          <code>JWT</code>, <code>CORS</code>…
        </small>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <small>
          Admin: <Link href="/admin">/admin</Link>
        </small>
      </div>
    </main>
  );
}
