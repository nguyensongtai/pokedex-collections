'use client';

import { toSummary, type PokemonDetail } from '../../api';
import { DetailNav } from '../DetailNav';
import { StatBars } from '../StatBars';
// ── One-way feature dependency ──────────────────────────────────────────────
// `pokemon-detail` -> `favourites` (public API only), the same direction
// `pokemon-browse` uses. `favourites` imports neither.
import { FavouriteButton } from '@/features/favourites';
import { useTranslation } from '@/shared/i18n';
import { Artwork, Badge } from '@/shared/ui';
import {
  formatDexNumber,
  formatPokemonName,
  typeColor,
} from '@/shared/types/pokemon';
import type { CSSProperties } from 'react';
import styles from './index.module.css';

interface PokemonDetailViewProps {
  detail: PokemonDetail;
  previousId: number | null;
  nextId: number | null;
}

/**
 * The detail route's presentation. It is a client component only because the
 * copy is translated in the browser — every byte of data it renders was fetched
 * on the server by `app/pokemon/[id]/page.tsx` and handed down as props.
 */
export function PokemonDetailView({ detail, previousId, nextId }: PokemonDetailViewProps) {
  const t = useTranslation();

  const displayName = formatPokemonName(detail.name);
  const primary = typeColor(detail.types[0] ?? 'normal');

  return (
    <>
      <DetailNav previousId={previousId} nextId={nextId} />

      <div className={styles.layout}>
        <div
          className={styles.figure}
          style={{ '--glow': `color-mix(in oklch, ${primary} 35%, white)` } as CSSProperties}
        >
          <span className={styles.glow} aria-hidden="true" />

          <FavouriteButton pokemon={toSummary(detail)} className={styles.favourite} />

          <div className={styles.media}>
            <Artwork
              src={detail.spriteUrl}
              alt={`${displayName} official artwork`}
              sizes="(max-width: 720px) 90vw, 480px"
              priority
            />
          </div>
        </div>

        <div className={styles.info}>
          <p className={styles.number}>{formatDexNumber(detail.id)}</p>
          <h1 className={styles.name}>{displayName}</h1>
          {detail.genus ? <p className={styles.genus}>{detail.genus}</p> : null}

          <ul className={styles.types}>
            {detail.types.map((type) => (
              <li key={type}>
                <Badge color={typeColor(type)} size="lg">
                  {formatPokemonName(type)}
                </Badge>
              </li>
            ))}
          </ul>

          {detail.flavorText ? <p className={styles.flavor}>{detail.flavorText}</p> : null}

          <dl className={styles.tiles}>
            <Tile label={t.height} value={`${detail.heightM} m`} />
            <Tile label={t.weight} value={`${detail.weightKg} kg`} />
            <Tile label={t.baseExp} value={detail.baseExperience?.toString() ?? '—'} />
          </dl>

          <section className={styles.abilities} aria-labelledby="abilities-heading">
            <h2 className={styles.sectionHeading} id="abilities-heading">
              {t.abilities}
            </h2>
            <ul className={styles.abilityList}>
              {detail.abilities.map((ability) => (
                <li
                  className={ability.hidden ? styles.abilityHidden : styles.ability}
                  key={ability.name}
                >
                  {ability.hidden ? `${ability.name} · ${t.hidden}` : ability.name}
                </li>
              ))}
            </ul>
          </section>

          <StatBars stats={detail.stats} color={primary} />
        </div>
      </div>
    </>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.tile}>
      <dt className={styles.tileLabel}>{label}</dt>
      <dd className={styles.tileValue}>{value}</dd>
    </div>
  );
}
