'use client';

import { useState, useCallback } from 'react';
import { Pencil, Trash2, Vote, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { YesNoBottomSheet } from '@/components/voting/yes-no-bottom-sheet';
import { MultipleChoiceBottomSheet } from '@/components/voting/multiple-choice-bottom-sheet';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

interface VoteStatusProps {
  topicId: string;
  votingFormat: 'yes_no' | 'multiple_choice';
  votingClosesAt: string | null;
  votingConfig?: { options?: string[]; max_choices?: number } | null;
}

/** Maps a yes/no/enthaltung choice to a display label */
function choiceLabel(choice: string, format: 'yes_no' | 'multiple_choice'): string {
  if (format === 'yes_no') {
    const labels: Record<string, string> = {
      ja: 'Ja',
      nein: 'Nein',
      enthaltung: 'Enthaltung',
    };
    return labels[choice] ?? choice;
  }
  // For multiple choice, the choice is comma-separated options
  return choice.split(',').join(', ');
}

/** Format a date string into German locale display */
function formatVotedAt(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Displays the user's current vote status and provides actions
 * to vote, change, or revoke their vote.
 */
export function VoteStatus({
  topicId,
  votingFormat,
  votingClosesAt,
  votingConfig,
}: VoteStatusProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isChangeMode, setIsChangeMode] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeMessage, setRevokeMessage] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: myVote, isLoading, error } = trpc.votes.myVote.useQuery({ topicId });

  const revokeVote = trpc.votes.revoke.useMutation({
    onSuccess: () => {
      setRevokeDialogOpen(false);
      setRevokeMessage('Ihre Stimme wurde zurückgezogen.');
      utils.votes.myVote.invalidate({ topicId });
      utils.votes.results.invalidate({ topicId });
      // Clear message after 3 seconds
      setTimeout(() => setRevokeMessage(null), 3000);
    },
    onError: (err) => {
      setRevokeMessage(err.message || 'Fehler beim Zurückziehen.');
    },
  });

  const handleVote = useCallback(() => {
    setIsChangeMode(false);
    setSheetOpen(true);
  }, []);

  const handleChange = useCallback(() => {
    setIsChangeMode(true);
    setSheetOpen(true);
  }, []);

  const handleRevoke = useCallback(() => {
    setRevokeDialogOpen(true);
  }, []);

  const handleConfirmRevoke = useCallback(() => {
    revokeVote.mutate({ topicId });
  }, [topicId, revokeVote]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-48" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        Fehler beim Laden: {error.message}
      </p>
    );
  }

  // Revoke success message
  const revokeMessageEl = revokeMessage ? (
    <p
      className={cn(
        'text-sm',
        revokeMessage.includes('Fehler')
          ? 'text-red-600 dark:text-red-400'
          : 'text-indigo-600 dark:text-indigo-400',
      )}
    >
      {revokeMessage}
    </p>
  ) : null;

  // No vote yet — show vote button
  if (!myVote?.hasVoted) {
    return (
      <div className="space-y-3">
        {revokeMessageEl}

        <Button
          className="w-full h-12 bg-indigo-600 text-white hover:bg-indigo-700 text-base font-semibold"
          onClick={handleVote}
        >
          <Vote className="size-5" />
          <span className="ml-2">Jetzt abstimmen</span>
        </Button>

        {/* Voting bottom sheet */}
        {votingFormat === 'yes_no' && (
          <YesNoBottomSheet
            topicId={topicId}
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            votingClosesAt={votingClosesAt}
          />
        )}
        {votingFormat === 'multiple_choice' && votingConfig?.options && (
          <MultipleChoiceBottomSheet
            topicId={topicId}
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            votingClosesAt={votingClosesAt}
            options={votingConfig.options}
            maxChoices={votingConfig.max_choices ?? 1}
          />
        )}
      </div>
    );
  }

  // Has voted — show status with actions
  return (
    <div className="space-y-4">
      {revokeMessageEl}

      {/* Current vote display */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {votingFormat === 'yes_no'
                ? 'Sie haben abgestimmt:'
                : 'Ihre Auswahl:'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {votingFormat === 'yes_no' ? (
                <Badge className="bg-indigo-100 text-indigo-800 border-transparent dark:bg-indigo-900/40 dark:text-indigo-300">
                  {choiceLabel(myVote.choice, votingFormat)}
                </Badge>
              ) : (
                myVote.choice.split(',').map((option: string) => (
                  <Badge
                    key={option}
                    className="bg-indigo-100 text-indigo-800 border-transparent dark:bg-indigo-900/40 dark:text-indigo-300"
                  >
                    {option}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>

        {myVote.votedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Abgestimmt am {formatVotedAt(myVote.votedAt)}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleChange}
        >
          <Pencil className="size-4" />
          <span className="ml-1">Ändern</span>
        </Button>

        <Button
          variant="destructive"
          className="flex-1"
          onClick={handleRevoke}
        >
          <Trash2 className="size-4" />
          <span className="ml-1">Stimme zurückziehen</span>
        </Button>
      </div>

      {/* Change vote bottom sheet */}
      {votingFormat === 'yes_no' && (
        <YesNoBottomSheet
          topicId={topicId}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          votingClosesAt={votingClosesAt}
          currentChoice={isChangeMode ? myVote.choice : undefined}
          isChange={isChangeMode}
        />
      )}
      {votingFormat === 'multiple_choice' && votingConfig?.options && (
        <MultipleChoiceBottomSheet
          topicId={topicId}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          votingClosesAt={votingClosesAt}
          options={votingConfig.options}
          maxChoices={votingConfig.max_choices ?? 1}
          currentChoice={isChangeMode ? myVote.choice : undefined}
          isChange={isChangeMode}
        />
      )}

      {/* Revoke confirmation dialog */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stimme zurückziehen?</DialogTitle>
            <DialogDescription>
              Ihre Stimme wird unwiderruflich zurückgezogen. Sie können danach
              erneut abstimmen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRevokeDialogOpen(false)}
              disabled={revokeVote.isPending}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={revokeVote.isPending}
            >
              {revokeVote.isPending ? (
                <>
                  <Loader2 className="size-4 motion-safe:animate-spin" />
                  <span className="ml-1">Wird zurückgezogen...</span>
                </>
              ) : (
                'Zurückziehen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
