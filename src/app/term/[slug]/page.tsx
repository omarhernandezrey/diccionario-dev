import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getDocsLink } from "@/lib/docs-link";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { slug: string };
};

type Example = {
  code: string;
  note?: string | null;
  title?: string | null;
};

async function loadTerm(rawSlug: string) {
  const decoded = decodeURIComponent(rawSlug);
  return prisma.term.findFirst({
    where: {
      OR: [
        { slug: decoded },
        { term: { equals: decoded, mode: "insensitive" } },
      ],
    },
    include: {
      variants: true,
      useCases: true,
      faqs: true,
      exercises: true,
    },
  });
}

function normalizeExamples(raw: unknown): Example[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") return { code: item };
        if (typeof item === "object" && "code" in item) {
          return item as Example;
        }
        return null;
      })
      .filter(Boolean) as Example[];
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return normalizeExamples(parsed);
    } catch {
      return [];
    }
  }
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const record = await loadTerm(params.slug);
  if (!record) {
    return { title: "Termino no encontrado" };
  }
  const description =
    record.meaningEs ??
    record.meaning ??
    record.whatEs ??
    record.what ??
    "Definicion tecnica del termino.";
  return {
    title: `${record.term} | Diccionario Dev`,
    description,
    openGraph: {
      title: `${record.term} | Diccionario Dev`,
      description,
    },
  };
}

export default async function TermDetailPage({ params }: PageProps) {
  const record = await loadTerm(params.slug);
  if (!record) notFound();

  const examples = normalizeExamples(record.examples);
  const docLink = getDocsLink(record.term);
  const title = record.term;
  const translation = record.translation ?? "";
  const meaning = record.meaningEs ?? record.meaning ?? "";
  const what = record.whatEs ?? record.what ?? "";
  const how = record.howEs ?? record.how ?? "";
  const tags = Array.isArray(record.tags) ? (record.tags as string[]) : [];

  return (
    <main className="min-h-screen bg-neo-bg px-4 py-10 text-neo-text-primary">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-3xl border border-neo-border bg-neo-card p-6 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">Termino</p>
              <h1 className="text-3xl font-semibold text-neo-text-primary">{title}</h1>
              <p className="text-sm text-neo-text-secondary">{translation}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-neo-border bg-neo-surface px-3 py-1 text-neo-text-secondary">
                  {record.category}
                </span>
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-neo-surface px-3 py-1 text-neo-text-secondary">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/terms" className="btn-ghost text-xs">
                Explorar
              </Link>
              <Link href={`/?q=${encodeURIComponent(record.term)}`} className="btn-ghost text-xs">
                Buscar
              </Link>
              <a href={docLink} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
                Docs oficiales
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-neo-border bg-neo-card p-5 shadow-glow-card">
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Definicion</p>
            <p className="mt-2 text-sm text-neo-text-primary/80">{meaning || "Sin definicion aun."}</p>
          </article>
          <article className="rounded-3xl border border-neo-border bg-neo-card p-5 shadow-glow-card">
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Para que sirve</p>
            <p className="mt-2 text-sm text-neo-text-primary/80">{what || "Sin descripcion aun."}</p>
          </article>
          <article className="rounded-3xl border border-neo-border bg-neo-card p-5 shadow-glow-card">
            <p className="text-xs uppercase tracking-wide text-neo-text-secondary">Como se usa</p>
            <p className="mt-2 text-sm text-neo-text-primary/80">{how || "Sin pasos aun."}</p>
          </article>
        </section>

        {examples.length ? (
          <section className="rounded-3xl border border-neo-border bg-neo-card p-6 shadow-glow-card">
            <h2 className="text-lg font-semibold text-neo-text-primary">Ejemplos</h2>
            <div className="mt-4 space-y-4">
              {examples.map((example, index) => (
                <div key={`${record.id}-example-${index}`} className="rounded-2xl border border-neo-border bg-neo-surface p-4">
                  {example.title ? (
                    <p className="text-xs uppercase tracking-wide text-neo-text-secondary">{example.title}</p>
                  ) : null}
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950/90 p-4 text-xs text-emerald-100">
                    <code>{example.code}</code>
                  </pre>
                  {example.note ? <p className="mt-2 text-xs text-neo-text-secondary">{example.note}</p> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {record.useCases?.length ? (
          <section className="rounded-3xl border border-neo-border bg-neo-card p-6 shadow-glow-card">
            <h2 className="text-lg font-semibold text-neo-text-primary">Casos de uso</h2>
            <ul className="mt-4 space-y-3 text-sm text-neo-text-secondary">
              {record.useCases.map((useCase) => (
                <li key={useCase.id} className="rounded-2xl border border-neo-border bg-neo-surface p-3">
                  <p className="font-semibold text-neo-text-primary">{useCase.summary}</p>
                  <p className="text-xs text-neo-text-secondary">Contexto: {useCase.context}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {record.faqs?.length ? (
          <section className="rounded-3xl border border-neo-border bg-neo-card p-6 shadow-glow-card">
            <h2 className="text-lg font-semibold text-neo-text-primary">FAQs</h2>
            <div className="mt-4 space-y-3">
              {record.faqs.map((faq) => (
                <div key={faq.id} className="rounded-2xl border border-neo-border bg-neo-surface p-4">
                  <p className="text-sm font-semibold text-neo-text-primary">{faq.questionEs}</p>
                  <p className="mt-2 text-sm text-neo-text-secondary">{faq.answerEs}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
