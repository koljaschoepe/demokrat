'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StepWahlkreis } from '@/components/onboarding/step-wahlkreis';
import { StepInterests } from '@/components/onboarding/step-interests';
import { StepDailyGoal } from '@/components/onboarding/step-daily-goal';
import { StepPreview } from '@/components/onboarding/step-preview';
import { trpc } from '@/lib/trpc/client';

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [wahlkreisId, setWahlkreisId] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);

  const completeOnboarding = trpc.users.completeOnboarding.useMutation({
    onSuccess: () => {
      router.push('/feed');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSkip = useCallback(() => {
    router.push('/feed');
  }, [router]);

  const handleComplete = useCallback(() => {
    setError(null);
    completeOnboarding.mutate({
      wahlkreis_id: wahlkreisId,
      categories,
      daily_goal: dailyGoal,
    });
  }, [completeOnboarding, wahlkreisId, categories, dailyGoal]);

  const progressPercent = (step / TOTAL_STEPS) * 100;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-lg flex-col px-4 py-6">
      {/* Header mit Fortschritt und Skip */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex-1">
          <Progress value={progressPercent}>
            <span className="sr-only">
              Schritt {step} von {TOTAL_STEPS}
            </span>
          </Progress>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {step}/{TOTAL_STEPS}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleSkip}
          aria-label="Onboarding überspringen"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Schritte */}
      <div className="flex-1">
        {step === 1 && (
          <StepWahlkreis
            onNext={(id) => {
              setWahlkreisId(id);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <StepInterests
            onNext={(cats) => {
              setCategories(cats);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepDailyGoal
            onNext={(goal) => {
              setDailyGoal(goal);
              setStep(4);
            }}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepPreview
            wahlkreisId={wahlkreisId}
            categories={categories}
            dailyGoal={dailyGoal}
            onComplete={handleComplete}
            onBack={() => setStep(3)}
          />
        )}
      </div>

      {/* Fehleranzeige */}
      {error && (
        <p className="mt-4 text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {completeOnboarding.isPending && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Wird gespeichert...
        </p>
      )}
    </div>
  );
}
