'use client';

import Link from 'next/link';
import { BarChart3, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  id: string;
  title: string;
  description?: string;
  source: 'BUNDESTAG' | 'BUERGER';
  category: string;
  voteCount: number;
  commentCount: number;
  closesAt: string | null;
  hasVoted?: boolean;
  className?: string;
}

function formatTimeRemaining(closesAt: string | null): string | null {
  if (!closesAt) return null;

  const now = new Date();
  const closes = new Date(closesAt);
  const diffMs = closes.getTime() - now.getTime();

  if (diffMs <= 0) return 'Beendet';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `Noch ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tage'}`;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours > 0) return `Noch ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`;

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `Noch ${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minuten'}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString('de-DE');
}

export function TopicCard({
  id,
  title,
  description,
  source,
  category,
  voteCount,
  commentCount,
  closesAt,
  hasVoted = false,
  className,
}: TopicCardProps) {
  const timeRemaining = formatTimeRemaining(closesAt);
  const sourceLabel = source === 'BUNDESTAG' ? 'BUNDESTAG' : 'B\u00dcRGER';

  return (
    <Link href={`/topic/${id}`} className="block">
      <Card
        role="article"
        className={cn(
          'transition-shadow hover:shadow-md',
          className,
        )}
      >
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge
              variant={source === 'BUNDESTAG' ? 'secondary' : 'default'}
            >
              {sourceLabel}
            </Badge>
            {timeRemaining && (
              <time
                dateTime={closesAt ?? undefined}
                className="ml-auto text-xs text-muted-foreground"
              >
                {timeRemaining}
              </time>
            )}
          </div>

          <h3 className="line-clamp-2 text-base font-semibold text-foreground">
            {title}
          </h3>

          {description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          )}

          <Badge variant="outline" className="w-fit">
            {category}
          </Badge>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span
              className="flex items-center gap-1 font-mono"
              aria-label={`${formatNumber(voteCount)} Stimmen`}
            >
              <BarChart3 className="size-3.5" />
              {formatNumber(voteCount)}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <MessageCircle className="size-3.5" />
              {formatNumber(commentCount)}
            </span>
          </div>

          {hasVoted ? (
            <Button
              variant="secondary"
              size="lg"
              className="h-10 w-full"
              disabled
            >
              Abgestimmt &#10003;
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              className="h-10 w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/topic/${id}#vote`;
              }}
            >
              Abstimmen
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
