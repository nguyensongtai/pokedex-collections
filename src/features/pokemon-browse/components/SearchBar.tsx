'use client';

import { Spinner } from '@/shared/ui';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  /** Result count for the live region; null while unknown. */
  resultCount: number | null;
  isBusy?: boolean;
}

/** Pure presentation — the debounce and filtering live in `usePokemonSearch`. */
export function SearchBar({ value, onChange, resultCount, isBusy = false }: SearchBarProps) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="pokemon-search">
        Search Pokémon
      </label>

      <div className={styles.field}>
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>

        <input
          id="pokemon-search"
          className={styles.input}
          type="search"
          value={value}
          placeholder="Try “char”, “pikachu”, “mega”…"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />

        {isBusy ? <Spinner className={styles.spinner} label="Searching" /> : null}
      </div>

      <p className={styles.status} role="status">
        {resultCount === null
          ? 'Loading the Pokédex…'
          : `${resultCount.toLocaleString()} ${resultCount === 1 ? 'result' : 'results'}`}
      </p>
    </div>
  );
}
