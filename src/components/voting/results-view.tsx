'use client';

import { trpc } from '@/lib/trpc/client';
import { useVoteResultsRealtime } from '@/hooks/use-vote-results-realtime';
import { usePresenceCounter } from '@/hooks/use-presence-counter';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { VoteBarChart } from '@/components/charts/vote-bar-chart';
import { VoteDonutChart } from '@/components/charts/vote-donut-chart';
import { ComparisonChart } from '@/components/charts/comparison-chart';
import { FactionBreakdown } from '@/components/charts/faction-breakdown';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ResultsViewProps {
  topicId: string;
  topicTitle: string;
  className?: string;
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Client-side results view that integrates:
 * - Realtime vote counter updates
 * - Presence counter
 * - Bar + donut charts for citizen votes
 * - Comparison chart (citizens vs Bundestag)
 * - Faction breakdown
 * - MdB highlight card
 */
export function ResultsView({
  topicId,
  topicTitle,
  className,
}: ResultsViewProps) {
  // Realtime vote results
  const { totalVotes, breakdown, isLive } =
    useVoteResultsRealtime(topicId);

  // Presence counter
  const { onlineCount } = usePresenceCounter(topicId);

  // Comparison data (citizens vs Bundestag)
  const {
    data: comparison,
    isLoading: comparisonLoading,
    error: comparisonError,
  } = trpc.votes.comparison.useQuery({ topicId }, { enabled: !!topicId });

  const hasBreakdown = breakdown.length > 0;
  const hasBundestagData =
    comparison?.bundestag != null && comparison.bundestag.total > 0;

  if (!hasBreakdown && totalVotes === 0) {
    return <ResultsSkeleton />;
  }

  return (
    <div className={cn('space-y-8', className)}>
      {/* Live indicator + presence counter */}
      <div className="flex flex-wrap items-center gap-4">
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-500"
              aria-hidden="true"
            />
            Live
          </span>
        )}
        {onlineCount > 0 && (
          <span className="text-xs text-muted-foreground">
            <AnimatedCounter
              value={onlineCount}
              className="font-medium text-foreground"
            />{' '}
            {onlineCount === 1
              ? 'Bürger schaut gerade zu'
              : 'Bürger schauen sich gerade die Ergebnisse an'}
          </span>
        )}
      </div>

      {/* Section: Bürgervotum */}
      <section aria-labelledby="buergervotum-heading">
        <h2
          id="buergervotum-heading"
          className="mb-4 text-lg font-semibold text-foreground"
        >
          Bürgervotum
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Stimmenverteilung</CardTitle>
              <CardDescription>
                Wie haben die Bürger abgestimmt?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoteBarChart
                breakdown={breakdown}
                totalVotes={totalVotes}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verteilung</CardTitle>
              <CardDescription>
                Anteil der Stimmen im Überblick
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoteDonutChart
                breakdown={breakdown}
                totalVotes={totalVotes}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section: Vergleich mit dem Bundestag */}
      {comparisonLoading && (
        <Skeleton className="h-48" />
      )}

      {comparisonError && (
        <ErrorDisplay message="Vergleichsdaten konnten nicht geladen werden." />
      )}

      {hasBundestagData && comparison && (
        <section aria-labelledby="vergleich-heading">
          <h2
            id="vergleich-heading"
            className="mb-4 text-lg font-semibold text-foreground"
          >
            Vergleich mit dem Bundestag
          </h2>

          {/* MdB highlight card */}
          {comparison.myMdb && (
            <Card className="mb-6 border-indigo-200 dark:border-indigo-800">
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  <span className="text-sm font-bold" aria-hidden="true">
                    MdB
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Ihr Abgeordneter{' '}
                    <span className="font-semibold">
                      {comparison.myMdb.name}
                    </span>{' '}
                    ({comparison.myMdb.fraktion}) hat{' '}
                    <span className="font-semibold capitalize">
                      {comparison.myMdb.vote === 'ja'
                        ? 'Ja'
                        : comparison.myMdb.vote === 'nein'
                          ? 'Nein'
                          : comparison.myMdb.vote === 'enthaltung'
                            ? 'Enthaltung'
                            : 'nicht abgegeben'}
                    </span>{' '}
                    gestimmt.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Bürger vs. Bundestag</CardTitle>
              <CardDescription>
                Wie unterscheidet sich das Bürgervotum vom Bundestag?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonChart
                citizens={comparison.citizens}
                bundestag={comparison.bundestag!}
                delta={comparison.delta!}
              />
            </CardContent>
          </Card>
        </section>
      )}

      {/* Section: Fraktionen im Detail */}
      {hasBundestagData && comparison?.factions != null && comparison.factions.length > 0 && (
        <section aria-labelledby="fraktionen-heading">
          <h2
            id="fraktionen-heading"
            className="mb-4 text-lg font-semibold text-foreground"
          >
            Fraktionen im Detail
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Abstimmungsverhalten nach Fraktion</CardTitle>
              <CardDescription>
                Wie haben die einzelnen Fraktionen abgestimmt?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FactionBreakdown factions={comparison.factions!} />
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
