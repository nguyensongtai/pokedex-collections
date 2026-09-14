import { cn } from '@/shared/lib';
import styles from './Spinner.module.css';

interface SpinnerProps {
  className?: string;
  /** Announced to screen readers; pass null when a nearby element already labels it. */
  label?: string | null;
}

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span className={cn(styles.wrapper, className)} role="status">
      <span aria-hidden="true" className={styles.spinner} />
      {label ? <span className={styles.srOnly}>{label}</span> : null}
    </span>
  );
}
