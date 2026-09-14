'use client';

import { useState, type FormEvent } from 'react';
import { useFavouritesStore } from '../store';
import { Button } from '@/shared/ui';
import styles from './GroupManager.module.css';

/** Creation half of group management; rename/delete live on each GroupSection header. */
export function GroupManager() {
  const createGroup = useFavouritesStore((state) => state.createGroup);
  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // The store is the source of truth for validation; it rejects blank names.
    if (createGroup(name)) setName('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.label} htmlFor="new-group-name">
        New group
      </label>
      <div className={styles.row}>
        <input
          id="new-group-name"
          className={styles.input}
          type="text"
          value={name}
          maxLength={40}
          placeholder="e.g. Battle team"
          autoComplete="off"
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" variant="primary" disabled={name.trim().length === 0}>
          Create group
        </Button>
      </div>
    </form>
  );
}
