import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/shared/lib';
import styles from './index.module.css';

interface BadgeProps {
  /** Any CSS colour. The badge derives tint, text and border from it. */
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

/**
 * Domain-agnostic chip: it takes a colour, not a Pokémon type. That keeps the
 * Pokémon palette out of `shared/ui` while letting both features render
 * identical-looking badges.
 */
export function Badge({ color, size = 'md', className, children }: BadgeProps) {
  return (
    <span
      className={cn(styles.badge, styles[size], className)}
      style={color ? ({ '--badge-color': color } as CSSProperties) : undefined}
    >
      {children}
    </span>
  );
}
