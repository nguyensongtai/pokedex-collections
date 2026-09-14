'use client';

import { useEffect, useRef, useState } from 'react';
import { useFavouritesHydrated, useFavouritesStore } from '../../store';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { formatPokemonName, type PokemonSummary } from '@/shared/types/pokemon';
import styles from './index.module.css';

interface FavouriteButtonProps {
  pokemon: PokemonSummary;
  className?: string;
}

/** How long the springy "pop" runs, per the design canvas. */
const POP_MS = 420;

/**
 * Presentation plus a single store action. The add/remove/dedupe rules all live
 * in `store.ts`.
 */
export function FavouriteButton({ pokemon, className }: FavouriteButtonProps) {
  const t = useTranslation();
  const hydrated = useFavouritesHydrated();
  const toggleFavourite = useFavouritesStore((state) => state.toggleFavourite);
  const isFavourite = useFavouritesStore((state) =>
    state.favourites.some((entry) => entry.id === pokemon.id),
  );

  // Transient view state: which button is mid-pop. Scoped here so an already
  // favourited card does not pop again on every page load.
  const [popping, setPopping] = useState(false);
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (popTimer.current) clearTimeout(popTimer.current);
  }, []);

  // Before rehydration the store is empty on both server and client, so render
  // the neutral state to keep the markup identical and avoid a mismatch.
  const pressed = hydrated && isFavourite;
  const displayName = formatPokemonName(pokemon.name);
  const label = pressed ? t.rmFav(displayName) : t.addFav(displayName);

  const handleClick = () => {
    if (!pressed) {
      setPopping(true);
      if (popTimer.current) clearTimeout(popTimer.current);
      popTimer.current = setTimeout(() => setPopping(false), POP_MS);
    }
    toggleFavourite(pokemon);
  };

  return (
    <button
      type="button"
      className={cn(styles.button, popping && styles.popping, className)}
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={handleClick}
    >
      <svg className={styles.heart} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 1 1 7.5-6.6 5 5 0 1 1 7.5 6.6Z" />
      </svg>
    </button>
  );
}
