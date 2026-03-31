'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type VoteType = 'ja' | 'nein' | 'enthaltung' | 'nicht_abgegeben';

interface VoteBadgeProps {
  vote: VoteType;
  className?: string;
}

const VOTE_CONFIG: Record<VoteType, { label: string; className: string }> = {
  ja: {
    label: 'Ja',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  nein: {
    label: 'Nein',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  enthaltung: {
    label: 'Enthaltung',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
  nicht_abgegeben: {
    label: 'Nicht abgegeben',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
  },
};

export function VoteBadge({ vote, className }: VoteBadgeProps) {
  const config = VOTE_CONFIG[vote];

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent font-medium',
        config.className,
        className,
      )}
    >
      {config.label}
    </Badge>
  );
}
