import { Badge } from '@/shared/ui';
import { formatPokemonName, typeColor, type PokemonTypeName } from '@/shared/types/pokemon';

interface TypeBadgeProps {
  type: PokemonTypeName;
  size?: 'sm' | 'md';
}

/**
 * Pokémon-aware wrapper over the domain-agnostic `shared/ui/Badge`: the colour
 * lookup is domain knowledge, the chip itself is not.
 */
export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  return (
    <Badge color={typeColor(type)} size={size}>
      {formatPokemonName(type)}
    </Badge>
  );
}
