/**
 * Pokémon domain types shared across features.
 *
 * This module is intentionally the *only* place where the Pokémon domain model is
 * defined: both `features/pokemon-browse` (which fetches it) and
 * `features/favourites` (which stores it) depend on the same shape, so neither
 * feature has to reach into the other for a type.
 *
 * It contains types + plain data constants only — no React, no fetching.
 */

/** Canonical PokeAPI type slugs. */
export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
  'stellar',
  'unknown',
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

/**
 * The normalised shape every feature works with. Deliberately much smaller than
 * the raw PokeAPI payload — `features/pokemon-browse/api.ts` maps into this so
 * the rest of the app never sees the wire format.
 */
export interface PokemonSummary {
  id: number;
  name: string;
  /** `official-artwork` sprite; PokeAPI genuinely returns null for some forms. */
  spriteUrl: string | null;
  types: PokemonTypeName[];
}

/**
 * Canonical Pokémon type colours.
 *
 * Lives in the domain module rather than in a feature because both the browse
 * grid and the favourites board render type badges. `shared/ui/Badge` stays
 * domain-agnostic by accepting a colour, so neither feature needs the other.
 */
export const POKEMON_TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: '#a8a77a',
  fire: '#ee8130',
  water: '#6390f0',
  electric: '#e0b400',
  grass: '#54a83c',
  ice: '#4fb3ae',
  fighting: '#c22e28',
  poison: '#a33ea1',
  ground: '#b98c35',
  flying: '#8b76e8',
  psychic: '#f95587',
  bug: '#8a9a16',
  rock: '#9a8a2e',
  ghost: '#735797',
  dragon: '#6f35fc',
  dark: '#6b5346',
  steel: '#8a8aa8',
  fairy: '#d685ad',
  stellar: '#3fa99a',
  unknown: '#68a090',
};

/** Narrows an arbitrary PokeAPI type slug onto our union without using `any`. */
export function toPokemonTypeName(value: string): PokemonTypeName {
  return (POKEMON_TYPES as readonly string[]).includes(value)
    ? (value as PokemonTypeName)
    : 'unknown';
}

/** `deoxys-attack` -> `Deoxys Attack`. Display-only formatting. */
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
