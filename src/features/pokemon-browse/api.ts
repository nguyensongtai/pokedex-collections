/**
 * All PokeAPI access for the browse feature. Zero JSX, zero React — fetching
 * lives here so presentation components stay dumb and the strategy stays
 * swappable behind one module.
 *
 * ── Data strategy ───────────────────────────────────────────────────────────
 * PokeAPI has no search endpoint, and `/pokemon?limit=10000` returns names and
 * URLs only — no types — which would force one detail request per visible card
 * and make "search by type" impossible without fetching all ~1300 of them.
 *
 * Walking the 18 type endpoints instead inverts the problem: 18 parallel
 * requests return every Pokémon *grouped by type*, which is exactly the join we
 * need. One pass builds the full id → {name, types} index, artwork URLs are
 * derived from the id, and no per-card request is ever made. Searching by name,
 * dex number or type is then pure client-side filtering.
 *
 * Cost: a slightly heavier first load, in exchange for no request waterfall,
 * instant pagination, and type search. The whole index is cached in module
 * scope and evicted on failure so retry genuinely re-requests.
 */

import {
  artworkUrl,
  isPokemonTypeName,
  POKEMON_TYPES,
  type PokemonSummary,
  type PokemonTypeName,
} from '@/shared/types/pokemon';

const API_BASE = 'https://pokeapi.co/api/v2';

/** How many cards one "page" of the grid holds. */
export const PAGE_SIZE = 48;

/**
 * PokeAPI ids above this are alternate forms (megas, regionals, totems). The
 * design shows the base National Dex only, which keeps the grid coherent.
 */
const MAX_BASE_DEX_ID = 10000;

/* ── Wire formats ─────────────────────────────────────────────────────────── */

interface TypeResponse {
  name: string;
  pokemon: Array<{
    slot: number;
    pokemon: { name: string; url: string };
  }>;
}

/* ── Fetch plumbing ───────────────────────────────────────────────────────── */

export class PokeApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PokeApiError';
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new PokeApiError('Network error');
  }

  if (!response.ok) {
    throw new PokeApiError(`Server responded ${response.status}`);
  }

  return (await response.json()) as T;
}

const ID_IN_URL = /\/(\d+)\/?$/;

function idFromUrl(url: string): number | null {
  const match = ID_IN_URL.exec(url);
  return match ? Number(match[1]) : null;
}

/* ── The index ────────────────────────────────────────────────────────────── */

let indexPromise: Promise<PokemonSummary[]> | null = null;

async function buildIndex(): Promise<PokemonSummary[]> {
  const responses = await Promise.all(
    POKEMON_TYPES.map((_, position) =>
      fetchJson<TypeResponse>(`${API_BASE}/type/${position + 1}`),
    ),
  );

  // slot 1 is the primary type, slot 2 the secondary — the array index keeps
  // them in the order PokeAPI itself reports.
  const byId = new Map<number, { id: number; name: string; types: PokemonTypeName[] }>();

  for (const type of responses) {
    if (!isPokemonTypeName(type.name)) continue;

    for (const { slot, pokemon } of type.pokemon) {
      const id = idFromUrl(pokemon.url);
      if (id === null || id > MAX_BASE_DEX_ID) continue;

      let entry = byId.get(id);
      if (!entry) {
        entry = { id, name: pokemon.name, types: [] };
        byId.set(id, entry);
      }
      entry.types[slot - 1] = type.name;
    }
  }

  return [...byId.values()]
    .map(({ id, name, types }) => ({
      id,
      name,
      spriteUrl: artworkUrl(id),
      // A sparse slot 2 leaves a hole; filtering collapses it.
      types: types.filter(Boolean),
    }))
    .sort((a, b) => a.id - b.id);
}

/** The full Pokédex, fetched at most once per page load. */
export function fetchPokedex(): Promise<PokemonSummary[]> {
  indexPromise ??= buildIndex().catch((error: unknown) => {
    indexPromise = null;
    throw error;
  });

  return indexPromise;
}

/* ── Filtering ────────────────────────────────────────────────────────────── */

/**
 * Matches a Pokémon by name, dex number or type, case-insensitively.
 * Pure and exported so it can be reasoned about (and tested) without a network.
 */
export function filterPokedex(pokedex: PokemonSummary[], query: string): PokemonSummary[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return pokedex;

  const asNumber = needle.replace('#', '');

  return pokedex.filter(
    (pokemon) =>
      pokemon.name.includes(needle) ||
      String(pokemon.id) === asNumber ||
      pokemon.types.some((type) => type === needle),
  );
}
