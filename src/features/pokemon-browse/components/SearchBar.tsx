'use client';

import { useTranslation } from '@/shared/i18n';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

/** Pure presentation — debounce and filtering live in `usePokemonSearch`. */
export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const t = useTranslation();

  return (
    <div className={styles.field}>
      <svg
        className={styles.icon}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>

      <input
        id="pokemon-search"
        className={styles.input}
        type="search"
        value={value}
        placeholder={t.searchPlaceholder}
        aria-label={t.searchPlaceholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />

      {value.length > 0 ? (
        <button type="button" className={styles.clear} aria-label={t.clear} onClick={onClear}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
