import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-neo-bg px-4 py-12 text-neo-text-primary">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-neo-border bg-neo-card p-8 text-center shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-neo-text-primary">Pagina no encontrada</h1>
        <p className="mt-3 text-sm text-neo-text-secondary">
          El recurso que buscas no existe o fue movido. Prueba con el buscador o explora el glosario.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-ghost">
            Ir al inicio
          </Link>
          <Link href="/terms" className="btn-ghost">
            Explorar terminos
          </Link>
        </div>
      </div>
    </main>
  );
}
