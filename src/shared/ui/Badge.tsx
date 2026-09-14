import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib';
import styles from './Badge.module.css';

interface BadgeProps {
  /** Any CSS colour. The badge derives its tint/text/border from it via color-mix. */
  color?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Domain-agnostic badge: it takes a colour, not a Pokémon type. That keeps the
 * Pokémon type palette out of `shared/ui` while letting both features render
 * identical-looking chips.
 */
export function Badge({ color, className, children }: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, className)}
      style={color ? ({ '--badge-color': color } as CSSProperties) : undefined}
    >
      {children}
    </span>
  );
}
