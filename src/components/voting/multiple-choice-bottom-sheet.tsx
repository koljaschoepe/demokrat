'use client';

import { useState, useCallback } from 'react';
import { Check, ArrowLeft, Share2, ExternalLink, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { VoteCountdown } from '@/components/voting/vote-countdown';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

interface MultipleChoiceBottomSheetProps {
  topicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  votingClosesAt: string | null;
  options: string[];
  maxChoices: number;
  /** When changing an existing vote, pass comma-separated current choices */
  currentChoice?: string | null;
  /** When true, uses votes.change instead of votes.cast */
  isChange?: boolean;
}

type SheetState = 'selection' | 'confirmation' | 'success';

/**
 * Bottom sheet for multiple-choice voting.
 * Allows selecting up to maxChoices options with checkboxes.
 */
export function MultipleChoiceBottomSheet({
  topicId,
  open,
  onOpenChange,
  votingClosesAt,
  options,
  maxChoices,
  currentChoice,
  isChange = false,
}: MultipleChoiceBottomSheetProps) {
  const initialSelected = currentChoice
    ? currentChoice.split(',').filter((c) => options.includes(c))
    : [];

  const [state, setState] = useState<SheetState>('selection');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelected);
  const [error, setError] = useState<string | null>(null);
  const [eventHash, setEventHash] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const castVote = trpc.votes.cast.useMutation({
    onSuccess: (data) => {
      setEventHash(data.eventHash);
      setState('success');
      setError(null);
      utils.votes.myVote.invalidate({ topicId });
      utils.votes.results.invalidate({ topicId });
    },
    onError: (err) => {
      setError(err.message || 'Fehler beim Abstimmen. Bitte versuchen Sie es erneut.');
    },
  });

  const changeVote = trpc.votes.change.useMutation({
    onSuccess: (data) => {
      setEventHash(data.eventHash);
      setState('success');
      setError(null);
      utils.votes.myVote.invalidate({ topicId });
      utils.votes.results.invalidate({ topicId });
    },
    onError: (err) => {
      setError(err.message || 'Fehler beim Ändern. Bitte versuchen Sie es erneut.');
    },
  });

  const isLoading = castVote.isPending || changeVote.isPending;
  const isMaxReached = selectedOptions.length >= maxChoices;

  const handleToggle = useCallback(
    (option: string, checked: boolean) => {
      setSelectedOptions((prev) => {
        if (checked) {
          if (prev.length >= maxChoices) return prev;
          return [...prev, option];
        }
        return prev.filter((o) => o !== option);
      });
    },
    [maxChoices],
  );

  const handleContinue = useCallback(() => {
    if (selectedOptions.length === 0) return;
    setState('confirmation');
    setError(null);
  }, [selectedOptions]);

  const handleConfirm = useCallback(() => {
    const choice = selectedOptions.join(',');

    if (isChange) {
      changeVote.mutate({ topicId, newChoice: choice });
    } else {
      castVote.mutate({ topicId, choice });
    }
  }, [selectedOptions, isChange, topicId, castVote, changeVote]);

  const handleBack = useCallback(() => {
    setState('selection');
    setError(null);
  }, []);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        // Reset state when closing
        setState('selection');
        setSelectedOptions(
          currentChoice
            ? currentChoice.split(',').filter((c) => options.includes(c))
            : [],
        );
        setError(null);
        setEventHash(null);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange, currentChoice, options],
  );

  const handleShare = useCallback(async () => {
    const text = 'Ich habe gerade bei Demokrat abgestimmt!';
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled or share failed — ignore
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  }, []);

  function truncateHash(hash: string): string {
    if (hash.length <= 14) return hash;
    return `${hash.slice(0, 5)}...${hash.slice(-5)}`;
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl pb-8 max-h-[70vh] overflow-y-auto"
      >
        {/* Selection State */}
        {state === 'selection' && (
          <>
            <SheetHeader>
              <SheetTitle>Ihre Stimme</SheetTitle>
              <SheetDescription>
                Wählen Sie bis zu {maxChoices}{' '}
                {maxChoices === 1 ? 'Option' : 'Optionen'}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-3 px-4">
              <p className="text-sm font-medium text-muted-foreground">
                {selectedOptions.length} von {maxChoices} gewählt
              </p>

              <div className="flex flex-col gap-2">
                {options.map((option) => {
                  const isChecked = selectedOptions.includes(option);
                  const isDisabled = !isChecked && isMaxReached;

                  return (
                    <label
                      key={option}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                        isChecked
                          ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20'
                          : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
                        isDisabled && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        disabled={isDisabled}
                        onCheckedChange={(checked) =>
                          handleToggle(option, checked as boolean)
                        }
                      />
                      <Label
                        className={cn(
                          'cursor-pointer text-sm font-normal',
                          isDisabled && 'cursor-not-allowed',
                        )}
                      >
                        {option}
                      </Label>
                    </label>
                  );
                })}
              </div>

              <Button
                className="w-full h-12 mt-2 bg-indigo-600 text-white hover:bg-indigo-700"
                disabled={selectedOptions.length === 0}
                onClick={handleContinue}
              >
                Weiter
              </Button>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="mt-1 flex justify-center">
                <VoteCountdown closesAt={votingClosesAt} />
              </div>
            </div>
          </>
        )}

        {/* Confirmation State */}
        {state === 'confirmation' && (
          <>
            <SheetHeader>
              <SheetTitle>Sind Sie sicher?</SheetTitle>
              <SheetDescription>
                Sie haben {selectedOptions.length}{' '}
                {selectedOptions.length === 1 ? 'Option' : 'Optionen'} gewählt
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-3 px-4">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
                <ul className="space-y-1.5">
                  {selectedOptions.map((option) => (
                    <li
                      key={option}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Check className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                      {option}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="w-full h-12 bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 motion-safe:animate-spin" />
                    <span className="ml-2">Wird abgestimmt...</span>
                  </>
                ) : (
                  isChange ? 'Stimme ändern' : 'Abstimmen'
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ArrowLeft className="size-4" />
                <span className="ml-1">Zurück</span>
              </Button>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          </>
        )}

        {/* Success State */}
        {state === 'success' && (
          <>
            <SheetHeader>
              <SheetTitle>Stimme abgegeben!</SheetTitle>
              <SheetDescription>
                Ihre Stimme wurde erfolgreich erfasst
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col items-center gap-4 px-4 py-2">
              <div className="motion-safe:animate-[scale-bounce_200ms_ease-out]">
                <div className="flex size-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Check className="size-8" strokeWidth={3} />
                </div>
              </div>

              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-800 dark:bg-indigo-900/20">
                <ul className="space-y-1">
                  {selectedOptions.map((option) => (
                    <li
                      key={option}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <Check className="size-3 text-indigo-600 dark:text-indigo-400" />
                      {option}
                    </li>
                  ))}
                </ul>
              </div>

              {eventHash && (
                <p className="font-mono text-xs text-muted-foreground">
                  Hash: {truncateHash(eventHash)}
                </p>
              )}

              <div className="flex w-full flex-col gap-2">
                <Button
                  className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => handleOpenChange(false)}
                >
                  <ExternalLink className="size-4" />
                  <span className="ml-1">Ergebnis ansehen</span>
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="size-4" />
                  <span className="ml-1">Teilen</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
