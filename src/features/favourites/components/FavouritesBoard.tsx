'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { groupFavourites, useFavouritesHydrated, useFavouritesStore } from '../store';
import { GroupManager } from './GroupManager';
import { GroupSection } from './GroupSection';
import { EmptyState, Skeleton } from '@/shared/ui';
import styles from './FavouritesBoard.module.css';

/**
 * Container for the favourites route. `app/favourites/page.tsx` stays a server
 * component that only composes this, keeping route files free of logic.
 *
 * Three handled states, same as every other data view in the app:
 *   loading  — waiting for `persist` to rehydrate from localStorage
 *   empty    — hydrated but nothing favourited yet
 *   ready    — grouped board
 * There is no error branch here because reading local state cannot fail; an
 * unreadable localStorage simply rehydrates to the empty state.
 */
export function FavouritesBoard() {
  const hydrated = useFavouritesHydrated();
  const favourites = useFavouritesStore((state) => state.favourites);
  const groups = useFavouritesStore((state) => state.groups);

  // Derived in the component, not stored: keeping the store minimal avoids
  // referential-identity churn in selectors.
  const sections = useMemo(() => groupFavourites(favourites, groups), [favourites, groups]);

  if (!hydrated) {
    return (
      <div className={styles.loading} aria-busy="true" aria-live="polite">
        <span className={styles.srOnly}>Loading your favourites</span>
        <Skeleton className={styles.loadingBar} />
        <div className={styles.loadingGrid}>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className={styles.loadingCard} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.board}>
      <GroupManager />

      {favourites.length === 0 ? (
        <EmptyState
          title="No favourites yet"
          description={
            <>
              Tap the heart on any Pokémon to start your collection, then file them into groups.{' '}
              <Link className={styles.link} href="/">
                Browse Pokémon
              </Link>
              .
            </>
          }
          icon="✨"
        />
      ) : (
        <div className={styles.sections}>
          {sections.map((section) => (
            <GroupSection key={section.group.id} section={section} groups={groups} />
          ))}
        </div>
      )}
    </div>
  );
}
