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
import { VoteCountdown } from '@/components/voting/vote-countdown';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

type YesNoChoice = 'ja' | 'nein' | 'enthaltung';

interface YesNoBottomSheetProps {
  topicId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  votingClosesAt: string | null;
  /** When changing an existing vote, pass the current choice to highlight it */
  currentChoice?: string | null;
  /** When true, uses votes.change instead of votes.cast */
  isChange?: boolean;
}

type SheetState = 'selection' | 'confirmation' | 'success';

const CHOICE_CONFIG: Record<YesNoChoice, { label: string; className: string; selectedClassName: string }> = {
  ja: {
    label: 'Ja',
    className: 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700',
    selectedClassName: 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900',
  },
  nein: {
    label: 'Nein',
    className: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    selectedClassName: 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900',
  },
  enthaltung: {
    label: 'Enthaltung',
    className: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700',
    selectedClassName: 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900',
  },
};

/**
 * Bottom sheet for Ja/Nein/Enthaltung voting.
 * Three states: selection -> confirmation -> success.
 */
export function YesNoBottomSheet({
  topicId,
  open,
  onOpenChange,
  votingClosesAt,
  currentChoice,
  isChange = false,
}: YesNoBottomSheetProps) {
  const [state, setState] = useState<SheetState>('selection');
  const [selectedChoice, setSelectedChoice] = useState<YesNoChoice | null>(null);
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

  const handleSelect = useCallback((choice: YesNoChoice) => {
    setSelectedChoice(choice);
    setState('confirmation');
    setError(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedChoice) return;

    if (isChange) {
      changeVote.mutate({ topicId, newChoice: selectedChoice });
    } else {
      castVote.mutate({ topicId, choice: selectedChoice });
    }
  }, [selectedChoice, isChange, topicId, castVote, changeVote]);

  const handleBack = useCallback(() => {
    setState('selection');
    setError(null);
  }, []);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      // Reset state when closing
      setState('selection');
      setSelectedChoice(null);
      setError(null);
      setEventHash(null);
    }
    onOpenChange(nextOpen);
  }, [onOpenChange]);

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
        className="rounded-t-2xl pb-8 max-h-[50vh] overflow-y-auto"
      >
        {/* Selection State */}
        {state === 'selection' && (
          <>
            <SheetHeader>
              <SheetTitle>Ihre Stimme</SheetTitle>
              <SheetDescription>
                Wählen Sie Ihre Abstimmungsoption
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-3 px-4">
              {(Object.entries(CHOICE_CONFIG) as [YesNoChoice, typeof CHOICE_CONFIG.ja][]).map(
                ([choice, config]) => {
                  const isCurrent = currentChoice === choice;
                  return (
                    <Button
                      key={choice}
                      className={cn(
                        'w-full justify-center text-base font-semibold',
                        choice === 'enthaltung' ? 'h-10' : 'h-14',
                        config.className,
                        isCurrent && config.selectedClassName,
                      )}
                      onClick={() => handleSelect(choice)}
                    >
                      {config.label}
                      {isCurrent && (
                        <span className="ml-2 text-xs font-normal opacity-75">
                          (aktuell)
                        </span>
                      )}
                    </Button>
                  );
                },
              )}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              <div className="mt-2 flex justify-center">
                <VoteCountdown closesAt={votingClosesAt} />
              </div>
            </div>
          </>
        )}

        {/* Confirmation State */}
        {state === 'confirmation' && selectedChoice && (
          <>
            <SheetHeader>
              <SheetTitle>Sind Sie sicher?</SheetTitle>
              <SheetDescription>
                Ihre Wahl:{' '}
                <span className="font-semibold text-foreground">
                  {CHOICE_CONFIG[selectedChoice].label}
                </span>
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-3 px-4">
              <div className="flex items-center justify-center py-4">
                <span
                  className={cn(
                    'inline-flex items-center rounded-lg px-6 py-3 text-lg font-semibold',
                    CHOICE_CONFIG[selectedChoice].className,
                  )}
                >
                  {CHOICE_CONFIG[selectedChoice].label}
                </span>
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
        {state === 'success' && selectedChoice && (
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

              <span
                className={cn(
                  'inline-flex items-center rounded-lg px-4 py-2 text-base font-semibold',
                  CHOICE_CONFIG[selectedChoice].className,
                )}
              >
                {CHOICE_CONFIG[selectedChoice].label}
              </span>

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
