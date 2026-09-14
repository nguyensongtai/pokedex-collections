'use client';

import { PokemonCard } from '../PokemonCard';
import type { SearchStatus } from '../../hooks/usePokemonSearch';
import { useTranslation } from '@/shared/i18n';
import { Button, ErrorState, Skeleton } from '@/shared/ui';
import type { PokemonSummary } from '@/shared/types/pokemon';
import styles from './index.module.css';

interface PokemonGridProps {
  results: PokemonSummary[];
  status: SearchStatus;
  error: string | null;
  isEmpty: boolean;
  query: string;
  hasMore: boolean;
  remaining: number;
  onShowMore: () => void;
  onRetry: () => void;
}

const SKELETON_COUNT = 12;

/**
 * Every data view in this app handles exactly three states, and this is the
 * component-level half of that pattern (the route-level half is `error.tsx` /
 * `loading.tsx`). It receives all of them as props — it fetches nothing.
 */
export function PokemonGrid({
  results,
  status,
  error,
  isEmpty,
  query,
  hasMore,
  remaining,
  onShowMore,
  onRetry,
}: PokemonGridProps) {
  const t = useTranslation();

  if (status === 'error') {
    return (
      <ErrorState
        title={t.errTitle}
        description={error ? `${error}. ${t.errHint}` : t.errHint}
        action={
          <Button variant="primary" onClick={onRetry}>
            {t.retry}
          </Button>
        }
      />
    );
  }

  if (status === 'loading') {
    return (
      <div className={styles.grid} aria-busy="true" aria-live="polite">
        <span className={styles.srOnly}>{t.loading}</span>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <div key={index} className={styles.skeletonCard}>
            <Skeleton className={styles.skeletonMedia} />
            <Skeleton className={styles.skeletonName} />
            <div className={styles.skeletonTypes}>
              <Skeleton className={styles.skeletonType} />
              <Skeleton className={styles.skeletonType} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyMark} aria-hidden="true" />
        <p className={styles.emptyTitle}>{t.noMatch(query.trim())}</p>
        <p className={styles.emptyHint}>{t.noMatchHint}</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="results-heading">
      <h2 className={styles.srOnly} id="results-heading">
        {t.results}
      </h2>

      <ul className={styles.grid}>
        {results.map((pokemon, index) => (
          <li key={pokemon.id}>
            <PokemonCard pokemon={pokemon} index={index} />
          </li>
        ))}
      </ul>

      {hasMore ? (
        <div className={styles.more}>
          <Button variant="secondary" onClick={onShowMore}>
            {t.showMore(remaining.toLocaleString())}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
