'use client';

import { useEffect, useState } from 'react';

/**
 * Generic debounce helpers. Domain-agnostic on purpose — `shared/*` never knows
 * about Pokémon or about any feature.
 */

/** Returns `value` after it has stopped changing for `delayMs`. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
