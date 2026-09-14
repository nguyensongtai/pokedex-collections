import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the hover-lift affordance. Off for static containers. */
  interactive?: boolean;
}

/** Domain-agnostic surface. Knows nothing about Pokémon. */
export function Card({ interactive = false, className, ...props }: CardProps) {
  return <div className={cn(styles.card, interactive && styles.interactive, className)} {...props} />;
}
