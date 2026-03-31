'use client';

import { Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

interface SeasonProgressProps {
  seasonName?: string;
  currentLevel?: number;
  levelProgress?: number; // 0–100
  seasonPoints?: number;
  daysRemaining?: number;
}

// ---------------------------------------------------------------------------
// Kreisförmiger Fortschrittsanzeiger
// ---------------------------------------------------------------------------

function CircularProgress({
  progress,
  level,
  size = 96,
}: {
  progress: number;
  level: number;
  size?: number;
}) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Hintergrundkreis */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Fortschrittskreis */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#4f46e5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      {/* Level-Zahl in der Mitte */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-primary">
          {level}
        </span>
        <span className="text-[10px] text-muted-foreground">Level</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Level-Belohnungs-Vorschau
// ---------------------------------------------------------------------------

const LEVEL_REWARDS: Record<number, string> = {
  5: 'Profilrahmen: Bronze',
  10: 'Streak-Schild',
  15: 'Exklusives Badge',
  20: 'Profilrahmen: Silber',
  25: 'Abstimmungs-Boost',
  30: 'Profilrahmen: Gold',
};

function getNextReward(currentLevel: number): { level: number; reward: string } | null {
  const rewardLevels = Object.keys(LEVEL_REWARDS)
    .map(Number)
    .sort((a, b) => a - b);

  for (const lvl of rewardLevels) {
    if (lvl > currentLevel) {
      return { level: lvl, reward: LEVEL_REWARDS[lvl]! };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Komponente
// ---------------------------------------------------------------------------

export function SeasonProgress({
  seasonName = 'Frühling der Demokratie',
  currentLevel = 7,
  levelProgress = 62,
  seasonPoints = 1480,
  daysRemaining = 43,
}: SeasonProgressProps) {
  const nextReward = getNextReward(currentLevel);

  // Punkte für das nächste Level berechnen (Level * 50)
  const pointsForNextLevel = (currentLevel + 1) * 50;
  const pointsInCurrentLevel = Math.round((levelProgress / 100) * pointsForNextLevel);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saison</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="size-3" />
          {seasonName}
          <span className="text-muted-foreground">
            &middot; Noch {daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {/* Kreisförmiger Progress */}
          <CircularProgress progress={levelProgress} level={currentLevel} />

          {/* Statistiken */}
          <div className="flex w-full justify-around text-center">
            <div>
              <p className="text-lg font-bold tabular-nums">{seasonPoints}</p>
              <p className="text-xs text-muted-foreground">Saison-Punkte</p>
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums">
                {pointsInCurrentLevel}/{pointsForNextLevel}
              </p>
              <p className="text-xs text-muted-foreground">Bis Level {currentLevel + 1}</p>
            </div>
          </div>

          {/* Level-Fortschrittsbalken */}
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Level {currentLevel}</span>
              <span>Level {Math.min(currentLevel + 1, 30)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Nächste Belohnung */}
          {nextReward && (
            <div
              className={cn(
                'flex w-full items-center gap-3 rounded-lg bg-primary/5 p-3',
                'ring-1 ring-primary/10',
              )}
            >
              <Trophy className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium text-primary">
                  Level {nextReward.level} Belohnung
                </p>
                <p className="text-xs text-muted-foreground">
                  {nextReward.reward}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
