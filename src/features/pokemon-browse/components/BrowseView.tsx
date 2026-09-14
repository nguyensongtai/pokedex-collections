'use client';

import { usePokemonSearch } from '../hooks/usePokemonSearch';
import { PokemonGrid } from './PokemonGrid';
import { SearchBar } from './SearchBar';
import { useTranslation } from '@/shared/i18n';
import styles from './BrowseView.module.css';

/**
 * Container for the browse route: it runs the feature's hook and wires the
 * result into presentation components. `app/page.tsx` stays a server component
 * that only composes this, so route files keep zero business logic.
 */
export function BrowseView() {
  const t = useTranslation();
  const {
    query,
    setQuery,
    clearQuery,
    results,
    status,
    error,
    isEmpty,
    totalMatches,
    totalPokemon,
    hasMore,
    remaining,
    showMore,
    retry,
  } = usePokemonSearch();

  const resultLabel =
    status === 'loading'
      ? t.loading
      : status === 'error'
        ? ''
        : query.trim()
          ? `${totalMatches.toLocaleString()} ${t.of} ${totalPokemon.toLocaleString()} ${t.pokemon}`
          : `${totalPokemon.toLocaleString()} ${t.pokemon}`;

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.browse}</h1>
          <p className={styles.resultLabel} role="status">
            {resultLabel}
          </p>
        </div>

        <SearchBar value={query} onChange={setQuery} onClear={clearQuery} />
      </div>

      <PokemonGrid
        results={results}
        status={status}
        error={error}
        isEmpty={isEmpty}
        query={query}
        hasMore={hasMore}
        remaining={remaining}
        onShowMore={showMore}
        onRetry={retry}
      />
    </>
  );
}
