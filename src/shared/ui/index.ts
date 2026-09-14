/**
 * Public API of the shared UI kit.
 *
 * Hard rule: nothing in `shared/ui` may import from `features/*` or know
 * anything about the Pokémon domain. Dependencies point one way: features ->
 * shared, never the reverse.
 */
export { Badge } from './Badge';
export { Button } from './Button';
export { Card } from './Card';
export { EmptyState } from './EmptyState';
export { NavLink } from './NavLink';
export { Skeleton } from './Skeleton';
export { Spinner } from './Spinner';
