// Route file: composition only.
import type { Metadata } from 'next';
import { FavouritesBoard } from '@/features/favourites';
import styles from '../page.module.css';

export const metadata: Metadata = {
  title: 'Favourites',
  description: 'Your favourited Pokémon, organised into custom groups.',
};

export default function FavouritesPage() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Your collections</h1>
        <p className={styles.subtitle}>
          Group your favourites however you like. Deleting a group never deletes its
          Pokémon — they move back to Ungrouped.
        </p>
      </header>

      <FavouritesBoard />
    </>
  );
}
