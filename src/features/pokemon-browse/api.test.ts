import { describe, expect, it } from 'vitest';
import { filterPokedex } from './api';
import { artworkUrl, type PokemonSummary } from '@/shared/types/pokemon';

/**
 * `filterPokedex` is the other place a business rule lives: the design's search
 * box matches on name, dex number *or* type, and it is a pure function, so it
 * is worth pinning down without a network or a DOM.
 */

const pokemon = (id: number, name: string, types: PokemonSummary['types']): PokemonSummary => ({
  id,
  name,
  spriteUrl: artworkUrl(id),
  types,
});

const POKEDEX: PokemonSummary[] = [
  pokemon(1, 'bulbasaur', ['grass', 'poison']),
  pokemon(4, 'charmander', ['fire']),
  pokemon(25, 'pikachu', ['electric']),
  pokemon(122, 'mr-mime', ['psychic', 'fairy']),
];

const names = (list: PokemonSummary[]) => list.map((entry) => entry.name);

describe('filterPokedex', () => {
  it('returns everything for a blank or whitespace query', () => {
    expect(filterPokedex(POKEDEX, '')).toHaveLength(4);
    expect(filterPokedex(POKEDEX, '   ')).toHaveLength(4);
  });

  it('matches part of a name, case-insensitively', () => {
    expect(names(filterPokedex(POKEDEX, 'CHAR'))).toEqual(['charmander']);
    expect(names(filterPokedex(POKEDEX, 'mime'))).toEqual(['mr-mime']);
  });

  it('matches an exact dex number, with or without the hash', () => {
    expect(names(filterPokedex(POKEDEX, '25'))).toEqual(['pikachu']);
    expect(names(filterPokedex(POKEDEX, '#25'))).toEqual(['pikachu']);
    // Partial numbers would make "2" match a third of the Pokédex.
    expect(filterPokedex(POKEDEX, '2')).toHaveLength(0);
  });

  it('matches a full type name, including a secondary type', () => {
    expect(names(filterPokedex(POKEDEX, 'fire'))).toEqual(['charmander']);
    expect(names(filterPokedex(POKEDEX, 'poison'))).toEqual(['bulbasaur']);
    expect(names(filterPokedex(POKEDEX, 'fairy'))).toEqual(['mr-mime']);
  });

  it('returns nothing when there is no match', () => {
    expect(filterPokedex(POKEDEX, 'zzqq')).toEqual([]);
  });
});
