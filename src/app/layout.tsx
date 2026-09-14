import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import type { ReactNode } from 'react';
import { DEFAULT_LANGUAGE, HtmlLang } from '@/shared/i18n';
import { Nav } from './Nav';
import styles from './layout.module.css';
import './globals.css';

/**
 * One family, four weights — the design uses weight alone to separate display
 * from body, so a second face would only add a download. Loaded and self-hosted
 * by `next/font`, so there is no layout shift and no external stylesheet
 * request. Be Vietnam Pro also carries full Vietnamese coverage, which the VI
 * locale needs.
 */
const sans = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '800'],
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
    // `lang` starts at the default language and `HtmlLang` corrects it on the
    // client, so the server and first client render still agree.
    <html lang={DEFAULT_LANGUAGE} className={sans.variable}>
      <body>
        {/* Corrects <html lang> once the stored language rehydrates. */}
        <HtmlLang />
        <div className={styles.shell}>
          <Nav />
          <main className={styles.main}>{children}</main>
        </div>
      </body>
    </html>
  );
}
