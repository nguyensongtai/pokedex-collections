import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_LANGUAGE, DICTIONARIES, LANGUAGES } from './dictionary';
import { useLanguageStore } from './store';

/**
 * The language store is the app's second (and last) piece of global state, so
 * it gets the same treatment as the favourites store: its rules, not its
 * rendering.
 */

const store = () => useLanguageStore.getState();

beforeEach(() => {
  useLanguageStore.setState({ language: DEFAULT_LANGUAGE });
});

describe('language store', () => {
  it('starts on the default language', () => {
    expect(store().language).toBe(DEFAULT_LANGUAGE);
  });

  it('switches language and keeps its actions after rehydration', () => {
    store().setLanguage('vi');
    expect(store().language).toBe('vi');

    // Round-trip through JSON exactly as `persist` would.
    const persisted = JSON.parse(JSON.stringify({ language: 'vi' })) as { language: 'vi' };
    useLanguageStore.setState(persisted);

    expect(store().language).toBe('vi');
    expect(store().setLanguage).toBeTypeOf('function');
  });

  it('ships the same keys in every language, so no locale can fall back to a blank string', () => {
    const reference = Object.keys(DICTIONARIES[DEFAULT_LANGUAGE]).sort();

    for (const language of LANGUAGES) {
      expect(Object.keys(DICTIONARIES[language]).sort()).toEqual(reference);
    }
  });

  it('interpolates counts and names in both languages', () => {
    expect(DICTIONARIES.en.addFav('Pikachu')).toContain('Pikachu');
    expect(DICTIONARIES.vi.addFav('Pikachu')).toContain('Pikachu');
    expect(DICTIONARIES.en.summary(3, 1)).toBe('3 Pokémon in 1 group');
    expect(DICTIONARIES.en.summary(3, 2)).toBe('3 Pokémon in 2 groups');
  });
});
