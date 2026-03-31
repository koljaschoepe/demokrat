'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Loader2, CalendarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { SessionStepIndicator } from '@/components/session/session-step-indicator';
import { StepBriefing } from '@/components/session/step-briefing';
import { StepQuiz } from '@/components/session/step-quiz';
import { StepVote } from '@/components/session/step-vote';
import { StepPerspective } from '@/components/session/step-perspective';
import { StepSummary } from '@/components/session/step-summary';
import Link from 'next/link';

const STEPS = ['briefing', 'quiz', 'vote', 'perspective', 'summary'] as const;
const STEP_DURATIONS = [60, 45, 60, 90, 30]; // seconds

export function SessionPlayer() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [activitiesCompleted, setActivitiesCompleted] = useState({
    briefing: false,
    quiz: false,
    vote: false,
    perspective: false,
  });
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionStartedRef = useRef(false);

  // tRPC queries
  const contentQuery = trpc.session.todayContent.useQuery(undefined, {
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const progressQuery = trpc.session.myProgress.useQuery(undefined, {
    retry: 1,
    staleTime: 60 * 1000,
  });

  // tRPC mutations
  const startSession = trpc.session.startSession.useMutation();
  const completeStep = trpc.session.completeStep.useMutation({
    onSuccess: (data) => {
      if (data && typeof data === 'object' && 'points' in data) {
        setPointsEarned((prev) => prev + (data.points as number));
      }
    },
  });

  // Start session on mount
  useEffect(() => {
    if (!sessionStartedRef.current && contentQuery.data) {
      sessionStartedRef.current = true;
      startSession.mutate();
    }
  }, [contentQuery.data, startSession]);

  const duration = STEP_DURATIONS[currentStep] ?? 60;
  const progress = Math.min((elapsed / duration) * 100, 100);

  const handleStepComplete = useCallback(
    (stepIndex: number, payload?: Record<string, unknown>) => {
      completeStep.mutate({
        step: stepIndex,
        ...(payload ? { payload } : {}),
      });

      const stepName = STEPS[stepIndex];
      if (stepName) {
        setActivitiesCompleted((prev) => ({
          ...prev,
          [stepName]: true,
        }));
      }
    },
    [completeStep],
  );

  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      // Mark current step as complete when advancing
      if (STEPS[currentStep] !== 'summary') {
        handleStepComplete(currentStep);
      }
      setCurrentStep((s) => s + 1);
      setElapsed(0);
    }
  }, [currentStep, handleStepComplete]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setElapsed(0);
    }
  }, [currentStep]);

  // Timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.25;
        if (next >= (STEP_DURATIONS[currentStep] ?? 60)) {
          if (currentStep < STEPS.length - 1) {
            // Auto-advance: mark step complete
            if (STEPS[currentStep] !== 'summary') {
              handleStepComplete(currentStep);
            }
            setCurrentStep((s) => s + 1);
            return 0;
          }
          return prev;
        }
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [currentStep, isPaused, handleStepComplete]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') {
        router.push('/feed');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, router]);

  // Touch handling for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.changedTouches[0];
      if (touchStartX.current === null || touchStartY.current === null || !touch) return;

      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Only handle horizontal swipes (not vertical scroll)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          goNext();
        } else {
          goPrev();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [goNext, goPrev],
  );

  const handleClose = () => {
    router.push('/feed');
  };

  // Extract content from the query
  const content = contentQuery.data;
  const streakData = progressQuery.data;

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'briefing':
        return (
          <StepBriefing
            briefing={content?.briefing}
            onComplete={() => handleStepComplete(currentStep)}
          />
        );
      case 'quiz':
        return (
          <StepQuiz
            question={content?.quizQuestion}
            options={content?.quizOptions}
            explanation={content?.quizExplanation}
            onComplete={(correct) =>
              handleStepComplete(currentStep, { quizCorrect: correct })
            }
          />
        );
      case 'vote':
        return (
          <StepVote
            topicId={content?.topicId}
            onComplete={(choice) =>
              handleStepComplete(currentStep, { voteChoice: choice })
            }
          />
        );
      case 'perspective':
        return <StepPerspective />;
      case 'summary':
        return (
          <StepSummary
            pointsEarned={pointsEarned || undefined}
            currentStreak={
              streakData && typeof streakData === 'object' && 'currentStreak' in streakData
                ? (streakData.currentStreak as number)
                : undefined
            }
            activitiesCompleted={activitiesCompleted}
          />
        );
      default:
        return null;
    }
  };

  // Loading state
  if (contentQuery.isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Session wird geladen...</p>
        <div className="flex w-full max-w-sm flex-col gap-3 px-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (contentQuery.isError) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <X className="size-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-lg font-bold">Fehler beim Laden</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Die Session konnte nicht geladen werden. Bitte versuche es erneut.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => contentQuery.refetch()}>
            Erneut versuchen
          </Button>
          <Button onClick={() => router.push('/feed')}>
            Zum Feed
          </Button>
        </div>
      </div>
    );
  }

  // No content today state
  if (contentQuery.data === null || contentQuery.data === undefined) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <CalendarOff className="size-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-bold">Keine Session verfügbar</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Für heute gibt es keine neue Session. Schau morgen wieder vorbei oder stöbere im Feed!
        </p>
        <Button size="lg" render={<Link href="/feed" />}>
          Zum Feed
        </Button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top bar: step indicator + close */}
      <div className="flex items-start gap-2 pr-2">
        <div className="flex-1">
          <SessionStepIndicator
            currentStep={currentStep}
            totalSteps={STEPS.length}
            stepProgress={progress}
          />
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="mt-3 shrink-0"
          onClick={handleClose}
          aria-label="Schließen"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Timer display */}
      <div className="px-4 py-2 text-center text-xs tabular-nums text-muted-foreground">
        {Math.ceil(duration - elapsed)}s
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {renderStep()}
      </div>

      {/* Navigation footer */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            disabled={currentStep === 0}
            aria-label="Zurück"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <Button
            className={cn('flex-1')}
            size="lg"
            onClick={goNext}
            disabled={currentStep === STEPS.length - 1}
          >
            Weiter
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
