import { cn } from '@/shared/lib';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
  /** Presentational shape hint. */
  shape?: 'block' | 'text' | 'circle';
}

/** Single shimmering placeholder block. Features compose these into skeleton grids. */
export function Skeleton({ className, shape = 'block' }: SkeletonProps) {
  return <span aria-hidden="true" className={cn(styles.skeleton, styles[shape], className)} />;
}
