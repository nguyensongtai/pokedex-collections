'use client';

import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { PokemonSummary, PokemonTypeName } from '@/shared/types/pokemon';

/**
 * ── State ownership boundary ────────────────────────────────────────────────
 * This store is the ONLY global state in the application, and it lives inside
 * the feature that owns it rather than in a top-level `store/` folder. That
 * makes the global-vs-local boundary self-documenting:
 *
 *   GLOBAL (here)  favourites + groups — crosses routes (browse ↔ favourites),
 *                  survives reloads, and is read by the nav counter.
 *   LOCAL          search query, fetched results, pagination — owned by
 *                  `features/pokemon-browse/hooks/usePokemonSearch`, because
 *                  nothing outside that page cares about them and persisting a
 *                  search box would be noise.
 *
 * Persistence is handled by zustand's `persist` middleware (localStorage), which
 * covers both the state-management and the storage requirement in one pattern.
 * ────────────────────────────────────────────────────────────────────────────
 */

export const UNGROUPED_ID = 'ungrouped';
export const UNGROUPED_NAME = 'Ungrouped';

export const STORAGE_KEY = 'pokedex-collections:favourites';

export interface FavouriteGroup {
  id: string;
  name: string;
  createdAt: number;
}

export interface FavouriteEntry {
  id: number;
  name: string;
  spriteUrl: string | null;
  types: PokemonTypeName[];
  /** `UNGROUPED_ID` for anything not filed into a user-created group. */
  groupId: string;
  addedAt: number;
}

/** What actually gets written to localStorage. Actions are never persisted. */
export interface PersistedFavouritesState {
  favourites: FavouriteEntry[];
  groups: FavouriteGroup[];
}

export interface FavouritesState extends PersistedFavouritesState {
  addFavourite: (pokemon: PokemonSummary, groupId?: string) => void;
  removeFavourite: (pokemonId: number) => void;
  toggleFavourite: (pokemon: PokemonSummary) => void;
  createGroup: (name: string) => string | null;
  renameGroup: (groupId: string, name: string) => void;
  deleteGroup: (groupId: string) => void;
  moveToGroup: (pokemonId: number, groupId: string) => void;
}

/**
 * `Ungrouped` is a *virtual* group: it always exists, can never be renamed or
 * deleted, and is therefore not stored in `groups`. Deleting a real group
 * reassigns its members here instead of destroying them.
 */
export const UNGROUPED_GROUP: FavouriteGroup = {
  id: UNGROUPED_ID,
  name: UNGROUPED_NAME,
  createdAt: 0,
};

/** No-op storage for the server pass, where `window` does not exist. */
const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function createId(): string {
  return globalThis.crypto.randomUUID();
}

function toEntry(pokemon: PokemonSummary, groupId: string): FavouriteEntry {
  return {
    id: pokemon.id,
    name: pokemon.name,
    spriteUrl: pokemon.spriteUrl,
    types: pokemon.types,
    groupId,
    addedAt: Date.now(),
  };
}

export const useFavouritesStore = create<FavouritesState>()(
  persist<FavouritesState, [], [], PersistedFavouritesState>(
    (set, get) => ({
      favourites: [],
      groups: [],

      addFavourite: (pokemon, groupId = UNGROUPED_ID) =>
        set((state) => {
          // Dedupe: adding an existing favourite is a no-op, and never moves it.
          if (state.favourites.some((entry) => entry.id === pokemon.id)) return state;

          const targetExists = groupId === UNGROUPED_ID || state.groups.some((g) => g.id === groupId);
          return {
            ...state,
            favourites: [...state.favourites, toEntry(pokemon, targetExists ? groupId : UNGROUPED_ID)],
          };
        }),

      removeFavourite: (pokemonId) =>
        set((state) => ({
          ...state,
          favourites: state.favourites.filter((entry) => entry.id !== pokemonId),
        })),

      toggleFavourite: (pokemon) => {
        const { favourites, addFavourite, removeFavourite } = get();
        if (favourites.some((entry) => entry.id === pokemon.id)) {
          removeFavourite(pokemon.id);
        } else {
          addFavourite(pokemon);
        }
      },

      createGroup: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return null;

        const id = createId();
        set((state) => ({
          ...state,
          groups: [...state.groups, { id, name: trimmed, createdAt: Date.now() }],
        }));
        return id;
      },

      renameGroup: (groupId, name) =>
        set((state) => {
          const trimmed = name.trim();
          // The virtual Ungrouped section is not renameable.
          if (!trimmed || groupId === UNGROUPED_ID) return state;

          return {
            ...state,
            groups: state.groups.map((group) =>
              group.id === groupId ? { ...group, name: trimmed } : group,
            ),
          };
        }),

      deleteGroup: (groupId) =>
        set((state) => {
          if (groupId === UNGROUPED_ID) return state;

          return {
            ...state,
            groups: state.groups.filter((group) => group.id !== groupId),
            // Deleting a group must never silently delete the Pokémon inside it.
            favourites: state.favourites.map((entry) =>
              entry.groupId === groupId ? { ...entry, groupId: UNGROUPED_ID } : entry,
            ),
          };
        }),

      moveToGroup: (pokemonId, groupId) =>
        set((state) => {
          const targetExists = groupId === UNGROUPED_ID || state.groups.some((g) => g.id === groupId);
          if (!targetExists) return state;

          return {
            ...state,
            favourites: state.favourites.map((entry) =>
              entry.id === pokemonId ? { ...entry, groupId } : entry,
            ),
          };
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? serverStorage : window.localStorage,
      ),
      partialize: (state) => ({ favourites: state.favourites, groups: state.groups }),
    },
  ),
);

/* ── Derivations ──────────────────────────────────────────────────────────── */

export interface GroupedFavourites {
  group: FavouriteGroup;
  entries: FavouriteEntry[];
}

/**
 * Pure selector, exported so it is unit-testable without React.
 * User groups come first in creation order; the virtual Ungrouped section is
 * appended last and only when it actually holds something.
 */
export function groupFavourites(
  favourites: FavouriteEntry[],
  groups: FavouriteGroup[],
): GroupedFavourites[] {
  const sections = groups.map((group) => ({
    group,
    entries: favourites.filter((entry) => entry.groupId === group.id),
  }));

  const knownIds = new Set(groups.map((group) => group.id));
  const ungrouped = favourites.filter((entry) => !knownIds.has(entry.groupId));

  return ungrouped.length > 0 ? [...sections, { group: UNGROUPED_GROUP, entries: ungrouped }] : sections;
}

/* ── Hydration ────────────────────────────────────────────────────────────── */

/**
 * The server renders with an empty store, so any store-dependent UI must wait
 * for `persist` to rehydrate before it can show real values — otherwise React
 * reports a hydration mismatch.
 *
 * `useSyncExternalStore` is the idiomatic fit: the server snapshot is always
 * `false`, React reuses it for the hydration pass so the markup matches, then
 * re-renders with the real client snapshot. Rehydration from localStorage is
 * synchronous, so a naive `useState` + effect would flip a frame too late.
 */
function subscribeToHydration(onStoreChange: () => void): () => void {
  return useFavouritesStore.persist.onFinishHydration(onStoreChange);
}

export function useFavouritesHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToHydration,
    () => useFavouritesStore.persist.hasHydrated(),
    () => false,
  );
}
