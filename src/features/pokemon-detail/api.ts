/**
 * PokeAPI access for the detail route. Zero JSX, zero React.
 *
 * Unlike `pokemon-browse`, this runs on the **server**: the route is a server
 * component, so these `fetch` calls happen during the render on the server and
 * their results are cached by Next. PokeAPI's entity data never changes in
 * practice, so it is revalidated monthly rather than per request.
 */

import {
  artworkUrl,
  formatPokemonName,
  isPokemonTypeName,
  type PokemonSummary,
  type PokemonTypeName,
} from '@/shared/types/pokemon';

const API_BASE = 'https://pokeapi.co/api/v2';

/** Entity data is effectively immutable; a month is a safe revalidation floor. */
const REVALIDATE_SECONDS = 60 * 60 * 24 * 30;

/** The six base stats, in the order PokeAPI returns them. */
export const STAT_KEYS = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

/** The highest base stat any Pokémon has, used to scale the bars. */
export const MAX_BASE_STAT = 255;

/* ── Wire formats ─────────────────────────────────────────────────────────── */

interface PokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: Array<{ slot: number; type: { name: string } }>;
  abilities: Array<{ is_hidden: boolean; ability: { name: string } }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
}

interface SpeciesResponse {
  genera: Array<{ genus: string; language: { name: string } }>;
  flavor_text_entries: Array<{ flavor_text: string; language: { name: string } }>;
}

interface CountResponse {
  count: number;
}

/* ── Normalised shape ─────────────────────────────────────────────────────── */

export interface PokemonAbility {
  name: string;
  hidden: boolean;
}

export interface PokemonStat {
  key: StatKey;
  value: number;
}

export interface PokemonDetail {
  id: number;
  name: string;
  types: PokemonTypeName[];
  spriteUrl: string;
  /** Metres — PokeAPI reports decimetres. */
  heightM: number;
  /** Kilograms — PokeAPI reports hectograms. */
  weightKg: number;
  baseExperience: number | null;
  abilities: PokemonAbility[];
  stats: PokemonStat[];
  /** "Seed Pokémon". Empty when the species lookup has no English genus. */
  genus: string;
  /** Pokédex entry prose. Empty when the species lookup fails. */
  flavorText: string;
}

/** The subset the favourites feature stores, derived without another request. */
export function toSummary(detail: PokemonDetail): PokemonSummary {
  return {
    id: detail.id,
    name: detail.name,
    spriteUrl: detail.spriteUrl,
    types: detail.types,
  };
}

/* ── Fetching ─────────────────────────────────────────────────────────────── */

function isStatKey(value: string): value is StatKey {
  return (STAT_KEYS as readonly string[]).includes(value);
}

/**
 * PokeAPI has no Vietnamese localisation, so English is the only available
 * source for genus and flavour text in both locales.
 */
const SOURCE_LANGUAGE = 'en';

function cleanFlavorText(text: string): string {
  // Entries are hard-wrapped with form feeds and newlines for the original
  // cartridge screens.
  return text.replace(/[\f\n\r­]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Loads one Pokémon. Returns `null` for an id PokeAPI does not know, which the
 * route turns into a 404 rather than an error page.
 *
 * The species lookup is best-effort: it only supplies prose, so a failure
 * degrades to a detail page without a description instead of no page at all.
 */
export async function fetchPokemonDetail(id: number): Promise<PokemonDetail | null> {
  const response = await fetch(`${API_BASE}/pokemon/${id}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`PokéAPI responded ${response.status}`);

  const pokemon = (await response.json()) as PokemonResponse;

  const species = await fetch(`${API_BASE}/pokemon-species/${id}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  })
    .then((result) => (result.ok ? (result.json() as Promise<SpeciesResponse>) : null))
    .catch(() => null);

  const genus =
    species?.genera.find((entry) => entry.language.name === SOURCE_LANGUAGE)?.genus ?? '';
  const flavor = species?.flavor_text_entries.find(
    (entry) => entry.language.name === SOURCE_LANGUAGE,
  )?.flavor_text;

  return {
    id: pokemon.id,
    name: pokemon.name,
    spriteUrl: artworkUrl(pokemon.id),
    types: [...pokemon.types]
      .sort((a, b) => a.slot - b.slot)
      .map((slot) => slot.type.name)
      .filter(isPokemonTypeName),
    heightM: pokemon.height / 10,
    weightKg: pokemon.weight / 10,
    baseExperience: pokemon.base_experience,
    abilities: pokemon.abilities.map((entry) => ({
      name: formatPokemonName(entry.ability.name),
      hidden: entry.is_hidden,
    })),
    stats: pokemon.stats
      .map((entry) => ({ key: entry.stat.name, value: entry.base_stat }))
      .filter((entry): entry is PokemonStat => isStatKey(entry.key)),
    genus,
    flavorText: flavor ? cleanFlavorText(flavor) : '',
  };
}

/**
 * How many base-form Pokémon exist, so the detail route knows where prev/next
 * run out. Asking the API beats hard-coding a number that goes stale with every
 * new generation.
 */
export async function fetchDexSize(): Promise<number> {
  const response = await fetch(`${API_BASE}/pokemon-species?limit=1`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) throw new Error(`PokéAPI responded ${response.status}`);

  const { count } = (await response.json()) as CountResponse;
  return count;
}
