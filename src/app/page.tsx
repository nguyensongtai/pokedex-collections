// Route file: composition only. All browse behaviour lives in the feature,
// which is imported through its public API.
import { BrowseView } from '@/features/pokemon-browse';
import styles from './page.module.css';

export default function BrowsePage() {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>Browse Pokémon</h1>
        <p className={styles.subtitle}>
          Search the full National Pokédex and tap the heart to start a collection.
        </p>
      </header>

      <BrowseView />
    </>
  );
}
