'use client';

import Link from 'next/link';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import styles from './index.module.css';

interface DetailNavProps {
  /** Dex ids either side of the current one, or null at the ends. */
  previousId: number | null;
  nextId: number | null;
}

/**
 * Back plus prev/next. Real links, not buttons: with a route per Pokémon these
 * are navigations, so middle-click, right-click and "open in new tab" all work,
 * and the browser's own back button stays meaningful.
 */
export function DetailNav({ previousId, nextId }: DetailNavProps) {
  const t = useTranslation();

  return (
    <div className={styles.bar}>
      <Link className={styles.back} href="/">
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        {t.back}
      </Link>

      <div className={styles.steps}>
        <Step href={previousId} label={t.previous} direction="prev" />
        <Step href={nextId} label={t.next} direction="next" />
      </div>
    </div>
  );
}

function Step({
  href,
  label,
  direction,
}: {
  href: number | null;
  label: string;
  direction: 'prev' | 'next';
}) {
  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={direction === 'prev' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );

  // At either end of the Pokédex there is nowhere to go. A disabled span keeps
  // the control visible without offering a link that leads nowhere.
  if (href === null) {
    return (
      <span className={cn(styles.step, styles.stepDisabled)} aria-disabled="true">
        {icon}
      </span>
    );
  }

  return (
    <Link className={styles.step} href={`/pokemon/${href}`} aria-label={label} title={label}>
      {icon}
    </Link>
  );
}
