'use client';

import Link from 'next/link';
import { useTranslation } from '@/shared/i18n';
import { ErrorState } from '@/shared/ui';
import styles from './index.module.css';

/** Shown when the route's id is not a Pokémon PokeAPI knows about. */
export function NotFoundState() {
  const t = useTranslation();

  return (
    <ErrorState
      headingLevel="h1"
      title={t.notFound}
      description={t.notFoundHint}
      action={
        <Link className={styles.link} href="/">
          {t.browseCta}
        </Link>
      }
    />
  );
}
