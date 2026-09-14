// App Router convention: rendered when the page calls `notFound()`, i.e. the id
// is not a number or PokeAPI has no such Pokémon.
import { NotFoundState } from '@/features/pokemon-detail';

export default function PokemonNotFound() {
  return <NotFoundState />;
}
