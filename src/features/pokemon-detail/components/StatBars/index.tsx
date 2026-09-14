'use client';

import { MAX_BASE_STAT, type PokemonStat, type StatKey } from '../../api';
import { useTranslation } from '@/shared/i18n';
import styles from './index.module.css';

interface StatBarsProps {
  stats: PokemonStat[];
  /** The Pokémon's primary type colour, used to fill the bars. */
  color: string;
}

/** Short labels are the convention on every Pokédex, and they stay untranslated. */
const STAT_LABELS: Record<StatKey, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
};

export function StatBars({ stats, color }: StatBarsProps) {
  const t = useTranslation();
  const total = stats.reduce((sum, stat) => sum + stat.value, 0);

  return (
    <section className={styles.section} aria-labelledby="stats-heading">
      <div className={styles.header}>
        <h2 className={styles.heading} id="stats-heading">
          {t.stats}
        </h2>
        <p className={styles.total}>
          {t.total} <strong>{total}</strong>
        </p>
      </div>

      <dl className={styles.list}>
        {stats.map((stat) => (
          <div className={styles.row} key={stat.key}>
            <dt className={styles.label}>{STAT_LABELS[stat.key]}</dt>
            <dd className={styles.value}>{stat.value}</dd>
            {/* The bar repeats the number next to it, so it is decorative. */}
            <div className={styles.track} aria-hidden="true">
              <div
                className={styles.fill}
                style={{
                  width: `${Math.min(100, (stat.value / MAX_BASE_STAT) * 100)}%`,
                  background: color,
                }}
              />
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
