'use client';

import {
  Eye,
  Hand,
  Wrench,
  Shield,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type Tier = 0 | 1 | 2 | 3 | 4;

interface LevelProgressProps {
  currentPoints: number;
  currentTier: Tier;
}

const LEVELS: {
  tier: Tier;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  threshold: number;
}[] = [
  { tier: 0, name: 'Beobachter', icon: Eye, threshold: 0 },
  { tier: 1, name: 'Teilnehmer', icon: Hand, threshold: 50 },
  { tier: 2, name: 'Mitwirkender', icon: Wrench, threshold: 200 },
  { tier: 3, name: 'Moderator', icon: Shield, threshold: 1000 },
  { tier: 4, name: 'Vertrauensperson', icon: Crown, threshold: 5000 },
];

export function LevelProgress({ currentPoints, currentTier }: LevelProgressProps) {
  const currentLevel = LEVELS[currentTier]!;
  const nextLevel = currentTier < 4 ? LEVELS[currentTier + 1] : null;
  const CurrentIcon = currentLevel.icon;

  const currentThreshold = currentLevel.threshold;
  const nextThreshold = nextLevel?.threshold ?? currentLevel.threshold;
  const pointsInLevel = currentPoints - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const progressPercent = nextLevel
    ? Math.min(100, Math.round((pointsInLevel / pointsNeeded) * 100))
    : 100;

  return (
    <div className="space-y-3">
      {/* Current Level */}
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
          <CurrentIcon className="size-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{currentLevel.name}</p>
          <p className="text-xs text-muted-foreground">
            Stufe {currentTier}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-2">
        {nextLevel ? (
          <span className="text-xs text-muted-foreground">
            {currentPoints} / {nextThreshold} Punkte bis Stufe {nextLevel.tier}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {currentPoints} Punkte &middot; Höchste Stufe erreicht
          </span>
        )}
      </Progress>

      {/* Level Labels */}
      <div className="flex justify-between">
        {LEVELS.map((level) => {
          const LevelIcon = level.icon;
          const isActive = level.tier <= currentTier;
          return (
            <div
              key={level.tier}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  'flex size-6 items-center justify-center rounded-full',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <LevelIcon className="size-3" />
              </div>
              <span
                className={cn(
                  'text-[10px] leading-tight',
                  isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {level.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
