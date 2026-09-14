// App Router convention: shown while the server component awaits PokeAPI.
import { DetailSkeleton } from '@/features/pokemon-detail';

export default function PokemonDetailLoading() {
  return <DetailSkeleton />;
}
