import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  /** Heading level: `h1` inside a route boundary, `h2` inside a page. */
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

/**
 * The single failure presentation, shared by the route-level error boundaries
 * and the component-level error branch of a data view — so a failure looks the
 * same wherever it is caught.
 */
export function ErrorState({
  title,
  description,
  action,
  headingLevel: Heading = 'h2',
  className,
}: ErrorStateProps) {
  return (
    <div className={cn(styles.card, className)} role="alert">
      <span className={styles.icon} aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" focusable="false">
          <path d="M12 8v5M12 16.5v.5" />
          <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </span>
      <Heading className={styles.title}>{title}</Heading>
      <p className={styles.body}>{description}</p>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
