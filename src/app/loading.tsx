// App Router convention: route-level loading UI, shown while the route segment
// streams in. The in-page skeletons in `PokemonGrid` cover data loading after
// that point.
import { Skeleton } from '@/shared/ui';
import styles from './loading.module.css';

export default function BrowseLoading() {
  return (
    <div className={styles.wrapper} aria-busy="true">
      <div className={styles.header}>
        <Skeleton className={styles.title} />
        <Skeleton className={styles.search} />
      </div>
      <div className={styles.grid}>
        {Array.from({ length: 12 }, (_, index) => (
          <Skeleton key={index} className={styles.card} />
        ))}
      </div>
    </div>
  );
}
