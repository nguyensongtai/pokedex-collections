import { Badge } from '@/shared/ui';
import { POKEMON_TYPE_COLORS, type PokemonTypeName } from '@/shared/types/pokemon';

interface TypeBadgeProps {
  type: PokemonTypeName;
}

/**
 * Pokémon-aware wrapper over the domain-agnostic `shared/ui/Badge`: the colour
 * lookup is domain knowledge, the chip itself is not.
 */
export function TypeBadge({ type }: TypeBadgeProps) {
  return <Badge color={POKEMON_TYPE_COLORS[type]}>{type}</Badge>;
}
