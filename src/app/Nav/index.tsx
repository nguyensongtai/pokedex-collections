'use client';

import Link from 'next/link';
// The shell composes features through their public API only.
import { FavouritesCounter } from '@/features/favourites';
import { LanguageToggle, useTranslation } from '@/shared/i18n';
import { NavLink } from '@/shared/ui';
import styles from './index.module.css';

/**
 * The app shell's navigation. A single client boundary — it reads the
 * favourites store, the language store and the current pathname — which lets
 * `layout.tsx` stay a server component that can export `metadata`.
 *
 * Composition only: every piece here comes from a feature or from `shared`.
 */
export function Nav() {
  const t = useTranslation();

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Primary">
        <Link className={styles.brand} href="/" aria-label={t.home}>
          <span className={styles.mark} aria-hidden="true" />
          <span className={styles.brandText}>PokéDex Collections</span>
        </Link>

        <div className={styles.links}>
          <NavLink href="/">{t.browse}</NavLink>
          <NavLink href="/favourites">
            {t.favourites}
            <FavouritesCounter />
          </NavLink>
          <LanguageToggle />
        </div>
      </nav>
    </header>
  );
}
