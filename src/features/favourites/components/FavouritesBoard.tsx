'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import {
  UNGROUPED_ID,
  groupFavourites,
  useFavouritesHydrated,
  useFavouritesStore,
} from '../store';
import { GroupSection } from './GroupSection';
import { useTranslation } from '@/shared/i18n';
import { Button, Skeleton } from '@/shared/ui';
import styles from './FavouritesBoard.module.css';

/**
 * Container for the favourites route. `app/favourites/page.tsx` stays a server
 * component that only composes this, keeping route files free of logic.
 *
 * Three handled states, same as every other data view in the app:
 *   loading — waiting for `persist` to rehydrate from localStorage
 *   empty   — hydrated but nothing favourited yet
 *   ready   — the grouped board
 * There is no error branch: reading local state cannot fail, and an unreadable
 * localStorage simply rehydrates to the empty state.
 */
export function FavouritesBoard() {
  const t = useTranslation();
  const router = useRouter();
  const hydrated = useFavouritesHydrated();
  const favourites = useFavouritesStore((state) => state.favourites);
  const groups = useFavouritesStore((state) => state.groups);
  const createGroup = useFavouritesStore((state) => state.createGroup);

  const [newGroup, setNewGroup] = useState('');

  // Derived in the component, not stored: keeping the store minimal avoids
  // referential-identity churn in selectors.
  const sections = useMemo(() => groupFavourites(favourites, groups), [favourites, groups]);

  // The virtual section is "Unsorted" once real groups exist, and simply
  // "All favourites" while it is the whole board.
  const ungroupedLabel = groups.length > 0 ? t.unsorted : t.allFavourites;
  const hasFavourites = favourites.length > 0;

  // The design's summary string always names a group count, which reads as
  // "3 Pokémon in 0 groups" before the user has made one. Falling back to the
  // plain count keeps the sentence true at every stage.
  const summary = !hasFavourites
    ? t.nothingSaved
    : groups.length === 0
      ? t.count(favourites.length)
      : t.summary(favourites.length, groups.length);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The store is the source of truth for validation; it rejects blank names.
    if (createGroup(newGroup)) setNewGroup('');
  };

  if (!hydrated) {
    return (
      <div className={styles.loading} aria-busy="true">
        <span className={styles.srOnly}>{t.loading}</span>
        <Skeleton className={styles.loadingTitle} />
        <div className={styles.loadingGrid}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className={styles.loadingRow} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.favourites}</h1>
          <p className={styles.summary}>{summary}</p>
        </div>

        {hasFavourites ? (
          <form className={styles.createForm} onSubmit={handleCreate}>
            <input
              className={styles.input}
              type="text"
              value={newGroup}
              maxLength={40}
              placeholder={t.newGroupPlaceholder}
              aria-label={t.newGroupPlaceholder}
              autoComplete="off"
              onChange={(event) => setNewGroup(event.target.value)}
            />
            <Button type="submit" variant="ink" disabled={newGroup.trim().length === 0}>
              {t.createGroup}
            </Button>
          </form>
        ) : null}
      </div>

      {hasFavourites ? (
        <div className={styles.sections}>
          {sections.map((section) => (
            <GroupSection
              key={section.group.id}
              section={section}
              groups={groups}
              label={section.group.id === UNGROUPED_ID ? ungroupedLabel : section.group.name}
            />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <div className={styles.emptyArt} aria-hidden="true">
            <span className={styles.ghostLeft}>
              <span />
            </span>
            <span className={styles.ghostCenter}>
              <svg width="34" height="34" viewBox="0 0 24 24" focusable="false">
                <path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 1 1 7.5-6.6 5 5 0 1 1 7.5 6.6Z" />
              </svg>
            </span>
            <span className={styles.ghostRight}>
              <span />
            </span>
          </div>

          <h2 className={styles.emptyTitle}>{t.emptyTitle}</h2>
          <p className={styles.emptyBody}>{t.emptyBody}</p>
          <Button variant="primary" size="lg" onClick={() => router.push('/')}>
            {t.browseCta}
          </Button>
        </div>
      )}
    </>
  );
}
