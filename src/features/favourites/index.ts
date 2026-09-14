/**
 * Public API of the `favourites` feature.
 *
 * Everything outside this folder — pages and the `pokemon-browse` feature —
 * imports from here and never deep-imports internals. Adding a component or
 * splitting the store is therefore a local change.
 */
export { FavouriteButton } from './components/FavouriteButton';
export { FavouritesBoard } from './components/FavouritesBoard';
export { FavouritesCounter } from './components/FavouritesCounter';

export {
  UNGROUPED_ID,
  UNGROUPED_NAME,
  groupFavourites,
  useFavouritesHydrated,
  useFavouritesStore,
} from './store';

export type {
  FavouriteEntry,
  FavouriteGroup,
  FavouritesState,
  GroupedFavourites,
} from './store';
