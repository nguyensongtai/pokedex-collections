import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib';
import styles from './index.module.css';

type ButtonVariant = 'primary' | 'ink' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Domain-agnostic button. Always a real <button> so keyboard support is free. */
export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(styles.button, styles[variant], styles[size], className)}
      {...props}
    />
  );
}
