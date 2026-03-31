'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Ein Fehler ist aufgetreten</h1>
      <p className="text-muted-foreground">
        Etwas ist schiefgelaufen. Bitte versuche es erneut.
      </p>
      <Button onClick={reset}>Erneut versuchen</Button>
    </div>
  );
}
