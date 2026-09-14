import Image from 'next/image';
import { TypeBadge } from './TypeBadge';
// ── Deliberate one-way feature dependency ───────────────────────────────────
// `pokemon-browse` -> `favourites` (public API only). The reverse import is
// forbidden: the favourites feature must stay usable without the browse
// feature. The pragmatic alternative — passing a favourite-toggle slot down
// from the page — was rejected as prop-drilling for no real gain here.
import { FavouriteButton } from '@/features/favourites';
import { Card } from '@/shared/ui';
import { formatPokemonName, type PokemonSummary } from '@/shared/types/pokemon';
import styles from './PokemonCard.module.css';

interface PokemonCardProps {
  pokemon: PokemonSummary;
  /** Stagger index for the grid fade-in. */
  index: number;
}

/** Pure presentation: everything it renders arrives as props. */
export function PokemonCard({ pokemon, index }: PokemonCardProps) {
  const displayName = formatPokemonName(pokemon.name);

  return (
    <Card
      interactive
      className={styles.card}
      style={{ animationDelay: `${Math.min(index, 11) * 25}ms` }}
    >
      <div className={styles.media}>
        {pokemon.spriteUrl ? (
          <Image
            src={pokemon.spriteUrl}
            alt={`${displayName} official artwork`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1200px) 25vw, 220px"
            className={styles.image}
          />
        ) : (
          <span className={styles.fallback} aria-hidden="true">
            ?
          </span>
        )}
        <FavouriteButton pokemon={pokemon} className={styles.favourite} />
      </div>

      <div className={styles.body}>
        <p className={styles.number}>#{String(pokemon.id).padStart(4, '0')}</p>
        <h2 className={styles.name}>{displayName}</h2>
        <ul className={styles.types}>
          {pokemon.types.map((type) => (
            <li key={type}>
              <TypeBadge type={type} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
