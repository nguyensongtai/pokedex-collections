'use client';

import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import {
  DEFAULT_LANGUAGE,
  DICTIONARIES,
  type Dictionary,
  type Language,
} from './dictionary';

/**
 * ── Second piece of global state, and why it is not in a feature ────────────
 * The favourites store lives in `features/favourites` because that feature owns
 * it. The selected language does not belong to either feature: the nav, the
 * browse page and the favourites page all read it, and no feature owns it. So
 * it lives in `shared/i18n` — the layer both features already depend on — with
 * the same persist pattern.
 *
 * These two stores are the complete set of global state in the app. Everything
 * else (search query, pagination, rename drafts, image load state) is local to
 * the component or hook that uses it.
 */

export const LANGUAGE_STORAGE_KEY = 'pokedex-collections:lang';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

/** No-op storage for the server pass, where `window` does not exist. */
const serverStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useLanguageStore = create<LanguageState>()(
  persist<LanguageState, [], [], Pick<LanguageState, 'language'>>(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? serverStorage : window.localStorage,
      ),
      partialize: (state) => ({ language: state.language }),
    },
  ),
);

function subscribeToHydration(onStoreChange: () => void): () => void {
  return useLanguageStore.persist.onFinishHydration(onStoreChange);
}

/** Same hydration contract as the favourites store — see its comment. */
export function useLanguageHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToHydration,
    () => useLanguageStore.persist.hasHydrated(),
    () => false,
  );
}

/**
 * The copy for the active language.
 *
 * Before rehydration this returns the default-language dictionary, which is
 * exactly what the server rendered — so the first client render matches and
 * only then swaps to the stored language.
 */
export function useTranslation(): Dictionary {
  const hydrated = useLanguageHydrated();
  const language = useLanguageStore((state) => state.language);

  return DICTIONARIES[hydrated ? language : DEFAULT_LANGUAGE];
}

/** The active language, or the default until rehydration. */
export function useLanguage(): Language {
  const hydrated = useLanguageHydrated();
  const language = useLanguageStore((state) => state.language);

  return hydrated ? language : DEFAULT_LANGUAGE;
}
