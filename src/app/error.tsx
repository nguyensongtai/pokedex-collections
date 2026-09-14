'use client';

// App Router convention: route-level error boundary. `reset()` re-renders the
// segment, which is the retry affordance for anything that escapes the
// component-level error states.
import { useEffect } from 'react';
import { Button, EmptyState } from '@/shared/ui';

export default function BrowseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Browse route error:', error);
  }, [error]);

  return (
    <EmptyState
      tone="error"
      icon="⚠️"
      title="Something went wrong while browsing"
      description={error.message || 'An unexpected error occurred. Please try again.'}
      action={
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
