'use client';

import { useMemo } from 'react';
import { Clock, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { VoteCountdown } from '@/components/voting/vote-countdown';
import { VoteStatus } from '@/components/voting/vote-status';
import { cn } from '@/lib/utils';

interface VotingSectionProps {
  topicId: string;
  topicStatus: 'draft' | 'pending' | 'active' | 'voting_closed' | 'archived';
  votingFormat: 'yes_no' | 'multiple_choice' | 'ranked_choice' | 'approval' | 'budget';
  votingConfig?: Record<string, unknown> | null;
  votingOpensAt: string | null;
  votingClosesAt: string | null;
  className?: string;
}

/**
 * Wrapper component for the voting area on topic detail pages.
 * Handles timing logic (not yet open, active, closed) and renders
 * VoteCountdown + VoteStatus or appropriate status messages.
 */
export function VotingSection({
  topicId,
  topicStatus,
  votingFormat,
  votingConfig,
  votingOpensAt,
  votingClosesAt,
  className,
}: VotingSectionProps) {
  const votingState = useMemo(() => {
    const now = Date.now();

    // Check if voting is closed by status
    if (topicStatus === 'voting_closed' || topicStatus === 'archived') {
      return 'closed' as const;
    }

    // Check if voting hasn't opened yet
    if (votingOpensAt) {
      const opensAt = new Date(votingOpensAt).getTime();
      if (now < opensAt) {
        return 'not_open' as const;
      }
    }

    // Check if voting window has passed
    if (votingClosesAt) {
      const closesAt = new Date(votingClosesAt).getTime();
      if (now > closesAt) {
        return 'closed' as const;
      }
    }

    // Check if topic is active
    if (topicStatus === 'active') {
      return 'active' as const;
    }

    // Draft or pending topics — voting not available
    return 'not_available' as const;
  }, [topicStatus, votingOpensAt, votingClosesAt]);

  // Only yes_no and multiple_choice are supported in this release
  const isSupportedFormat = votingFormat === 'yes_no' || votingFormat === 'multiple_choice';

  // Parse voting config for multiple choice
  const parsedConfig = useMemo(() => {
    if (votingFormat !== 'multiple_choice' || !votingConfig) return null;
    return {
      options: (votingConfig.options as string[]) ?? [],
      max_choices: (votingConfig.max_choices as number) ?? 1,
    };
  }, [votingFormat, votingConfig]);

  // Format the opens-at date for display
  const opensAtDisplay = useMemo(() => {
    if (!votingOpensAt) return null;
    return new Date(votingOpensAt).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [votingOpensAt]);

  return (
    <section className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Abstimmung</h3>
        {votingState === 'active' && (
          <VoteCountdown closesAt={votingClosesAt} />
        )}
      </div>

      <Separator />

      {/* Voting not yet open */}
      {votingState === 'not_open' && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
          <Clock className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Abstimmung noch nicht geöffnet
          </p>
          {opensAtDisplay && (
            <p className="text-xs text-muted-foreground">
              Öffnet am {opensAtDisplay}
            </p>
          )}
        </div>
      )}

      {/* Voting closed */}
      {votingState === 'closed' && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
          <Lock className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Abstimmung beendet
          </p>
        </div>
      )}

      {/* Topic not available for voting (draft/pending) */}
      {votingState === 'not_available' && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
          <Clock className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Abstimmung nicht verfügbar
          </p>
          <p className="text-xs text-muted-foreground">
            Dieses Thema ist noch nicht zur Abstimmung freigegeben.
          </p>
        </div>
      )}

      {/* Active voting — unsupported format */}
      {votingState === 'active' && !isSupportedFormat && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900">
          <p className="text-sm font-medium text-foreground">
            Dieses Abstimmungsformat wird noch nicht unterstützt.
          </p>
        </div>
      )}

      {/* Active voting — supported format */}
      {votingState === 'active' && isSupportedFormat && (
        <VoteStatus
          topicId={topicId}
          votingFormat={votingFormat}
          votingClosesAt={votingClosesAt}
          votingConfig={parsedConfig}
        />
      )}
    </section>
  );
}
