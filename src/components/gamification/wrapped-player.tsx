'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  Award,
  MapPin,
  GitMerge,
  Star,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

interface WrappedStats {
  totalVotes: number;
  longestStreak: number;
  favoriteCategory: string;
  percentile: number;
  civicAttributes: Array<{ attribute: string; value: number }>;
  wahlkreisRank: number;
  badgesEarned: number;
  avgBridgingScore: number;
}

interface WrappedPlayerProps {
  year?: number;
  stats?: WrappedStats;
  onClose?: () => void;
}

// ---------------------------------------------------------------------------
// Mock-Daten
// ---------------------------------------------------------------------------

const MOCK_STATS: WrappedStats = {
  totalVotes: 127,
  longestStreak: 23,
  favoriteCategory: 'Umwelt & Klima',
  percentile: 82,
  civicAttributes: [
    { attribute: 'Beteiligung', value: 75 },
    { attribute: 'Wissen', value: 60 },
    { attribute: 'Diskussion', value: 45 },
    { attribute: 'Konsistenz', value: 85 },
    { attribute: 'Vielfalt', value: 55 },
    { attribute: 'Einfluss', value: 30 },
  ],
  wahlkreisRank: 12,
  badgesEarned: 8,
  avgBridgingScore: 0.72,
};

// ---------------------------------------------------------------------------
// Konfiguration
// ---------------------------------------------------------------------------

const TOTAL_SLIDES = 10;
const SLIDE_DURATION = 6000; // 6 Sekunden pro Slide
const TIMER_INTERVAL = 50; // Timer-Update alle 50ms

// ---------------------------------------------------------------------------
// Animierte Zahl
// ---------------------------------------------------------------------------

function AnimatedNumber({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return <span className="tabular-nums">{display}</span>;
}

// ---------------------------------------------------------------------------
// Einzelne Slides
// ---------------------------------------------------------------------------

function SlideTitle({ year }: { year: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      {/* Dekorative Partikel */}
      <div className="relative">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute size-2 rounded-full bg-indigo-400/60"
            style={{
              top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 12)}%`,
              left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 12)}%`,
              animationDelay: `${i * 100}ms`,
              opacity: 0.3 + Math.random() * 0.5,
            }}
          />
        ))}
        <Star className="size-16 text-primary motion-safe:animate-in motion-safe:spin-in-90 motion-safe:zoom-in-50" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Dein Demokratie-Jahr
      </h1>
      <p className="text-5xl font-black text-primary">{year}</p>
    </div>
  );
}

function SlideVotes({ totalVotes }: { totalVotes: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg text-muted-foreground">Du hast</p>
      <p className="text-7xl font-black text-primary">
        <AnimatedNumber value={totalVotes} />
      </p>
      <p className="text-lg text-muted-foreground">Mal abgestimmt</p>
      <p className="mt-4 text-sm text-muted-foreground/70">
        Jede Stimme zählt für unsere Demokratie
      </p>
    </div>
  );
}

function SlideStreak({ longestStreak }: { longestStreak: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <Flame className="size-16 text-orange-500 motion-safe:animate-in motion-safe:zoom-in-50" />
      <p className="text-lg text-muted-foreground">Dein längster Streak</p>
      <p className="text-7xl font-black text-orange-500">
        <AnimatedNumber value={longestStreak} />
      </p>
      <p className="text-lg text-muted-foreground">Tage am Stück</p>
    </div>
  );
}

function SlideCategory({ favoriteCategory }: { favoriteCategory: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
        <span className="text-4xl">🌍</span>
      </div>
      <p className="text-lg text-muted-foreground">Dein Lieblingsthema</p>
      <p className="text-3xl font-bold text-foreground">{favoriteCategory}</p>
    </div>
  );
}

function SlidePercentile({ percentile }: { percentile: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg text-muted-foreground">Du warst aktiver als</p>
      <p className="text-7xl font-black text-primary">
        <AnimatedNumber value={percentile} />%
      </p>
      <p className="text-lg text-muted-foreground">der Nutzer</p>
      {/* Einfacher Balken */}
      <div className="mt-4 h-3 w-48 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000"
          style={{ width: `${percentile}%` }}
        />
      </div>
    </div>
  );
}

function SlideCivicCharacter({
  civicAttributes,
}: {
  civicAttributes: Array<{ attribute: string; value: number }>;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-medium text-foreground">
        Dein Civic Character
      </p>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={civicAttributes} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="attribute"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Werte"
              dataKey="value"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SlideWahlkreis({ wahlkreisRank }: { wahlkreisRank: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <MapPin className="size-16 text-primary motion-safe:animate-in motion-safe:zoom-in-50" />
      <p className="text-lg text-muted-foreground">Dein Wahlkreis</p>
      <p className="text-5xl font-black text-foreground">
        Platz <AnimatedNumber value={wahlkreisRank} />
      </p>
      <p className="text-sm text-muted-foreground/70">
        unter den aktivsten Bürgern
      </p>
    </div>
  );
}

function SlideBadges({ badgesEarned }: { badgesEarned: number }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <Award className="size-16 text-primary motion-safe:animate-in motion-safe:zoom-in-50" />
      <p className="text-lg text-muted-foreground">Verdiente Badges</p>
      <p className="text-7xl font-black text-primary">
        <AnimatedNumber value={badgesEarned} />
      </p>
      <p className="text-sm text-muted-foreground/70">
        Zeichen deines Engagements
      </p>
    </div>
  );
}

function SlideBridging({ avgBridgingScore }: { avgBridgingScore: number }) {
  const scoreDisplay = Math.round(avgBridgingScore * 100);
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <GitMerge className="size-16 text-emerald-500 motion-safe:animate-in motion-safe:zoom-in-50" />
      <p className="text-lg text-muted-foreground">Dein Bridging-Score</p>
      <p className="text-6xl font-black text-emerald-500">
        <AnimatedNumber value={scoreDisplay} />
        <span className="text-2xl text-muted-foreground">%</span>
      </p>
      <p className="text-sm text-muted-foreground/70">
        Du baust Brücken zwischen Meinungen
      </p>
    </div>
  );
}

function SlideOutro({ onShare }: { onShare: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-5xl">🙏</div>
      <h2 className="text-2xl font-bold text-foreground">
        Danke für deine Teilnahme!
      </h2>
      <p className="text-muted-foreground">
        Gemeinsam stärken wir die Demokratie. Auf ein weiteres engagiertes Jahr!
      </p>
      <Button size="lg" className="mt-4 gap-2" onClick={onShare}>
        <Share2 className="size-4" />
        Ergebnis teilen
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stories-Timer-Leiste
// ---------------------------------------------------------------------------

function StoriesTimerBar({
  currentSlide,
  totalSlides,
  slideProgress,
}: {
  currentSlide: number;
  totalSlides: number;
  slideProgress: number;
}) {
  return (
    <div className="flex gap-1 px-4 pt-4" role="progressbar" aria-valuenow={currentSlide + 1} aria-valuemin={1} aria-valuemax={totalSlides}>
      {Array.from({ length: totalSlides }, (_, i) => (
        <div
          key={i}
          className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/20"
        >
          <div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full bg-white transition-[width] duration-75 ease-linear',
              'motion-reduce:transition-none',
            )}
            style={{
              width:
                i < currentSlide
                  ? '100%'
                  : i === currentSlide
                    ? `${slideProgress}%`
                    : '0%',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hauptkomponente
// ---------------------------------------------------------------------------

export function WrappedPlayer({
  year = 2026,
  stats,
  onClose,
}: WrappedPlayerProps) {
  const data = stats ?? MOCK_STATS;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef<number>(0);

  // Auto-Advance
  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setSlideProgress(progress);

      if (elapsed >= SLIDE_DURATION) {
        if (currentSlide < TOTAL_SLIDES - 1) {
          setCurrentSlide((prev) => prev + 1);
          setSlideProgress(0);
        } else {
          setIsPaused(true);
          setSlideProgress(100);
        }
        if (timerRef.current !== null) clearInterval(timerRef.current);
      }
    }, TIMER_INTERVAL);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [currentSlide, isPaused]);

  const goNext = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide((prev) => prev + 1);
      setSlideProgress(0);
      setIsPaused(false);
    }
  }, [currentSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setSlideProgress(0);
      setIsPaused(false);
    }
  }, [currentSlide]);

  // Tap-Zonen: linkes Drittel = zurück, rechtes Drittel = weiter
  const handleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const third = rect.width / 3;

      if (x < third) {
        goPrev();
      } else if (x > third * 2) {
        goNext();
      } else {
        // Mitte: Pause/Play
        setIsPaused((prev) => !prev);
      }
    },
    [goNext, goPrev],
  );

  // Swipe-Support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0]?.clientX ?? 0;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchEnd = e.changedTouches[0]?.clientX ?? 0;
      const diff = touchStartRef.current - touchEnd;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goNext();
        } else {
          goPrev();
        }
      }
    },
    [goNext, goPrev],
  );

  // Share
  const handleShare = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Mein Demokratie-Jahr ${year}`,
          text: `Ich habe ${data.totalVotes} Mal abgestimmt und war aktiver als ${data.percentile}% der Nutzer!`,
          url: window.location.origin,
        });
      } catch {
        // User cancelled
      }
    }
  }, [year, data.totalVotes, data.percentile]);

  // Slide-Rendering
  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <SlideTitle year={year} />;
      case 1:
        return <SlideVotes totalVotes={data.totalVotes} />;
      case 2:
        return <SlideStreak longestStreak={data.longestStreak} />;
      case 3:
        return <SlideCategory favoriteCategory={data.favoriteCategory} />;
      case 4:
        return <SlidePercentile percentile={data.percentile} />;
      case 5:
        return <SlideCivicCharacter civicAttributes={data.civicAttributes} />;
      case 6:
        return <SlideWahlkreis wahlkreisRank={data.wahlkreisRank} />;
      case 7:
        return <SlideBadges badgesEarned={data.badgesEarned} />;
      case 8:
        return <SlideBridging avgBridgingScore={data.avgBridgingScore} />;
      case 9:
        return <SlideOutro onShare={handleShare} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-indigo-950 via-indigo-900 to-indigo-950 text-white"
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Timer-Leiste */}
      <StoriesTimerBar
        currentSlide={currentSlide}
        totalSlides={TOTAL_SLIDES}
        slideProgress={slideProgress}
      />

      {/* Close-Button */}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute right-4 top-8 z-10 flex size-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Schließen"
        >
          <X className="size-4" />
        </button>
      )}

      {/* Slide-Inhalt */}
      <div className="flex flex-1 flex-col">{renderSlide()}</div>

      {/* Navigation-Pfeile (Desktop) */}
      <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between px-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className={cn(
            'pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-opacity hover:bg-white/20',
            currentSlide === 0 && 'opacity-0',
          )}
          aria-label="Zurück"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className={cn(
            'pointer-events-auto flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-opacity hover:bg-white/20',
            currentSlide === TOTAL_SLIDES - 1 && 'opacity-0',
          )}
          aria-label="Weiter"
          disabled={currentSlide === TOTAL_SLIDES - 1}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Slide-Zähler */}
      <div className="pb-6 text-center text-xs text-white/40">
        {currentSlide + 1} / {TOTAL_SLIDES}
      </div>
    </div>
  );
}
