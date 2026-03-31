'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Landmark, ThumbsUp, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  query: string;
  source: string;
  sort: string;
  className?: string;
}

const MOCK_RESULTS = [
  {
    id: '1',
    title: 'Cannabisgesetz — Änderungsantrag',
    source: 'BUNDESTAG' as const,
    category: 'Gesundheit',
    voteCount: 1247,
  },
  {
    id: '2',
    title: 'Tempolimit auf Autobahnen',
    source: 'BUERGER' as const,
    category: 'Verkehr',
    voteCount: 3891,
  },
  {
    id: '3',
    title: 'Digitale Verwaltung bis 2028',
    source: 'BUNDESTAG' as const,
    category: 'Digitalisierung',
    voteCount: 567,
  },
  {
    id: '4',
    title: 'Mindestlohn-Erhöhung auf 15 Euro',
    source: 'BUERGER' as const,
    category: 'Wirtschaft',
    voteCount: 2156,
  },
  {
    id: '5',
    title: 'Wehrpflicht-Debatte',
    source: 'BUNDESTAG' as const,
    category: 'Sicherheit',
    voteCount: 4523,
  },
];

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="rounded-sm bg-yellow-200 px-0.5 dark:bg-yellow-900">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function ResultCard({
  result,
  query,
}: {
  result: (typeof MOCK_RESULTS)[number];
  query: string;
}) {
  return (
    <Link href={`/topic/${result.id}`}>
      <Card size="sm" className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              {highlightMatch(result.title, query)}
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant={result.source === 'BUNDESTAG' ? 'default' : 'secondary'}
                className={cn(
                  'text-[10px]',
                  result.source === 'BUNDESTAG' &&
                    'bg-primary text-primary-foreground',
                  result.source === 'BUERGER' &&
                    'bg-muted text-muted-foreground'
                )}
              >
                {result.source === 'BUNDESTAG' ? (
                  <>
                    <Landmark className="size-2.5" />
                    Bundestag
                  </>
                ) : (
                  'Bürger'
                )}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {result.category}
              </Badge>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <ThumbsUp className="size-3" />
            {result.voteCount.toLocaleString('de-DE')}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} size="sm">
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TrendingTopics() {
  const trending = MOCK_RESULTS.slice(0, 3);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <TrendingUp className="size-4" />
        Trending Themen
      </div>
      {trending.map((result) => (
        <ResultCard key={result.id} result={result} query="" />
      ))}
    </div>
  );
}

export function SearchResults({
  query,
  source,
  sort,
  className,
}: SearchResultsProps) {
  const filteredResults = useMemo(() => {
    let results = MOCK_RESULTS;

    // Filter by query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.category.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by source
    if (source !== 'all') {
      results = results.filter((r) => r.source === source);
    }

    // Sort
    if (sort === 'most_votes') {
      results = [...results].sort((a, b) => b.voteCount - a.voteCount);
    }
    // 'newest' and 'relevance' use default order for mock data

    return results;
  }, [query, source, sort]);

  // No query yet: show trending
  if (!query.trim()) {
    return (
      <div className={cn('mt-6', className)}>
        <TrendingTopics />
      </div>
    );
  }

  // No results
  if (filteredResults.length === 0) {
    return (
      <div className={cn('mt-6 space-y-6', className)}>
        <p className="text-center text-sm text-muted-foreground">
          Keine Ergebnisse für &laquo;{query}&raquo;
        </p>
        <TrendingTopics />
      </div>
    );
  }

  return (
    <div className={cn('mt-4 space-y-3', className)}>
      <p className="text-xs text-muted-foreground">
        {filteredResults.length} Ergebnis{filteredResults.length !== 1 ? 'se' : ''}
      </p>
      {filteredResults.map((result) => (
        <ResultCard key={result.id} result={result} query={query} />
      ))}
    </div>
  );
}

export { ResultsSkeleton };
