'use client';

// App Router convention: route-level error boundary. `reset()` re-renders the
// segment, which is the retry affordance for anything that escapes the
// component-level error states.
import { RouteError } from './RouteError';

export default function BrowseError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} scope="Browse" />;
}
