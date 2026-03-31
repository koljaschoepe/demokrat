'use client';

import { useMemo } from 'react';
import { CheckCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

interface QuestItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
}

interface QuestListProps {
  quests?: QuestItem[];
}

// ---------------------------------------------------------------------------
// Mock-Daten
// ---------------------------------------------------------------------------

const MOCK_QUESTS: QuestItem[] = [
  { id: '1', title: '3 Abstimmungen', description: 'Stimme diese Woche bei 3 Themen ab', progress: 2, target: 3, reward: 50, completed: false },
  { id: '2', title: '2 Kommentare', description: 'Schreibe 2 Kommentare diese Woche', progress: 2, target: 2, reward: 30, completed: true },
  { id: '3', title: '5 Sessions', description: 'Schließe 5 tägliche Sessions ab', progress: 3, target: 5, reward: 75, completed: false },
];

// ---------------------------------------------------------------------------
// Timer: Tage bis Wochenende
// ---------------------------------------------------------------------------

function useDaysRemaining(): number {
  return useMemo(() => {
    const now = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }),
    );
    const dayOfWeek = now.getDay(); // 0 = Sonntag
    if (dayOfWeek === 0) return 0;
    return 7 - dayOfWeek;
  }, []);
}

// ---------------------------------------------------------------------------
// Einzelne Quest-Karte
// ---------------------------------------------------------------------------

function QuestCard({ quest }: { quest: QuestItem }) {
  const progressPercent =
    quest.target > 0
      ? Math.min(100, Math.round((quest.progress / quest.target) * 100))
      : 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl p-3 ring-1 ring-foreground/10 bg-card transition-all',
        quest.completed && 'ring-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {quest.completed ? (
            <CheckCircle className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <div className="size-4 shrink-0 rounded-full border-2 border-muted-foreground/30" />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              quest.completed && 'text-emerald-700 dark:text-emerald-400',
            )}
          >
            {quest.title}
          </span>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-primary">
          <Zap className="size-3" />
          +{quest.reward}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground">{quest.description}</p>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {quest.progress}/{quest.target}
          </span>
          <span className="text-muted-foreground">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              quest.completed ? 'bg-emerald-500' : 'bg-primary',
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quest-Liste
// ---------------------------------------------------------------------------

export function QuestList({ quests }: QuestListProps) {
  const items = quests ?? MOCK_QUESTS;
  const daysRemaining = useDaysRemaining();

  // Abgeschlossene nach unten sortieren
  const sorted = [...items].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Wöchentliche Quests</CardTitle>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {daysRemaining === 0
              ? 'Endet heute'
              : `Noch ${daysRemaining} ${daysRemaining === 1 ? 'Tag' : 'Tage'}`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sorted.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </CardContent>
    </Card>
  );
}
