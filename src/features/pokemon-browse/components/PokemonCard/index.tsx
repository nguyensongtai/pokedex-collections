import Link from 'next/link';
import { TypeBadge } from '../TypeBadge';
// ── Deliberate one-way feature dependency ───────────────────────────────────
// `pokemon-browse` -> `favourites` (public API only). The reverse import is
// forbidden: the favourites feature must stay usable without the browse
// feature. The pragmatic alternative — passing a favourite-toggle slot down
// from the page — was rejected as prop-drilling for no real gain here.
import { FavouriteButton } from '@/features/favourites';
import { Artwork, Card } from '@/shared/ui';
import {
  formatDexNumber,
  formatPokemonName,
  type PokemonSummary,
} from '@/shared/types/pokemon';
import styles from './index.module.css';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  /** Position in the grid; drives the entrance stagger and the LCP hint. */
  index: number;
}

/** Pure presentation: everything it renders arrives as props. */
export function PokemonCard({ pokemon, index }: PokemonCardProps) {
  const displayName = formatPokemonName(pokemon.name);
  const nameId = `pokemon-${pokemon.id}-name`;

  return (
    <Card
      as="article"
      interactive
      // The grid is a list of results, not 48 document sections, so the card
      // takes its accessible name from the name element instead of a heading.
      aria-labelledby={nameId}
      className={styles.card}
      style={{ animationDelay: `${Math.min(index, 11) * 25}ms` }}
    >
      <FavouriteButton pokemon={pokemon} className={styles.favourite} />

      <div className={styles.media}>
        <Artwork
          src={pokemon.spriteUrl}
          alt={`${displayName} official artwork`}
          sizes="(max-width: 640px) 45vw, (max-width: 1200px) 25vw, 220px"
          priority={index < 6}
        />
      </div>

      <div className={styles.heading}>
        <p className={styles.name} id={nameId}>
          {/* Stretched link: the anchor covers the whole card via ::after, so
              the card is clickable without nesting the favourite button inside
              an <a> — which would be invalid, and would swallow its click. */}
          <Link className={styles.link} href={`/pokemon/${pokemon.id}`}>
            {displayName}
          </Link>
        </p>
        <span className={styles.number}>{formatDexNumber(pokemon.id)}</span>
      </div>

      <ul className={styles.types}>
        {pokemon.types.map((type) => (
          <li key={type}>
            <TypeBadge type={type} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
