'use client';

import { PokemonCard } from './PokemonCard';
import { PAGE_SIZE } from '../api';
import type { SearchStatus } from '../hooks/usePokemonSearch';
import { Button, EmptyState, Skeleton, Spinner } from '@/shared/ui';
import type { PokemonSummary } from '@/shared/types/pokemon';
import styles from './PokemonGrid.module.css';

interface PokemonGridProps {
  results: PokemonSummary[];
  status: SearchStatus;
  error: string | null;
  isEmpty: boolean;
  query: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}

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
  isLoadingMore,
  onLoadMore,
  onRetry,
}: PokemonGridProps) {
  if (status === 'error') {
    return (
      <EmptyState
        tone="error"
        icon="⚠️"
        title="We couldn’t load the Pokédex"
        description={error ?? 'Something went wrong. Please try again.'}
        action={
          <Button variant="primary" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }

  if (status === 'loading') {
    return (
      <div className={styles.grid} aria-busy="true" aria-live="polite">
        <span className={styles.srOnly}>Loading Pokémon</span>
        {Array.from({ length: PAGE_SIZE }, (_, index) => (
          <Skeleton key={index} className={styles.skeleton} />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon="🔍"
        title={query.trim() ? `No Pokémon match “${query.trim()}”` : 'No Pokémon to show'}
        description="Try a shorter search — partial names like “char” or “eon” work well."
      />
    );
  }

  return (
    <>
      <ul className={styles.grid}>
        {results.map((pokemon, index) => (
          <li key={pokemon.id}>
            <PokemonCard pokemon={pokemon} index={index} />
          </li>
        ))}
      </ul>

      {hasMore ? (
        <div className={styles.more}>
          <Button variant="secondary" onClick={onLoadMore} disabled={isLoadingMore}>
            {isLoadingMore ? <Spinner label={null} /> : null}
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </>
  );
}
