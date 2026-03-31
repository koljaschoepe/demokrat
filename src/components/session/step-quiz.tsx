'use client';

import { useState, useEffect } from 'react';
import { BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StepQuizProps {
  question?: string;
  options?: Array<{ text: string; is_correct: boolean }>;
  explanation?: string;
  onComplete?: (correct: boolean) => void;
}

const MOCK_QUIZ = {
  question: 'Welches Ministerium ist für das Cannabisgesetz zuständig?',
  options: [
    { text: 'Bundesministerium für Gesundheit', is_correct: true },
    { text: 'Bundesministerium der Justiz', is_correct: false },
    { text: 'Bundesministerium des Innern', is_correct: false },
    { text: 'Bundesministerium für Ernährung und Landwirtschaft', is_correct: false },
  ],
  explanation:
    'Das Bundesministerium für Gesundheit unter Karl Lauterbach war federführend für das Cannabisgesetz (CanG), das am 1. April 2024 in Kraft trat.',
};

export function StepQuiz({
  question,
  options,
  explanation,
  onComplete,
}: StepQuizProps) {
  const displayQuestion = question ?? MOCK_QUIZ.question;
  const displayOptions = options ?? MOCK_QUIZ.options;
  const displayExplanation = explanation ?? MOCK_QUIZ.explanation;

  const correctIndex = displayOptions.findIndex((o) => o.is_correct);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const hasAnswered = selectedIndex !== null;
  const isCorrect = selectedIndex === correctIndex;

  useEffect(() => {
    if (hasAnswered && onComplete) {
      onComplete(isCorrect);
    }
    // Only fire once when user answers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnswered]);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4">
      <div className="flex items-center gap-2">
        <BrainCircuit className="size-5 text-primary" />
        <h2 className="text-lg font-bold">Wissens-Check</h2>
      </div>

      <Card>
        <CardContent className="pt-4">
          <p className="text-base font-medium leading-snug">
            {displayQuestion}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {displayOptions.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrectOption = i === correctIndex;

          return (
            <Button
              key={i}
              variant="outline"
              size="lg"
              className={cn(
                'h-auto w-full justify-start whitespace-normal px-4 py-3 text-left text-sm',
                hasAnswered && isCorrectOption && 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100',
                hasAnswered && isSelected && !isCorrect && 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
              )}
              disabled={hasAnswered}
              onClick={() => setSelectedIndex(i)}
            >
              <span className="flex items-center gap-2">
                {hasAnswered && isCorrectOption && (
                  <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="size-4 shrink-0 text-red-600" />
                )}
                {option.text}
              </span>
            </Button>
          );
        })}
      </div>

      {hasAnswered && (
        <div
          className={cn(
            'flex flex-col gap-2 rounded-lg p-3 text-sm motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2',
            isCorrect
              ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100'
              : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
          )}
        >
          <p className="font-medium">{isCorrect ? 'Richtig!' : 'Leider falsch.'}</p>
          <p className="text-muted-foreground">{displayExplanation}</p>
          <Badge variant="secondary" className="w-fit">
            +10 Punkte
          </Badge>
        </div>
      )}
    </div>
  );
}
