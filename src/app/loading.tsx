// App Router convention: route-level loading UI, shown while the route segment
// streams in. The in-page skeletons in `PokemonGrid` cover data loading after
// that point.
import { Skeleton } from '@/shared/ui';
import styles from './loading.module.css';

export default function BrowseLoading() {
  return (
    <div className={styles.wrapper} aria-busy="true">
      <span className={styles.srOnly}>Loading page</span>
      <Skeleton className={styles.heading} />
      <Skeleton className={styles.search} />
      <div className={styles.grid}>
        {Array.from({ length: 12 }, (_, index) => (
          <Skeleton key={index} className={styles.card} />
        ))}
      </div>
    </div>
  );
}
