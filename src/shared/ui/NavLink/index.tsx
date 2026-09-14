'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import styles from './index.module.css';

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

/** Route-aware nav link. Generic navigation UI — no domain knowledge. */
export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(styles.link, isActive && styles.active)}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
