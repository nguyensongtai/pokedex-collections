'use client';

import { RouteError } from '../../RouteError';

export default function PokemonDetailError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} scope="Pokémon detail" />;
}
