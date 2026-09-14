'use client';

import { RouteError } from '../RouteError';

export default function FavouritesError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} scope="Favourites" />;
}
