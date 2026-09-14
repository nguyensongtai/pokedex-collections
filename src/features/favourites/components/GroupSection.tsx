'use client';

import { useState, type KeyboardEvent } from 'react';
import {
  UNGROUPED_ID,
  useFavouritesStore,
  type FavouriteGroup,
  type GroupedFavourites,
} from '../store';
import { FavouriteRow } from './FavouriteRow';
import { useTranslation } from '@/shared/i18n';
import styles from './GroupSection.module.css';

interface GroupSectionProps {
  section: GroupedFavourites;
  /** All user-created groups, passed down for each row's move-target list. */
  groups: FavouriteGroup[];
  /** Display label; the store only knows the stable id. */
  label: string;
}

/** One named group: header (rename / delete) plus its Pokémon. */
export function GroupSection({ section, groups, label }: GroupSectionProps) {
  const { group, entries } = section;
  const t = useTranslation();
  const renameGroup = useFavouritesStore((state) => state.renameGroup);
  const deleteGroup = useFavouritesStore((state) => state.deleteGroup);

  const [draftName, setDraftName] = useState<string | null>(null);
  const isEditing = draftName !== null;
  // The virtual Ungrouped section exists implicitly and cannot be edited.
  const isEditable = group.id !== UNGROUPED_ID;
  const headingId = `group-${group.id}`;

  const save = () => {
    if (draftName !== null) renameGroup(group.id, draftName);
    setDraftName(null);
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      save();
    }
    if (event.key === 'Escape') setDraftName(null);
  };

  return (
    <section className={styles.section} aria-labelledby={isEditing ? undefined : headingId}>
      <header className={styles.header}>
        {isEditing ? (
          <input
            className={styles.renameInput}
            type="text"
            value={draftName}
            maxLength={40}
            autoFocus
            autoComplete="off"
            aria-label={t.groupName}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={handleKey}
            onBlur={save}
          />
        ) : (
          <h2 className={isEditable ? styles.title : styles.titleMuted} id={headingId}>
            {label}
          </h2>
        )}

        <span className={styles.count}>{t.count(entries.length)}</span>

        {isEditable ? (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconButton}
              aria-label={`${t.rename} — ${group.name}`}
              title={t.rename}
              onClick={() => setDraftName(group.name)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.destructive}`}
              aria-label={`${t.deleteGroup} — ${group.name}`}
              title={t.deleteGroup}
              onClick={() => deleteGroup(group.id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
              </svg>
            </button>
          </div>
        ) : null}
      </header>

      {entries.length === 0 ? (
        <p className={styles.empty}>{t.groupEmpty(label)}</p>
      ) : (
        <ul className={styles.grid}>
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <FavouriteRow entry={entry} groups={groups} index={index} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
