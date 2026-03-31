'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createTopicSchema, type CreateTopicInput } from '@/lib/validators/topic';
import { StepBasics } from '@/components/create/step-basics';
import { StepVotingFormat } from '@/components/create/step-voting-format';
import { StepPreview } from '@/components/create/step-preview';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Grundlagen', fields: ['title', 'description', 'category', 'tags'] as const },
  { label: 'Abstimmungsformat', fields: ['voting_format', 'duration_days'] as const },
  { label: 'Vorschau', fields: [] as const },
] as const;

export function CreateTopicForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const methods = useForm<CreateTopicInput>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      tags: [],
      voting_format: 'yes_no',
      voting_options: ['', ''],
      max_choices: 1,
      duration_days: 14,
    },
    mode: 'onTouched',
  });

  const handleNext = async () => {
    // Validate current step fields before advancing
    const step = STEPS[currentStep];
    if (step && step.fields.length > 0) {
      const isValid = await methods.trigger(step.fields as unknown as (keyof CreateTopicInput)[]);
      if (!isValid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: CreateTopicInput) => {
    setIsSubmitting(true);
    try {
      // tRPC topics router doesn't exist yet — log for now
      console.log('Topic erstellt:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
            <Check className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Thema erstellt!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dein Thema wurde erfolgreich veröffentlicht und ist jetzt im Feed
              sichtbar.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              methods.reset();
              setCurrentStep(0);
              setIsSubmitted(false);
            }}
          >
            Neues Thema erstellen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, index) => (
            <div key={step.label} className="flex items-center">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                    index < currentStep &&
                      'bg-primary text-primary-foreground',
                    index === currentStep &&
                      'border-2 border-primary bg-primary/10 text-primary',
                    index > currentStep &&
                      'border-2 border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="size-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1 text-[10px]',
                    index === currentStep
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-2 mb-4 h-px w-10',
                    index < currentStep ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div>
          {currentStep === 0 && <StepBasics />}
          {currentStep === 1 && <StepVotingFormat />}
          {currentStep === 2 && <StepPreview isSubmitting={isSubmitting} />}
        </div>

        {/* Navigation buttons */}
        {currentStep < 2 && (
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="size-4" />
              Zurück
            </Button>
            <Button type="button" onClick={handleNext}>
              Weiter
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Back button on preview step */}
        {currentStep === 2 && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="w-full"
          >
            <ArrowLeft className="size-4" />
            Zurück zur Bearbeitung
          </Button>
        )}
      </form>
    </FormProvider>
  );
}
