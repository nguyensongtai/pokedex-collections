'use client';

import Link from 'next/link';
import { UNGROUPED_ID, useFavouritesStore, type FavouriteEntry, type FavouriteGroup } from '../../store';
import { useTranslation } from '@/shared/i18n';
import { Artwork, Badge, Card } from '@/shared/ui';
import {
  formatDexNumber,
  formatPokemonName,
  typeColor,
} from '@/shared/types/pokemon';
import styles from './index.module.css';

interface FavouriteRowProps {
  entry: FavouriteEntry;
  /** User-created groups, for the move-target list. */
  groups: FavouriteGroup[];
  /** Position in its section; drives the entrance stagger and the LCP hint. */
  index: number;
}

/**
 * One saved Pokémon: artwork, identity, and the two actions the design puts on
 * a row — move to a group, or remove.
 *
 * Renders type badges straight from `shared/ui/Badge` plus the shared colour
 * map rather than importing `pokemon-browse`'s TypeBadge, which would invert
 * the one-way feature dependency.
 */
export function FavouriteRow({ entry, groups, index }: FavouriteRowProps) {
  const t = useTranslation();
  const moveToGroup = useFavouritesStore((state) => state.moveToGroup);
  const removeFavourite = useFavouritesStore((state) => state.removeFavourite);

  const displayName = formatPokemonName(entry.name);
  const selectId = `move-${entry.id}`;

  return (
    <Card
      interactive
      className={styles.row}
      style={{ animationDelay: `${Math.min(index, 11) * 25}ms` }}
    >
      <Link className={styles.media} href={`/pokemon/${entry.id}`} aria-label={displayName}>
        <Artwork src={entry.spriteUrl} alt="" sizes="64px" priority={index < 4} />
      </Link>

      <div className={styles.identity}>
        <div className={styles.heading}>
          <span className={styles.name}>{displayName}</span>
          <span className={styles.number}>{formatDexNumber(entry.id)}</span>
        </div>
        <ul className={styles.types}>
          {entry.types.map((type) => (
            <li key={type}>
              <Badge color={typeColor(type)} size="sm">
                {formatPokemonName(type)}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <label className={styles.srOnly} htmlFor={selectId}>
          {`${t.moveTo} — ${displayName}`}
        </label>
        <select
          id={selectId}
          className={styles.select}
          value={entry.groupId === UNGROUPED_ID ? '' : entry.groupId}
          onChange={(event) => moveToGroup(entry.id, event.target.value || UNGROUPED_ID)}
        >
          <option value="">{t.moveTo}</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={styles.remove}
          aria-label={t.rmFav(displayName)}
          onClick={() => removeFavourite(entry.id)}
        >
          {t.remove}
        </button>
      </div>
    </Card>
  );
}
