/**
 * Public API of the `favourites` feature.
 *
 * Everything outside this folder — pages and the `pokemon-browse` feature —
 * imports from here and never deep-imports internals.
 */
export { FavouriteButton } from './components/FavouriteButton';
export { FavouritesCounter } from './components/FavouritesCounter';

export { UNGROUPED_ID, UNGROUPED_NAME, useFavouritesHydrated, useFavouritesStore } from './store';
export type { FavouriteEntry, FavouriteGroup, FavouritesState } from './store';
