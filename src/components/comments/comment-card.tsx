'use client';

import { useState, useMemo } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  MessageCircle,
  Flag,
  Pencil,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CommentCardProps {
  id: string;
  content: string;
  position: 'pro' | 'contra' | 'neutral';
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    privilegeTier: number;
  };
  upvotes: number;
  downvotes: number;
  bridgingScore: number | null;
  replyCount: number;
  createdAt: string;
  updatedAt: string | null;
  sources: string[];
  userRating: 'up' | 'down' | null;
  isFlagged: boolean;
  isOwnComment?: boolean;
  onRate?: (commentId: string, rating: 'up' | 'down') => void;
  onReply?: (commentId: string) => void;
  onReport?: (commentId: string) => void;
  onEdit?: (commentId: string) => void;
  className?: string;
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;

  if (diffMs < 0) return 'gerade eben';

  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) return 'gerade eben';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `vor ${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minuten'}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `vor ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  return `vor ${diffMonths} ${diffMonths === 1 ? 'Monat' : 'Monaten'}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function isWithinEditWindow(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  return now - created < fifteenMinutes;
}

function formatSourceDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const positionConfig = {
  pro: {
    icon: ThumbsUp,
    color: 'text-green-600 dark:text-green-400',
    label: 'Dafür',
  },
  contra: {
    icon: ThumbsDown,
    color: 'text-red-600 dark:text-red-400',
    label: 'Dagegen',
  },
  neutral: {
    icon: Minus,
    color: 'text-gray-500 dark:text-gray-400',
    label: 'Neutral',
  },
} as const;

const privilegeLabels: Record<number, string> = {
  1: 'Aktiv',
  2: 'Erfahren',
  3: 'Experte',
  4: 'Mentor',
  5: 'Guardian',
};

export function CommentCard({
  id,
  content,
  position,
  author,
  upvotes,
  downvotes,
  bridgingScore,
  replyCount,
  createdAt,
  updatedAt,
  sources,
  userRating,
  isFlagged,
  isOwnComment = false,
  onRate,
  onReply,
  onReport,
  onEdit,
  className,
}: CommentCardProps) {
  const [optimisticRating, setOptimisticRating] = useState(userRating);
  const [optimisticUpvotes, setOptimisticUpvotes] = useState(upvotes);
  const [optimisticDownvotes, setOptimisticDownvotes] = useState(downvotes);

  const positionCfg = positionConfig[position];
  const PositionIcon = positionCfg.icon;

  const canEdit = isOwnComment && isWithinEditWindow(createdAt);
  const showBridgingBadge = bridgingScore !== null && bridgingScore > 0.7;
  const visibleSources = sources.slice(0, 5);

  const relativeTime = useMemo(() => formatRelativeTime(createdAt), [createdAt]);

  function handleRate(rating: 'up' | 'down') {
    const previousRating = optimisticRating;
    const previousUp = optimisticUpvotes;
    const previousDown = optimisticDownvotes;

    // Toggle off if same rating clicked
    if (previousRating === rating) {
      setOptimisticRating(null);
      if (rating === 'up') setOptimisticUpvotes((v) => v - 1);
      else setOptimisticDownvotes((v) => v - 1);
    } else {
      // Remove previous rating first
      if (previousRating === 'up') setOptimisticUpvotes((v) => v - 1);
      if (previousRating === 'down') setOptimisticDownvotes((v) => v - 1);

      // Apply new rating
      setOptimisticRating(rating);
      if (rating === 'up') setOptimisticUpvotes((v) => v + 1);
      else setOptimisticDownvotes((v) => v + 1);
    }

    try {
      onRate?.(id, rating);
    } catch {
      // Rollback on error
      setOptimisticRating(previousRating);
      setOptimisticUpvotes(previousUp);
      setOptimisticDownvotes(previousDown);
    }
  }

  return (
    <Card className={cn('relative', className)}>
      {/* Flagged overlay */}
      {isFlagged && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-muted/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flag className="size-4" />
            <span>Gemeldet</span>
          </div>
        </div>
      )}

      <CardContent className="flex flex-col gap-3">
        {/* Header: position indicator + author + time */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.displayName}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                {getInitials(author.displayName)}
              </div>
            )}
          </div>

          {/* Author info */}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">
                {author.displayName}
              </span>
              {author.privilegeTier > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {privilegeLabels[author.privilegeTier] ?? `Stufe ${author.privilegeTier}`}
                </Badge>
              )}
              <span className={cn('flex items-center gap-0.5 text-xs', positionCfg.color)}>
                <PositionIcon className="size-3" />
                {positionCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <time dateTime={createdAt}>{relativeTime}</time>
              {updatedAt && <span>(bearbeitet)</span>}
            </div>
          </div>

          {/* Bridging badge */}
          {showBridgingBadge && (
            <Badge className="ml-auto flex-shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              <Sparkles className="size-3" />
              <span className="text-[10px]">Brückenkommentar</span>
            </Badge>
          )}
        </div>

        {/* Content */}
        <p className="whitespace-pre-wrap text-sm text-foreground">{content}</p>

        {/* Source links */}
        {visibleSources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleSources.map((source, idx) => (
              <a
                key={idx}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="size-2.5" />
                {formatSourceDomain(source)}
              </a>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-1">
          {/* Upvote */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleRate('up')}
            className={cn(
              optimisticRating === 'up' && 'text-green-600 dark:text-green-400',
            )}
            aria-label="Hochstimmen"
          >
            <ThumbsUp className="size-3.5" />
            <span className="tabular-nums">{optimisticUpvotes}</span>
          </Button>

          {/* Downvote */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleRate('down')}
            className={cn(
              optimisticRating === 'down' && 'text-red-600 dark:text-red-400',
            )}
            aria-label="Runterstimmen"
          >
            <ThumbsDown className="size-3.5" />
            <span className="tabular-nums">{optimisticDownvotes}</span>
          </Button>

          {/* Reply */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onReply?.(id)}
            aria-label="Antworten"
          >
            <MessageCircle className="size-3.5" />
            {replyCount > 0 && <span className="tabular-nums">{replyCount}</span>}
          </Button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Edit (own comment, within 15 min) */}
          {canEdit && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onEdit?.(id)}
              aria-label="Bearbeiten"
            >
              <Pencil className="size-3" />
            </Button>
          )}

          {/* Report */}
          {!isOwnComment && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onReport?.(id)}
              aria-label="Melden"
              className="text-muted-foreground"
            >
              <Flag className="size-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
