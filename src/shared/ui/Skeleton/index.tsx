import { cn } from '@/shared/lib';
import styles from './index.module.css';

interface SkeletonProps {
  className?: string;
}

/**
 * A single shimmering placeholder block. Every loading view in the app composes
 * these, so the shimmer treatment is defined once.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <span aria-hidden="true" className={cn(styles.skeleton, className)} />;
}
