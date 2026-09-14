'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/shared/i18n';
import { Button, ErrorState } from '@/shared/ui';

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Where this boundary sits, for the console breadcrumb. */
  scope: string;
}

/**
 * Shared behaviour for both route error boundaries. The presentation comes from
 * `shared/ui/ErrorState`, so a route-level failure looks exactly like the
 * component-level error state inside a data view.
 */
export function RouteError({ error, reset, scope }: RouteErrorProps) {
  const t = useTranslation();

  useEffect(() => {
    console.error(`${scope} route error:`, error);
  }, [error, scope]);

  return (
    <ErrorState
      headingLevel="h1"
      title={t.errTitle}
      description={error.message || t.errHint}
      action={
        <Button variant="primary" onClick={reset}>
          {t.retry}
        </Button>
      }
    />
  );
}
