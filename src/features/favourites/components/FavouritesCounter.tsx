'use client';

import { useFavouritesStore, useFavouritesHydrated } from '../store';
import styles from './FavouritesCounter.module.css';

/**
 * Live favourites badge for the nav. Owned by this feature because it reads this
 * feature's store — `app/layout.tsx` only composes it.
 */
export function FavouritesCounter() {
  const hydrated = useFavouritesHydrated();
  const count = useFavouritesStore((state) => state.favourites.length);

  // Render a stable placeholder until rehydration so SSR and CSR markup agree.
  if (!hydrated || count === 0) {
    return null;
  }

  return (
    <span className={styles.badge} aria-hidden="true">
      {count > 99 ? '99+' : count}
    </span>
  );
}
