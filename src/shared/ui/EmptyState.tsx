import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  /** Decorative glyph — hidden from assistive tech. */
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** `error` tints the surface; used by the error branch of data views. */
  tone?: 'neutral' | 'error';
}

/**
 * The single presentation used for both "nothing here" and "something failed",
 * so every data view can render its empty/error states consistently.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  tone = 'neutral',
}: EmptyStateProps) {
  return (
    <div className={cn(styles.empty, tone === 'error' && styles.error, className)}>
      {icon ? (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      ) : null}
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
