"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TermDTO } from "@/types/term";

export type FavoriteItem = {
  id: number;
  term: string;
  translation?: string | null;
  category?: string | null;
  slug?: string | null;
  meaning?: string | null;
};

const MAX_FAVORITES = 200;

export function getFavoritesStorageKey(username?: string | null) {
  const safe = username?.trim() || "guest";
  return `favorites:${safe}`;
}

function normalizeFavorite(term: TermDTO): FavoriteItem {
  return {
    id: term.id,
    term: term.term,
    translation: term.translation,
    category: term.category,
    slug: term.slug ?? null,
    meaning: term.meaningEs ?? term.meaning ?? term.whatEs ?? term.what ?? null,
  };
}

function readFavorites(storageKey: string): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(storageKey: string, items: FavoriteItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(items));
}

export function useFavorites(storageKey: string) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    setFavorites(readFavorites(storageKey));
  }, [storageKey]);

  const persist = useCallback(
    (items: FavoriteItem[]) => {
      const trimmed = items.slice(0, MAX_FAVORITES);
      setFavorites(trimmed);
      writeFavorites(storageKey, trimmed);
    },
    [storageKey],
  );

  const isFavorite = useCallback(
    (termId: number) => favorites.some((item) => item.id === termId),
    [favorites],
  );

  const addFavorite = useCallback(
    (term: TermDTO) => {
      const item = normalizeFavorite(term);
      if (favorites.some((entry) => entry.id === item.id)) return;
      persist([item, ...favorites]);
    },
    [favorites, persist],
  );

  const removeFavorite = useCallback(
    (termId: number) => {
      persist(favorites.filter((entry) => entry.id !== termId));
    },
    [favorites, persist],
  );

  const toggleFavorite = useCallback(
    (term: TermDTO) => {
      if (favorites.some((entry) => entry.id === term.id)) {
        removeFavorite(term.id);
        return false;
      }
      addFavorite(term);
      return true;
    },
    [addFavorite, favorites, removeFavorite],
  );

  return useMemo(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
    }),
    [favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite],
  );
}
