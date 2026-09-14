'use client';

import Image from 'next/image';
import { UNGROUPED_ID, UNGROUPED_NAME, useFavouritesStore, type FavouriteEntry, type FavouriteGroup } from '../store';
import { FavouriteButton } from './FavouriteButton';
import { Badge, Card } from '@/shared/ui';
import { POKEMON_TYPE_COLORS, formatPokemonName } from '@/shared/types/pokemon';
import styles from './FavouriteCard.module.css';

interface FavouriteCardProps {
  entry: FavouriteEntry;
  /** User-created groups, for the move target list. */
  groups: FavouriteGroup[];
}

export function FavouriteCard({ entry, groups }: FavouriteCardProps) {
  const moveToGroup = useFavouritesStore((state) => state.moveToGroup);
  const displayName = formatPokemonName(entry.name);
  const selectId = `move-${entry.id}`;

  return (
    <Card interactive className={styles.card}>
      <div className={styles.media}>
        {entry.spriteUrl ? (
          <Image
            src={entry.spriteUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 40vw, 180px"
            className={styles.image}
          />
        ) : (
          <span className={styles.fallback} aria-hidden="true">
            ?
          </span>
        )}
        <FavouriteButton pokemon={entry} className={styles.favourite} />
      </div>

      <div className={styles.body}>
        <p className={styles.name}>{displayName}</p>
        <ul className={styles.types}>
          {entry.types.map((type) => (
            <li key={type}>
              <Badge color={POKEMON_TYPE_COLORS[type]}>{type}</Badge>
            </li>
          ))}
        </ul>

        <label className={styles.srOnly} htmlFor={selectId}>
          {`Move ${displayName} to a group`}
        </label>
        <select
          id={selectId}
          className={styles.select}
          value={entry.groupId}
          onChange={(event) => moveToGroup(entry.id, event.target.value)}
        >
          <option value={UNGROUPED_ID}>{UNGROUPED_NAME}</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}
