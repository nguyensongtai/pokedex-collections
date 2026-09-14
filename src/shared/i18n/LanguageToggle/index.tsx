'use client';

import { LANGUAGES, LANGUAGE_LABELS } from '../dictionary';
import { useLanguage, useLanguageStore, useTranslation } from '../store';
import { cn } from '@/shared/lib';
import styles from './index.module.css';

/** Segmented EN / VI control for the nav. */
export function LanguageToggle() {
  const t = useTranslation();
  const active = useLanguage();
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  return (
    <div className={styles.group} role="group" aria-label={t.language}>
      {LANGUAGES.map((language) => (
        <button
          key={language}
          type="button"
          className={cn(styles.option, language === active && styles.active)}
          aria-pressed={language === active}
          onClick={() => setLanguage(language)}
        >
          {LANGUAGE_LABELS[language]}
        </button>
      ))}
    </div>
  );
}
