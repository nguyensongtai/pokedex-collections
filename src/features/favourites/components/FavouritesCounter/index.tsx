'use client';

import { useState } from 'react';
import { useFavouritesHydrated, useFavouritesStore } from '../../store';
import { cn } from '@/shared/lib';
import styles from './index.module.css';

/**
 * Live favourites badge for the nav. Owned by this feature because it reads
 * this feature's store — the shell only composes it.
 */
export function FavouritesCounter() {
  const hydrated = useFavouritesHydrated();
  const count = useFavouritesStore((state) => state.favourites.length);

  // React's documented "adjust state during render" pattern, so the badge pops
  // when the count grows but not when it shrinks, and never on first paint.
  const [previous, setPrevious] = useState(count);
  const [popping, setPopping] = useState(false);
  if (count !== previous) {
    setPrevious(count);
    setPopping(count > previous);
  }

  // Render nothing until rehydration so SSR and CSR markup agree.
  if (!hydrated || count === 0) return null;

  return (
    <span className={cn(styles.badge, popping && styles.popping)} aria-hidden="true">
      {count > 99 ? '99+' : count}
    </span>
  );
}
