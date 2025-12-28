"use client";

import Link from "next/link";
import { useSession } from "@/components/admin/SessionProvider";
import { getFavoritesStorageKey, useFavorites } from "@/hooks/useFavorites";

export default function FavoritesPage() {
  const { session } = useSession();
  const storageKey = getFavoritesStorageKey(session?.username);
  const { favorites, removeFavorite } = useFavorites(storageKey);

  return (
    <main className="min-h-screen bg-neo-bg px-4 py-10 text-neo-text-primary">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-neo-border bg-neo-card p-6 shadow-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neo-text-secondary">Coleccion</p>
            <h1 className="text-3xl font-semibold text-neo-text-primary">Favoritos</h1>
            <p className="text-sm text-neo-text-secondary">
              {favorites.length ? `${favorites.length} terminos guardados` : "Guarda terminos para verlos aqui."}
            </p>
          </div>
          <Link href="/terms" className="btn-ghost">
            Explorar terminos
          </Link>
        </header>

        {favorites.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {favorites.map((item) => {
              const href = item.slug
                ? `/term/${encodeURIComponent(item.slug)}`
                : `/term/${encodeURIComponent(item.term)}`;
              return (
                <article
                  key={item.id}
                  className="rounded-3xl border border-neo-border bg-neo-card p-5 shadow-glow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-neo-text-primary">{item.term}</h2>
                      <p className="text-sm text-neo-text-secondary">{item.translation ?? "Termino tecnico"}</p>
                    </div>
                    <span className="rounded-full bg-neo-surface px-3 py-1 text-xs text-neo-text-secondary">
                      {item.category ?? "general"}
                    </span>
                  </div>
                  {item.meaning ? (
                    <p className="mt-3 line-clamp-3 text-sm text-neo-text-primary/80">{item.meaning}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={href} className="btn-ghost text-xs">
                      Ver termino
                    </Link>
                    <button
                      type="button"
                      className="btn-ghost text-xs"
                      onClick={() => removeFavorite(item.id)}
                    >
                      Quitar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neo-border bg-neo-surface p-8 text-center text-sm text-neo-text-secondary">
            No tienes favoritos todavia. Busca un termino y presiona "Favorito".
          </div>
        )}
      </div>
    </main>
  );
}
