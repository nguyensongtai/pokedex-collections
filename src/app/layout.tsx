import type { Metadata } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import Link from 'next/link';
import type { ReactNode } from 'react';
// Pages and the layout compose features through their public API only.
import { FavouritesCounter } from '@/features/favourites';
import { NavLink } from '@/shared/ui';
import styles from './layout.module.css';
import './globals.css';

/* One display face for headings, one clean sans for body — loaded and
   self-hosted by `next/font`, so there is no layout shift and no external
   stylesheet request. */
const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PokéDex Collections',
    template: '%s · PokéDex Collections',
  },
  description:
    'Browse every Pokémon and organise your favourites into custom collections.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <div className={styles.shell}>
          <nav className={styles.nav} aria-label="Primary">
            <Link className={styles.brand} href="/">
              <span className={styles.mark} aria-hidden="true" />
              PokéDex Collections
            </Link>

            <div className={styles.links}>
              <NavLink href="/">Browse</NavLink>
              <NavLink href="/favourites">
                Favourites
                <FavouritesCounter />
              </NavLink>
            </div>
          </nav>

          <main className={styles.main}>{children}</main>

          <footer className={styles.footer}>
            Data from{' '}
            <a href="https://pokeapi.co" target="_blank" rel="noreferrer noopener">
              PokéAPI
            </a>
            . Pokémon and Pokémon character names are trademarks of Nintendo.
          </footer>
        </div>
      </body>
    </html>
  );
}
