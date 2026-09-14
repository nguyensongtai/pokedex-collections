'use client';

import { useFavouritesStore, useFavouritesHydrated } from '../store';
import { formatPokemonName, type PokemonSummary } from '@/shared/types/pokemon';
import { cn } from '@/shared/lib';
import styles from './FavouriteButton.module.css';

interface FavouriteButtonProps {
  pokemon: PokemonSummary;
  className?: string;
}

/**
 * Presentation + a single store action. No fetching, no business rules — the
 * add/remove/dedupe logic all lives in `store.ts`.
 */
export function FavouriteButton({ pokemon, className }: FavouriteButtonProps) {
  const hydrated = useFavouritesHydrated();
  const toggleFavourite = useFavouritesStore((state) => state.toggleFavourite);
  const isFavourite = useFavouritesStore((state) =>
    state.favourites.some((entry) => entry.id === pokemon.id),
  );

  // Before rehydration the store is empty on both server and client, so render
  // the neutral state to keep the markup identical and avoid a mismatch.
  const pressed = hydrated && isFavourite;
  const label = `${pressed ? 'Remove' : 'Add'} ${formatPokemonName(pokemon.name)} ${
    pressed ? 'from' : 'to'
  } favourites`;

  return (
    <button
      type="button"
      className={cn(styles.button, className)}
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={() => toggleFavourite(pokemon)}
    >
      <svg className={styles.heart} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 20.7 4.6 13.3a4.8 4.8 0 0 1 0-6.8 4.8 4.8 0 0 1 6.8 0l.6.6.6-.6a4.8 4.8 0 0 1 6.8 0 4.8 4.8 0 0 1 0 6.8Z" />
      </svg>
    </button>
  );
}
