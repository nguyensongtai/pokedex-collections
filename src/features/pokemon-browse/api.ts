/**
 * All PokeAPI access for the browse feature. Zero JSX, zero React — fetching
 * lives here so presentation components stay dumb and this file stays testable
 * and swappable (a detail page or a server-side route would reuse it as-is).
 *
 * Strategy note: PokeAPI has no search endpoint. We therefore fetch the full
 * name index once (names + URLs only, ~1MB, cached in module scope), filter it
 * client-side, and lazily hydrate details for the visible page of results only.
 */

import {
  toPokemonTypeName,
  type PokemonSummary,
  type PokemonTypeName,
} from '@/shared/types/pokemon';

const API_BASE = 'https://pokeapi.co/api/v2';

/** How many cards one "page" of the grid holds. */
export const PAGE_SIZE = 24;

/* ── Wire formats ─────────────────────────────────────────────────────────── */

export interface PokemonIndexEntry {
  name: string;
  url: string;
}

interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonIndexEntry[];
}

interface PokemonTypeSlot {
  slot: number;
  type: { name: string; url: string };
}

interface PokemonDetailResponse {
  id: number;
  name: string;
  types: PokemonTypeSlot[];
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: {
        front_default: string | null;
      };
    };
  };
}

/* ── Fetch plumbing ───────────────────────────────────────────────────────── */

export class PokeApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PokeApiError';
  }
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new PokeApiError('Could not reach PokéAPI. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new PokeApiError(`PokéAPI responded with ${response.status}.`);
  }

  return (await response.json()) as T;
}

/* ── Index (cached in module scope, per the data strategy) ─────────────────── */

let indexPromise: Promise<PokemonIndexEntry[]> | null = null;

/**
 * The full name index, fetched at most once per page load. On failure the cache
 * is cleared so a retry can genuinely re-request.
 */
export function fetchPokemonIndex(): Promise<PokemonIndexEntry[]> {
  indexPromise ??= fetchJson<PokemonListResponse>(`${API_BASE}/pokemon?limit=10000&offset=0`)
    .then((data) => data.results)
    .catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });

  return indexPromise;
}

/* ── Details (memoised per name) ──────────────────────────────────────────── */

const detailCache = new Map<string, Promise<PokemonSummary>>();

function toSummary(detail: PokemonDetailResponse): PokemonSummary {
  const artwork = detail.sprites.other?.['official-artwork']?.front_default ?? null;

  const types: PokemonTypeName[] = [...detail.types]
    .sort((a, b) => a.slot - b.slot)
    .map((slot) => toPokemonTypeName(slot.type.name));

  return {
    id: detail.id,
    name: detail.name,
    spriteUrl: artwork ?? detail.sprites.front_default,
    types,
  };
}

export function fetchPokemonDetail(name: string): Promise<PokemonSummary> {
  const cached = detailCache.get(name);
  if (cached) return cached;

  const request = fetchJson<PokemonDetailResponse>(`${API_BASE}/pokemon/${name}`)
    .then(toSummary)
    .catch((error: unknown) => {
      detailCache.delete(name);
      throw error;
    });

  detailCache.set(name, request);
  return request;
}

/**
 * Hydrates a page of index entries. Individual failures are tolerated (PokeAPI
 * has a handful of flaky form entries) — the caller only sees an error when the
 * whole batch fails, which is the signal that something is actually wrong.
 */
export async function fetchPokemonDetails(names: string[]): Promise<PokemonSummary[]> {
  if (names.length === 0) return [];

  const settled = await Promise.allSettled(names.map((name) => fetchPokemonDetail(name)));
  const fulfilled = settled
    .filter((result): result is PromiseFulfilledResult<PokemonSummary> => result.status === 'fulfilled')
    .map((result) => result.value);

  if (fulfilled.length === 0) {
    throw new PokeApiError('Could not load Pokémon details. Please try again.');
  }

  return fulfilled;
}

/** Case-insensitive substring match, exact and prefix hits first. */
export function filterPokemonIndex(
  index: PokemonIndexEntry[],
  query: string,
): PokemonIndexEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return index;

  const exact: PokemonIndexEntry[] = [];
  const prefix: PokemonIndexEntry[] = [];
  const contains: PokemonIndexEntry[] = [];

  for (const entry of index) {
    if (entry.name === needle) exact.push(entry);
    else if (entry.name.startsWith(needle)) prefix.push(entry);
    else if (entry.name.includes(needle)) contains.push(entry);
  }

  return [...exact, ...prefix, ...contains];
}
