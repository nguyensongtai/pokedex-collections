'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PAGE_SIZE,
  fetchPokemonDetails,
  fetchPokemonIndex,
  filterPokemonIndex,
  type PokemonIndexEntry,
} from '../api';
import { useDebouncedValue } from '@/shared/lib';
import type { PokemonSummary } from '@/shared/types/pokemon';

/**
 * ── Local state, deliberately ────────────────────────────────────────────────
 * Query, results and pagination live here rather than in the global store: no
 * other route reads them and a persisted search box would be surprising. The
 * only global state in the app is `features/favourites/store.ts`.
 *
 * This hook owns all browse business logic — index loading, debouncing,
 * filtering, pagination and lazy detail hydration — so `PokemonGrid` and
 * `PokemonCard` can be pure presentation. No JSX in this file.
 *
 * Everything that *can* be derived is derived rather than mirrored into state
 * via effects; the only effects here talk to an external system (the network).
 */

export type SearchStatus = 'loading' | 'error' | 'ready';

export interface UsePokemonSearchResult {
  query: string;
  setQuery: (query: string) => void;
  /** The debounced query the current results correspond to. */
  submittedQuery: string;
  results: PokemonSummary[];
  status: SearchStatus;
  error: string | null;
  /** Ready, but nothing matched — the empty state. */
  isEmpty: boolean;
  totalMatches: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  retry: () => void;
}

const DEBOUNCE_MS = 200;

/** Detail cache, derived-friendly: what we have, and what we know we can't get. */
interface DetailsState {
  byName: ReadonlyMap<string, PokemonSummary>;
  /** Names whose lookup failed, so the grid does not retry them forever. */
  failed: ReadonlySet<string>;
}

const EMPTY_DETAILS: DetailsState = { byName: new Map(), failed: new Set() };

/** Which page of which query the user has paged into. */
interface Pagination {
  query: string;
  count: number;
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong loading Pokémon.';
}

export function usePokemonSearch(): UsePokemonSearchResult {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS);

  const [index, setIndex] = useState<PokemonIndexEntry[] | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [details, setDetails] = useState<DetailsState>(EMPTY_DETAILS);
  const [pagination, setPagination] = useState<Pagination>({ query: '', count: PAGE_SIZE });

  /** Bumped by `retry()` to re-run the network effects after a failure. */
  const [retryToken, setRetryToken] = useState(0);

  // 1. Load the name index once (module-scope cached in `api.ts`).
  useEffect(() => {
    let cancelled = false;

    fetchPokemonIndex()
      .then((entries) => {
        if (cancelled) return;
        setIndex(entries);
        setIndexError(null);
      })
      .catch((error: unknown) => {
        if (!cancelled) setIndexError(toMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  // 2. Filter client-side — cheap for ~1300 entries, and PokeAPI has no search.
  const matches = useMemo(
    () => (index ? filterPokemonIndex(index, debouncedQuery) : []),
    [index, debouncedQuery],
  );

  // Pagination is derived rather than reset in an effect: a new query simply
  // no longer matches the stored page, so the count falls back to page one.
  const visibleCount = pagination.query === debouncedQuery ? pagination.count : PAGE_SIZE;

  const visibleNames = useMemo(
    () => matches.slice(0, visibleCount).map((entry) => entry.name),
    [matches, visibleCount],
  );

  const pendingNames = useMemo(
    () => visibleNames.filter((name) => !details.byName.has(name) && !details.failed.has(name)),
    [visibleNames, details],
  );
  const pendingKey = pendingNames.join(',');

  // 3. Hydrate details for the visible page only, never the whole index.
  useEffect(() => {
    if (!pendingKey) return;

    let cancelled = false;
    const names = pendingKey.split(',');

    fetchPokemonDetails(names)
      .then((summaries) => {
        if (cancelled) return;

        setDetails((current) => {
          const byName = new Map(current.byName);
          for (const summary of summaries) byName.set(summary.name, summary);

          const failed = new Set(current.failed);
          for (const name of names) {
            if (!byName.has(name)) failed.add(name);
          }

          return { byName, failed };
        });
        setDetailError(null);
      })
      .catch((error: unknown) => {
        if (!cancelled) setDetailError(toMessage(error));
      });

    return () => {
      cancelled = true;
    };
  }, [pendingKey, retryToken]);

  // Results are a projection of the cache over the visible page, which keeps
  // grid order stable and makes "Load more" additive instead of a refetch.
  const results = useMemo(
    () =>
      visibleNames
        .map((name) => details.byName.get(name))
        .filter((summary): summary is PokemonSummary => summary !== undefined),
    [visibleNames, details],
  );

  const loadMore = useCallback(() => {
    setPagination({ query: debouncedQuery, count: visibleCount + PAGE_SIZE });
  }, [debouncedQuery, visibleCount]);

  const retry = useCallback(() => {
    setIndexError(null);
    setDetailError(null);
    setDetails((current) => ({ byName: current.byName, failed: new Set() }));
    setRetryToken((token) => token + 1);
  }, []);

  const error = indexError ?? detailError;
  const isFetchingDetails = pendingNames.length > 0;
  const isInitialLoad = index === null || (results.length === 0 && isFetchingDetails);
  const status: SearchStatus = error ? 'error' : isInitialLoad ? 'loading' : 'ready';

  return {
    query,
    setQuery,
    submittedQuery: debouncedQuery,
    results,
    status,
    error,
    isEmpty: status === 'ready' && matches.length === 0,
    totalMatches: matches.length,
    hasMore: visibleCount < matches.length,
    // Only "more", never the first page — that renders the skeleton grid instead.
    isLoadingMore: isFetchingDetails && results.length > 0,
    loadMore,
    retry,
  };
}
