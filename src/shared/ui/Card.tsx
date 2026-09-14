import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Adds the hover-lift affordance. Off for static containers. */
  interactive?: boolean;
  /** Render as something other than a div, e.g. `article`. */
  as?: 'div' | 'article' | 'section';
}

/**
 * The app's one surface: white, hairline border, 14px radius. Domain-agnostic —
 * it knows nothing about Pokémon.
 */
export function Card({ interactive = false, as: Tag = 'div', className, ...props }: CardProps) {
  return <Tag className={cn(styles.card, interactive && styles.interactive, className)} {...props} />;
}
