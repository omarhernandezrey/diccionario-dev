import Link from "next/link";
import TermsExplorer from "@/components/TermsExplorer";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-neo-bg">
      <section className="mx-auto w-full max-w-6xl px-4 pt-10 pb-6 sm:pt-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neo-text-secondary">
              Diccionario Dev
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-neo-text-primary sm:text-4xl">
              Explorar terminos
            </h1>
            <p className="mt-2 text-sm text-neo-text-secondary">
              Navega, filtra y ordena todo el glosario disponible.
            </p>
          </div>
          <Link href="/" className="btn-ghost w-fit">
            Volver al buscador
          </Link>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10">
        <TermsExplorer />
      </div>

      <Footer variant="neo" />
    </main>
  );
}
