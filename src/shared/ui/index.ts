/**
 * Public API of the shared UI kit.
 *
 * Hard rule: nothing in `shared/ui` may import from `features/*` or know
 * anything about the Pokémon domain. Dependencies point one way: features ->
 * shared, never the reverse.
 *
 * Every export here has at least two consumers — a primitive with one caller
 * belongs next to that caller instead.
 */
export { Artwork } from './Artwork';
export { Badge } from './Badge';
export { Button } from './Button';
export { Card } from './Card';
export { ErrorState } from './ErrorState';
export { NavLink } from './NavLink';
export { Skeleton } from './Skeleton';
