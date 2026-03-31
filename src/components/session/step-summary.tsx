'use client';

import Link from 'next/link';
import { Trophy, Flame, Share2, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface StepSummaryProps {
  pointsEarned?: number;
  currentStreak?: number;
  activitiesCompleted?: {
    briefing: boolean;
    quiz: boolean;
    vote: boolean;
    perspective: boolean;
  };
}

const MOCK_SUMMARY = {
  pointsEarned: 40,
  currentStreak: 8,
  activitiesCompleted: {
    briefing: true,
    quiz: true,
    vote: true,
    perspective: true,
  },
};

const ACTIVITY_LABELS: Record<string, string> = {
  briefing: 'Tagesbriefing gelesen',
  quiz: 'Quiz beantwortet',
  vote: 'Abstimmung abgegeben',
  perspective: 'Perspektivenwechsel gelesen',
};

export function StepSummary({
  pointsEarned,
  currentStreak,
  activitiesCompleted,
}: StepSummaryProps) {
  const points = pointsEarned ?? MOCK_SUMMARY.pointsEarned;
  const streak = currentStreak ?? MOCK_SUMMARY.currentStreak;
  const activities = activitiesCompleted ?? MOCK_SUMMARY.activitiesCompleted;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Meine Demokrat Session',
          text: 'Ich habe heute meine tägliche Demokratie-Session abgeschlossen!',
          url: window.location.origin,
        });
      } catch {
        // User cancelled or share failed silently
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 motion-safe:animate-in motion-safe:zoom-in-50">
          <Trophy className="size-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold">Zusammenfassung</h2>
        <p className="text-sm text-muted-foreground">
          Session abgeschlossen!
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Punkte heute</span>
            <span className="text-2xl font-bold tabular-nums text-primary">+{points}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="size-4 text-orange-500" />
              Streak
            </span>
            <span className="text-base font-semibold tabular-nums">
              {streak} Tage
            </span>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">Heute erledigt:</p>
            <ul className="flex flex-col gap-1.5 text-sm">
              {Object.entries(activities).map(([key, completed]) => (
                <li key={key} className="flex items-center gap-2">
                  {completed ? (
                    <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                  ) : (
                    <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                  )}
                  <span className={cn(!completed && 'text-muted-foreground')}>
                    {ACTIVITY_LABELS[key] ?? key}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex w-full flex-col gap-2">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleShare}
        >
          <Share2 className="size-4" />
          Session teilen
        </Button>

        <Button size="lg" className="w-full" render={<Link href="/feed" />}>
          Zum Feed
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
