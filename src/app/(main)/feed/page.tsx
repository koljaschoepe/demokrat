'use client';

import { useState, useMemo } from 'react';
import { TopicCard } from '@/components/feed/topic-card';
import { FilterChips } from '@/components/feed/filter-chips';
import { StreakBar } from '@/components/feed/streak-bar';
import { SitzungswocheBanner } from '@/components/feed/sitzungswoche-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState('Alle');

  const sourceFilter = useMemo(() => {
    if (activeFilter === 'Bundestag') return 'BUNDESTAG' as const;
    if (activeFilter === 'Bürger') return 'BUERGER' as const;
    return 'all' as const;
  }, [activeFilter]);

  const categoryFilter = useMemo(() => {
    if (['Alle', 'Bundestag', 'Bürger', 'Trending'].includes(activeFilter)) return undefined;
    return activeFilter;
  }, [activeFilter]);

  const { data: feedData, isLoading, error } = trpc.feed.home.useQuery({
    source: sourceFilter,
    category: categoryFilter,
  });

  const { data: trendingData } = trpc.feed.trending.useQuery(undefined, {
    enabled: activeFilter === 'Trending',
  });

  const topics = useMemo(() => {
    if (activeFilter === 'Trending') {
      return trendingData?.topics ?? [];
    }
    return feedData?.topics ?? [];
  }, [activeFilter, feedData, trendingData]);

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <StreakBar currentStreak={3} dailyProgress={2} dailyGoal={5} />
      <SitzungswocheBanner isActive />
      <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {isLoading ? (
        <FeedSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-destructive">
            Fehler beim Laden des Feeds. Bitte versuche es erneut.
          </p>
        </div>
      ) : topics.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted-foreground">
            Noch keine Themen vorhanden. Erstelle das erste Thema!
          </p>
          <Link
            href="/create"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Thema erstellen
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              id={topic.id}
              title={topic.title}
              source={topic.source as 'BUNDESTAG' | 'BUERGER'}
              category={topic.category}
              voteCount={topic.vote_count}
              commentCount={topic.comment_count}
              closesAt={topic.closes_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
