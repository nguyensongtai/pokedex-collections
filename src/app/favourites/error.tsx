'use client';

import { useEffect } from 'react';
import { Button, EmptyState } from '@/shared/ui';

export default function FavouritesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Favourites route error:', error);
  }, [error]);

  return (
    <EmptyState
      tone="error"
      icon="⚠️"
      title="We couldn’t open your collections"
      description={
        error.message ||
        'Your saved favourites are still on this device — reloading usually fixes this.'
      }
      action={
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
