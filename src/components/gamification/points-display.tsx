'use client';

import { Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PrivilegeBadge } from '@/components/gamification/privilege-badge';
import { LevelProgress } from '@/components/gamification/level-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PointsDisplayProps {
  points?: number;
  tier?: 0 | 1 | 2 | 3 | 4;
  recentEvents?: Array<{ action: string; points: number; created_at: string }>;
}

const ACTION_LABELS: Record<string, string> = {
  vote: 'Abstimmung',
  quiz: 'Quiz',
  briefing: 'Briefing',
  perspective: 'Perspektive',
  session_complete: 'Session abgeschlossen',
  comment: 'Kommentar',
  streak_bonus: 'Streak-Bonus',
  first_vote: 'Erste Abstimmung',
};

const MOCK_DATA = {
  points: 320,
  tier: 1 as const,
  recentEvents: [
    { action: 'session_complete', points: 40, created_at: '2026-03-31T08:30:00Z' },
    { action: 'vote', points: 20, created_at: '2026-03-31T08:28:00Z' },
    { action: 'quiz', points: 10, created_at: '2026-03-31T08:26:00Z' },
    { action: 'streak_bonus', points: 15, created_at: '2026-03-30T09:00:00Z' },
    { action: 'vote', points: 20, created_at: '2026-03-30T08:45:00Z' },
  ],
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'gerade eben';
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays === 1) return 'gestern';
  return `vor ${diffDays} Tagen`;
}

export function PointsDisplay({ points, tier, recentEvents }: PointsDisplayProps) {
  const displayPoints = points ?? MOCK_DATA.points;
  const displayTier = tier ?? MOCK_DATA.tier;
  const displayEvents = recentEvents ?? MOCK_DATA.recentEvents;

  return (
    <div className="flex flex-col gap-4">
      {/* Points header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Star className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums leading-tight">{displayPoints}</p>
            <p className="text-xs text-muted-foreground">Reputationspunkte</p>
          </div>
        </div>
        <PrivilegeBadge tier={displayTier} size="lg" />
      </div>

      {/* Level progress */}
      <LevelProgress currentPoints={displayPoints} currentTier={displayTier} />

      <Separator />

      {/* Recent events */}
      <div className="flex flex-col gap-2">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Clock className="size-4 text-muted-foreground" />
          Letzte Aktivitäten
        </h3>

        <Card>
          <CardContent className="flex flex-col gap-0 pt-2 pb-2">
            {displayEvents.slice(0, 5).map((event, i) => (
              <div key={i}>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">
                    {ACTION_LABELS[event.action] ?? event.action}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-sm font-medium tabular-nums',
                        event.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground',
                      )}
                    >
                      {event.points > 0 ? '+' : ''}
                      {event.points}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatRelativeTime(event.created_at)}
                    </span>
                  </div>
                </div>
                {i < displayEvents.slice(0, 5).length - 1 && (
                  <Separator />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
