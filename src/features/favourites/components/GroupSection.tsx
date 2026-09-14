'use client';

import { useState, type FormEvent } from 'react';
import {
  UNGROUPED_ID,
  useFavouritesStore,
  type FavouriteGroup,
  type GroupedFavourites,
} from '../store';
import { FavouriteCard } from './FavouriteCard';
import { Button, EmptyState } from '@/shared/ui';
import styles from './GroupSection.module.css';

interface GroupSectionProps {
  section: GroupedFavourites;
  /** All user-created groups, passed down for each card's move target list. */
  groups: FavouriteGroup[];
}

/** One named group: header (rename/delete) plus its Pokémon. */
export function GroupSection({ section, groups }: GroupSectionProps) {
  const { group, entries } = section;
  const renameGroup = useFavouritesStore((state) => state.renameGroup);
  const deleteGroup = useFavouritesStore((state) => state.deleteGroup);

  const [draftName, setDraftName] = useState<string | null>(null);
  const isEditing = draftName !== null;
  // The virtual Ungrouped section exists implicitly and cannot be edited.
  const isEditable = group.id !== UNGROUPED_ID;
  const headingId = `group-${group.id}`;

  const handleRename = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (draftName !== null) renameGroup(group.id, draftName);
    setDraftName(null);
  };

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <header className={styles.header}>
        {isEditing ? (
          <form className={styles.renameForm} onSubmit={handleRename}>
            <label className={styles.srOnly} htmlFor={`rename-${group.id}`}>
              {`Rename group ${group.name}`}
            </label>
            <input
              id={`rename-${group.id}`}
              className={styles.renameInput}
              type="text"
              value={draftName}
              maxLength={40}
              autoFocus
              autoComplete="off"
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setDraftName(null);
              }}
            />
            <Button type="submit" size="sm" variant="primary" disabled={draftName.trim().length === 0}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDraftName(null)}>
              Cancel
            </Button>
          </form>
        ) : (
          <>
            <h2 className={styles.title} id={headingId}>
              {group.name}
              <span className={styles.count}>{entries.length}</span>
            </h2>
            {isEditable ? (
              <div className={styles.actions}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDraftName(group.name)}
                  aria-label={`Rename group ${group.name}`}
                >
                  Rename
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteGroup(group.id)}
                  aria-label={`Delete group ${group.name}. Its Pokémon move to Ungrouped.`}
                >
                  Delete
                </Button>
              </div>
            ) : null}
          </>
        )}
      </header>

      {entries.length > 0 ? (
        <ul className={styles.grid}>
          {entries.map((entry, index) => (
            <li key={entry.id}>
              <FavouriteCard entry={entry} groups={groups} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="This group is empty"
          description="Use the group picker on any favourite card to move it here."
          icon="📁"
        />
      )}
    </section>
  );
}
