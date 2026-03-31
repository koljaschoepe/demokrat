'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface SitzungswocheBannerProps {
  isActive?: boolean;
  liveVoterCount?: number;
}

export function SitzungswocheBanner({
  isActive = false,
  liveVoterCount = 847,
}: SitzungswocheBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!isActive || dismissed) return null;

  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-lg bg-gradient-to-r from-primary/15 to-primary/5 px-4 py-3">
      {/* Animated left-edge gradient accent */}
      <div className="absolute inset-y-0 left-0 w-1 animate-pulse bg-gradient-to-b from-red-500 via-primary to-red-500" />

      {/* Left: LIVE badge + Sitzungswoche label */}
      <div className="flex items-center gap-2 pl-2">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
          Live
        </span>
        <span className="text-sm font-semibold text-foreground">Sitzungswoche</span>
      </div>

      {/* Center: 2x badge + voter counter */}
      <div className="flex flex-1 items-center justify-center gap-3">
        <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
          2x Punkte
        </span>
        <span className="text-xs text-muted-foreground">
          {liveVoterCount.toLocaleString('de-DE')}{' '}
          Bürger stimmen parallel zum Bundestag ab
        </span>
      </div>

      {/* Right: dismiss button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Banner schließen"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
