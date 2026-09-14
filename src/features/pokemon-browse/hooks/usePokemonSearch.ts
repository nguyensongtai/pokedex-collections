'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PAGE_SIZE, fetchPokedex, filterPokedex } from '../api';
import { useDebouncedValue } from '@/shared/lib';
import type { PokemonSummary } from '@/shared/types/pokemon';

/**
 * ── Local state, deliberately ────────────────────────────────────────────────
 * Query, the loaded Pokédex and pagination live here rather than in a global
 * store: no other route reads them, and a persisted search box would be
 * surprising. Global state is just the favourites store and the selected
 * language — see the comments in `features/favourites/store.ts` and
 * `shared/i18n/store.ts`.
 *
 * This hook owns all browse business logic — loading, debouncing, filtering and
 * pagination — so `PokemonGrid` and `PokemonCard` can be pure presentation.
 * No JSX in this file.
 */

export type SearchStatus = 'loading' | 'error' | 'ready';

export interface UsePokemonSearchResult {
  query: string;
  setQuery: (query: string) => void;
  clearQuery: () => void;
  /** The debounced query the current results correspond to. */
  submittedQuery: string;
  results: PokemonSummary[];
  status: SearchStatus;
  error: string | null;
  /** Ready, but nothing matched — the empty state. */
  isEmpty: boolean;
  totalMatches: number;
  totalPokemon: number;
  hasMore: boolean;
  remaining: number;
  showMore: () => void;
  retry: () => void;
}

const DEBOUNCE_MS = 200;

/** Which page of which query the user has paged into. */
interface Pagination {
  query: string;
  count: number;
}

function toMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : 'Network error';
}

export function usePokemonSearch(): UsePokemonSearchResult {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);

  const [pokedex, setPokedex] = useState<PokemonSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ query: '', count: PAGE_SIZE });

  /** Bumped by `retry()` to re-run the fetch after a failure. */
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetchPokedex()
      .then((all) => {
        if (cancelled) return;
        setPokedex(all);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(toMessage(cause));
      });

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const matches = useMemo(
    () => (pokedex ? filterPokedex(pokedex, debouncedQuery) : []),
    [pokedex, debouncedQuery],
  );

  // Pagination is derived rather than reset in an effect: a new query simply no
  // longer matches the stored page, so the count falls back to page one.
  const visibleCount = pagination.query === debouncedQuery ? pagination.count : PAGE_SIZE;

  const results = useMemo(() => matches.slice(0, visibleCount), [matches, visibleCount]);

  const showMore = useCallback(() => {
    setPagination({ query: debouncedQuery, count: visibleCount + PAGE_SIZE });
  }, [debouncedQuery, visibleCount]);

  const retry = useCallback(() => {
    setError(null);
    setRetryToken((token) => token + 1);
  }, []);

  const clearQuery = useCallback(() => setQuery(''), []);

  const status: SearchStatus = error ? 'error' : pokedex === null ? 'loading' : 'ready';

  return {
    query,
    setQuery,
    clearQuery,
    submittedQuery: debouncedQuery,
    results,
    status,
    error,
    isEmpty: status === 'ready' && matches.length === 0,
    totalMatches: matches.length,
    totalPokemon: pokedex?.length ?? 0,
    hasMore: visibleCount < matches.length,
    remaining: Math.max(0, matches.length - visibleCount),
    showMore,
    retry,
  };
}
