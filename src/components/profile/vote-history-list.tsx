'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Vote, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function VoteHistoryList() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allVotes, setAllVotes] = useState<Record<string, unknown>[]>([]);
  const prevDataRef = useRef<unknown>(null);

  const { data, isLoading, isFetching } = trpc.users.getVoteHistory.useQuery({
    limit: 20,
    cursor,
  });

  // Sync data to accumulated votes list when data changes
  useEffect(() => {
    if (data && data !== prevDataRef.current) {
      prevDataRef.current = data;
      if (cursor) {
        setAllVotes((prev) => [...prev, ...data.votes]);
      } else {
        setAllVotes(data.votes);
      }
    }
  }, [data, cursor]);

  const handleLoadMore = useCallback(() => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  }, [data?.nextCursor]);

  const votes = cursor ? allVotes : (data?.votes ?? []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Vote className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Du hast noch keine Stimmen abgegeben.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {votes.map((vote, index) => {
        const payload =
          typeof vote.payload === 'object' && vote.payload !== null
            ? (vote.payload as Record<string, unknown>)
            : {};
        const title =
          (payload.topic_title as string) ||
          (vote.stream_id as string) ||
          'Abstimmung';
        const choice = (payload.choice as string) || '---';
        const createdAt = vote.created_at as string;

        return (
          <Card key={`${vote.sequence_number ?? index}`} size="sm">
            <CardContent className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <Vote className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground">
                  {choice}
                  {createdAt && <> &middot; {formatDate(createdAt)}</>}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {data?.nextCursor && (
        <Button
          variant="outline"
          onClick={handleLoadMore}
          disabled={isFetching}
          className="mx-auto"
        >
          <ChevronDown className="size-4" data-icon="inline-start" />
          {isFetching ? 'Wird geladen...' : 'Mehr laden'}
        </Button>
      )}
    </div>
  );
}
