/**
 * Public API of the `pokemon-detail` feature.
 *
 * The route imports from here only. Adding this feature meant adding a folder —
 * no existing feature changed shape to accommodate it.
 *
 * Dependency direction: this feature may import `features/favourites`'s public
 * API (for the favourite toggle); `favourites` imports neither this feature nor
 * `pokemon-browse`.
 */
export { DetailSkeleton } from './components/DetailSkeleton';
export { NotFoundState } from './components/NotFoundState';
export { PokemonDetailView } from './components/PokemonDetailView';

export { fetchDexSize, fetchPokemonDetail, toSummary } from './api';
export type { PokemonAbility, PokemonDetail, PokemonStat, StatKey } from './api';
