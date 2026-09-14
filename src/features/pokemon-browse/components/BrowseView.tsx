'use client';

import { usePokemonSearch } from '../hooks/usePokemonSearch';
import { PokemonGrid } from './PokemonGrid';
import { SearchBar } from './SearchBar';
import styles from './BrowseView.module.css';

/**
 * Container for the browse route: it runs the feature's hook and wires the
 * result into presentation components. `app/page.tsx` stays a server component
 * that only composes this, so route files keep zero business logic.
 */
export function BrowseView() {
  const {
    query,
    setQuery,
    results,
    status,
    error,
    isEmpty,
    totalMatches,
    hasMore,
    isLoadingMore,
    loadMore,
    retry,
  } = usePokemonSearch();

  return (
    <div className={styles.view}>
      <SearchBar
        value={query}
        onChange={setQuery}
        resultCount={status === 'error' ? null : totalMatches}
        isBusy={status === 'loading' || isLoadingMore}
      />

      <PokemonGrid
        results={results}
        status={status}
        error={error}
        isEmpty={isEmpty}
        query={query}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        onRetry={retry}
      />
    </div>
  );
}
