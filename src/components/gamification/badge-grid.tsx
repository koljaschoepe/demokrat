'use client';

import {
  CheckSquare,
  Brain,
  Flame,
  MessageCircle,
  GitMerge,
  Lightbulb,
  MapPin,
  Sparkles,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';

// ---------------------------------------------------------------------------
// Icon-Mapping
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  vote: CheckSquare,
  brain: Brain,
  flame: Flame,
  comment: MessageCircle,
  bridge: GitMerge,
  lightbulb: Lightbulb,
  map: MapPin,
  rainbow: Sparkles,
};

// ---------------------------------------------------------------------------
// Mock-Daten
// ---------------------------------------------------------------------------

const MOCK_BADGES: BadgeItem[] = [
  { id: 'first_vote', name: 'Erste Stimme', description: 'Deine erste Abstimmung', icon: 'vote', earned: true, earned_at: '2026-02-15T10:30:00Z', progress: 1, threshold: 1 },
  { id: 'voter_10', name: 'Aktiver Wähler', description: '10 Abstimmungen abgegeben', icon: 'vote', earned: true, earned_at: '2026-03-01T14:00:00Z', progress: 10, threshold: 10 },
  { id: 'voter_50', name: 'Stammwähler', description: '50 Abstimmungen abgegeben', icon: 'vote', earned: false, progress: 27, threshold: 50 },
  { id: 'voter_100', name: 'Demokratie-Veteran', description: '100 Abstimmungen', icon: 'vote', earned: false, progress: 27, threshold: 100 },
  { id: 'quiz_master', name: 'Quizmaster', description: '10 Quiz richtig beantwortet', icon: 'brain', earned: true, earned_at: '2026-03-10T09:00:00Z', progress: 10, threshold: 10 },
  { id: 'session_streak_7', name: 'Wochenlerner', description: '7-Tage Session-Streak', icon: 'flame', earned: true, earned_at: '2026-02-22T08:00:00Z', progress: 7, threshold: 7 },
  { id: 'session_streak_30', name: 'Monatsstreak', description: '30-Tage Session-Streak', icon: 'flame', earned: false, progress: 14, threshold: 30 },
  { id: 'first_comment', name: 'Erste Wortmeldung', description: 'Deinen ersten Kommentar geschrieben', icon: 'comment', earned: true, earned_at: '2026-02-16T11:00:00Z', progress: 1, threshold: 1 },
  { id: 'bridge_builder', name: 'Brückenbauer', description: 'Bridging-Score über 0.8', icon: 'bridge', earned: false, progress: 0.6, threshold: 0.8 },
  { id: 'topic_creator', name: 'Themenstarter', description: 'Ein eigenes Thema erstellt', icon: 'lightbulb', earned: false, progress: 0, threshold: 1 },
  { id: 'wahlkreis_pioneer', name: 'Wahlkreis-Pionier', description: 'Erster aktiver Nutzer im Wahlkreis', icon: 'map', earned: false, progress: 0, threshold: 1 },
  { id: 'diversity_champion', name: 'Vielfalt-Champion', description: 'In 8+ Kategorien abgestimmt', icon: 'rainbow', earned: false, progress: 4, threshold: 8 },
];

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earned_at?: string;
  progress?: number;
  threshold?: number;
}

interface BadgeGridProps {
  badges?: BadgeItem[];
}

// ---------------------------------------------------------------------------
// Datum-Formatierung
// ---------------------------------------------------------------------------

function formatDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoString));
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Einzelner Badge
// ---------------------------------------------------------------------------

function BadgeCard({ badge }: { badge: BadgeItem }) {
  const Icon = ICON_MAP[badge.icon] ?? CheckSquare;
  const progressPercent =
    badge.threshold && badge.threshold > 0
      ? Math.min(100, Math.round(((badge.progress ?? 0) / badge.threshold) * 100))
      : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            'flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all',
            'ring-1 ring-foreground/10 bg-card',
            badge.earned
              ? 'hover:ring-primary/30'
              : 'opacity-60 grayscale hover:opacity-80',
          )}
        >
          {/* Icon */}
          <div className="relative">
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-full',
                badge.earned
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Icon className="size-6" />
            </div>
            {!badge.earned && (
              <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-muted-foreground/20">
                <Lock className="size-3 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Name */}
          <span
            className={cn(
              'text-xs font-medium leading-tight',
              badge.earned ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {badge.name}
          </span>

          {/* Earned date or progress bar */}
          {badge.earned && badge.earned_at ? (
            <span className="text-[10px] text-muted-foreground">
              {formatDate(badge.earned_at)}
            </span>
          ) : (
            badge.threshold != null &&
            badge.threshold > 0 && (
              <div className="w-full space-y-0.5">
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/50 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {badge.progress ?? 0}/{badge.threshold}
                </span>
              </div>
            )
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{badge.name}</p>
          <p className="text-muted-foreground">{badge.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Grid-Komponente
// ---------------------------------------------------------------------------

export function BadgeGrid({ badges }: BadgeGridProps) {
  const items = badges ?? MOCK_BADGES;

  // Verdiente zuerst, dann nach Name sortieren
  const sorted = [...items].sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    return a.name.localeCompare(b.name, 'de');
  });

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {sorted.map((badge) => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
}
