/**
 * Public API of the `pokemon-browse` feature.
 *
 * Pages import from here only. Internals (`api.ts`, hooks, individual
 * components) are free to move without touching the routing layer.
 *
 * Dependency direction: this feature may import `features/favourites`'s public
 * API (for the favourite toggle on cards); `favourites` must never import this
 * one. See the note in `components/PokemonCard.tsx`.
 */
export { BrowseView } from './components/BrowseView';

export { PAGE_SIZE, filterPokedex } from './api';
export { usePokemonSearch } from './hooks/usePokemonSearch';
export type { SearchStatus, UsePokemonSearchResult } from './hooks/usePokemonSearch';
