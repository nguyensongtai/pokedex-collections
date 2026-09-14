import { beforeEach, describe, expect, it } from 'vitest';
import {
  UNGROUPED_ID,
  UNGROUPED_NAME,
  groupFavourites,
  useFavouritesStore,
  type FavouriteEntry,
  type FavouriteGroup,
} from './store';
import type { PokemonSummary } from '@/shared/types/pokemon';

/**
 * Unit tests are scoped to the store because that is where every business rule
 * lives: dedupe, the virtual Ungrouped group, and the "deleting a group never
 * deletes its Pokémon" guarantee. Components are thin enough that rendering
 * them would test React, not this app.
 */

const pikachu: PokemonSummary = {
  id: 25,
  name: 'pikachu',
  spriteUrl: 'https://example.test/pikachu.png',
  types: ['electric'],
};

const bulbasaur: PokemonSummary = {
  id: 1,
  name: 'bulbasaur',
  spriteUrl: null,
  types: ['grass', 'poison'],
};

const store = () => useFavouritesStore.getState();

beforeEach(() => {
  useFavouritesStore.setState({ favourites: [], groups: [] });
});

describe('favourites', () => {
  it('adds a favourite into the virtual Ungrouped section by default', () => {
    store().addFavourite(pikachu);

    const [entry] = store().favourites;
    expect(store().favourites).toHaveLength(1);
    expect(entry.id).toBe(25);
    expect(entry.name).toBe('pikachu');
    expect(entry.types).toEqual(['electric']);
    expect(entry.groupId).toBe(UNGROUPED_ID);
    // Ungrouped is virtual — it is never materialised into `groups`.
    expect(store().groups).toHaveLength(0);
  });

  it('dedupes on double-add and keeps the original grouping', () => {
    const groupId = store().createGroup('Team');
    expect(groupId).not.toBeNull();

    store().addFavourite(pikachu, groupId as string);
    store().addFavourite(pikachu);

    expect(store().favourites).toHaveLength(1);
    expect(store().favourites[0].groupId).toBe(groupId);
  });

  it('removes a favourite by id and leaves the others alone', () => {
    store().addFavourite(pikachu);
    store().addFavourite(bulbasaur);

    store().removeFavourite(pikachu.id);

    expect(store().favourites.map((entry) => entry.id)).toEqual([bulbasaur.id]);
  });

  it('toggles a favourite on and back off', () => {
    store().toggleFavourite(pikachu);
    expect(store().favourites).toHaveLength(1);

    store().toggleFavourite(pikachu);
    expect(store().favourites).toHaveLength(0);
  });
});

describe('groups', () => {
  it('creates a group with a trimmed name and rejects blank names', () => {
    const id = store().createGroup('  Battle team  ');

    expect(id).toBeTypeOf('string');
    expect(store().groups).toHaveLength(1);
    expect(store().groups[0].name).toBe('Battle team');

    expect(store().createGroup('   ')).toBeNull();
    expect(store().groups).toHaveLength(1);
  });

  it('renames a group, ignoring blank names and the virtual Ungrouped group', () => {
    const id = store().createGroup('Old name') as string;

    store().renameGroup(id, '  New name  ');
    expect(store().groups[0].name).toBe('New name');

    store().renameGroup(id, '  ');
    expect(store().groups[0].name).toBe('New name');

    store().renameGroup(UNGROUPED_ID, 'Renamed ungrouped');
    expect(store().groups).toHaveLength(1);
  });

  it('deleting a group reassigns its members to Ungrouped instead of deleting them', () => {
    const id = store().createGroup('Doomed') as string;
    store().addFavourite(pikachu, id);
    store().addFavourite(bulbasaur, id);

    store().deleteGroup(id);

    expect(store().groups).toHaveLength(0);
    expect(store().favourites).toHaveLength(2);
    expect(store().favourites.every((entry) => entry.groupId === UNGROUPED_ID)).toBe(true);
  });

  it('moves a favourite between groups', () => {
    const from = store().createGroup('From') as string;
    const to = store().createGroup('To') as string;
    store().addFavourite(pikachu, from);

    store().moveToGroup(pikachu.id, to);
    expect(store().favourites[0].groupId).toBe(to);

    store().moveToGroup(pikachu.id, UNGROUPED_ID);
    expect(store().favourites[0].groupId).toBe(UNGROUPED_ID);
  });

  it('ignores a move to a group that does not exist', () => {
    store().addFavourite(pikachu);

    store().moveToGroup(pikachu.id, 'does-not-exist');

    expect(store().favourites[0].groupId).toBe(UNGROUPED_ID);
  });
});

describe('derivation', () => {
  it('lists user groups in creation order with Ungrouped last', () => {
    const first = store().createGroup('First') as string;
    store().createGroup('Second');
    store().addFavourite(pikachu, first);
    store().addFavourite(bulbasaur);

    const sections = groupFavourites(store().favourites, store().groups);

    expect(sections.map((section) => section.group.name)).toEqual([
      'First',
      'Second',
      UNGROUPED_NAME,
    ]);
    expect(sections[0].entries.map((entry) => entry.id)).toEqual([pikachu.id]);
    expect(sections[1].entries).toEqual([]);
    expect(sections[2].entries.map((entry) => entry.id)).toEqual([bulbasaur.id]);
  });

  it('omits the Ungrouped section when nothing is ungrouped', () => {
    const id = store().createGroup('Only') as string;
    store().addFavourite(pikachu, id);

    const sections = groupFavourites(store().favourites, store().groups);

    expect(sections).toHaveLength(1);
    expect(sections[0].group.id).toBe(id);
  });
});

describe('hydration', () => {
  it('keeps a usable state shape after rehydrating persisted JSON', () => {
    const group: FavouriteGroup = { id: 'g1', name: 'Saved team', createdAt: 1 };
    const entry: FavouriteEntry = {
      id: 25,
      name: 'pikachu',
      spriteUrl: null,
      types: ['electric'],
      groupId: 'g1',
      addedAt: 2,
    };

    // Round-trip through JSON exactly as `persist` would.
    const persisted = JSON.parse(JSON.stringify({ favourites: [entry], groups: [group] })) as {
      favourites: FavouriteEntry[];
      groups: FavouriteGroup[];
    };
    useFavouritesStore.setState(persisted);

    expect(store().favourites).toEqual([entry]);
    expect(store().groups).toEqual([group]);
    // Actions survive rehydration — persist only replaces the data slice.
    expect(store().addFavourite).toBeTypeOf('function');
    expect(store().deleteGroup).toBeTypeOf('function');

    // And the rehydrated state still behaves.
    store().deleteGroup('g1');
    expect(store().favourites[0].groupId).toBe(UNGROUPED_ID);
  });
});
