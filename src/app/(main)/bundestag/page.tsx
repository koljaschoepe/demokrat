'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VorgangTimeline } from '@/components/bundestag/vorgang-timeline';
import {
  BundestagFiltersBar,
  type BundestagFilters,
} from '@/components/bundestag/bundestag-filters';
import { BundestagSearch } from '@/components/bundestag/bundestag-search';
import { Calendar, MessageCircle, Vote, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function VorgangSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function BundestagPage() {
  const [filters, setFilters] = useState<BundestagFilters>({});
  const [search, setSearch] = useState('');

  // Infinite-Query für paginierte Vorgänge
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.bundestag.vorgaenge.useInfiniteQuery(
    {
      limit: 20,
      category: filters.category,
      vorgangstyp: filters.vorgangstyp,
      search: search || undefined,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );

  // Filter-Handler: Search separat, damit der Debounce richtig greift
  const handleFilterChange = useCallback((newFilters: BundestagFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  // Intersection Observer für "Mehr laden"
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      {/* Seitentitel */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Bundestag</h1>
        <p className="text-sm text-muted-foreground">
          Aktuelle Gesetzgebungsverfahren und parlamentarische Vorgänge
        </p>
      </div>

      {/* Suche */}
      <BundestagSearch
        value={search}
        onChange={handleSearchChange}
        placeholder="Vorgänge durchsuchen..."
      />

      {/* Filter */}
      <BundestagFiltersBar
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Vorgänge-Liste */}
      <div className="space-y-3">
        {isLoading ? (
          // Loading-Skeletons
          <>
            <VorgangSkeleton />
            <VorgangSkeleton />
            <VorgangSkeleton />
            <VorgangSkeleton />
            <VorgangSkeleton />
          </>
        ) : allItems.length === 0 ? (
          // Leerzustand
          <Card>
            <CardContent>
              <p className="py-8 text-center text-sm text-muted-foreground">
                Keine Vorgänge gefunden.
                {(search || filters.category || filters.vorgangstyp) &&
                  ' Versuche andere Filter oder Suchbegriffe.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          // Vorgang-Karten
          allItems.map((item) => (
            <Link key={item.id} href={`/bundestag/${item.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-base">
                      {item.titel ?? 'Unbenannter Vorgang'}
                    </span>
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Badges: Vorgangstyp + Kategorie */}
                  <div className="flex flex-wrap gap-1.5">
                    {item.vorgangstyp && (
                      <Badge variant="secondary">{item.vorgangstyp}</Badge>
                    )}
                    {item.sachgebiet?.slice(0, 2).map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                    {item.topic?.category && (
                      <Badge variant="outline">{item.topic.category}</Badge>
                    )}
                  </div>

                  {/* Timeline */}
                  <VorgangTimeline beratungsstand={item.beratungsstand} />

                  {/* Meta: Datum, Stimmen, Kommentare */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {item.datum && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(item.datum).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {item.topic && (
                      <>
                        <span className="flex items-center gap-1">
                          <Vote className="size-3" />
                          {item.topic.voteCount} Stimmen
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="size-3" />
                          {item.topic.commentCount} Kommentare
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}

        {/* Mehr laden: Intersection Observer target + expliziter Button */}
        <div ref={loadMoreRef} />
        {hasNextPage && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? 'Wird geladen...' : 'Mehr laden'}
            </Button>
          </div>
        )}

        {/* Loading-Indicator beim Nachladen */}
        {isFetchingNextPage && (
          <div className="space-y-3">
            <VorgangSkeleton />
            <VorgangSkeleton />
          </div>
        )}
      </div>
    </div>
  );
}
