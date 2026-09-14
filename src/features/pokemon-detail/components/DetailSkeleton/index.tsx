import { Skeleton } from '@/shared/ui';
import styles from './index.module.css';

/**
 * Placeholder for the detail route while the server component awaits PokeAPI.
 * Mirrors the real layout so the page does not jump when data lands.
 */
export function DetailSkeleton() {
  return (
    <div aria-busy="true">
      <div className={styles.nav}>
        <Skeleton className={styles.back} />
        <Skeleton className={styles.steps} />
      </div>

      <div className={styles.layout}>
        <Skeleton className={styles.figure} />

        <div>
          <Skeleton className={styles.number} />
          <Skeleton className={styles.name} />
          <Skeleton className={styles.genus} />
          <div className={styles.tiles}>
            <Skeleton className={styles.tile} />
            <Skeleton className={styles.tile} />
            <Skeleton className={styles.tile} />
          </div>
          <Skeleton className={styles.block} />
        </div>
      </div>
    </div>
  );
}
