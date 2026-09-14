/**
 * Pokémon domain types shared across features.
 *
 * This module is intentionally the *only* place where the Pokémon domain model
 * is defined: both `features/pokemon-browse` (which fetches it) and
 * `features/favourites` (which stores it) depend on the same shape, so neither
 * feature has to reach into the other for a type.
 *
 * Types + plain data constants only — no React, no fetching.
 */

/**
 * The 18 canonical PokeAPI type slugs, in PokeAPI's own id order (1-18), which
 * is also the order `api.ts` walks when it builds the index.
 */
export const POKEMON_TYPES = [
  'normal',
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

/** The normalised shape every feature works with. */
export interface PokemonSummary {
  id: number;
  /** PokeAPI slug, e.g. `mr-mime`. */
  name: string;
  /** `official-artwork` sprite, derived from the id. */
  spriteUrl: string;
  types: PokemonTypeName[];
}

/**
 * Canonical Pokémon type colours, taken from the design canvas.
 *
 * Lives in the domain module rather than in a feature because both the browse
 * grid and the favourites board render type badges. `shared/ui/Badge` stays
 * domain-agnostic by accepting a colour, so neither feature needs the other.
 */
export const POKEMON_TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: '#a8a77a',
  fighting: '#c22e28',
  flying: '#a98ff3',
  poison: '#a33ea1',
  ground: '#e2bf65',
  rock: '#b6a136',
  bug: '#a6b91a',
  ghost: '#735797',
  steel: '#b7b7ce',
  fire: '#ee8130',
  water: '#6390f0',
  grass: '#7ac74c',
  electric: '#f7d02c',
  psychic: '#f95587',
  ice: '#96d9d6',
  dragon: '#6f35fc',
  dark: '#705746',
  fairy: '#d685ad',
};

/** Fallback for a slug PokeAPI adds after this was written. */
export const UNKNOWN_TYPE_COLOR = '#999999';

export function typeColor(type: string): string {
  return POKEMON_TYPE_COLORS[type as PokemonTypeName] ?? UNKNOWN_TYPE_COLOR;
}

/** Narrows an arbitrary PokeAPI type slug onto our union without using `any`. */
export function isPokemonTypeName(value: string): value is PokemonTypeName {
  return (POKEMON_TYPES as readonly string[]).includes(value);
}

/** Official artwork lives at a stable, id-addressable URL. */
export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

/** `deoxys-attack` -> `Deoxys Attack`. Display-only formatting. */
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** `25` -> `#0025`. */
export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}
