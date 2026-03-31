'use client';

import Link from 'next/link';
import {
  Bookmark,
  BookmarkX,
  ArrowLeft,
  BarChart3,
  MessageCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';

function formatNumber(n: number): string {
  return n.toLocaleString('de-DE');
}

function formatSavedDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface BookmarkCardProps {
  id: string;
  title: string;
  source: string;
  category: string;
  voteCount: number;
  commentCount: number;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}

function BookmarkedTopicCard({
  id,
  title,
  source,
  category,
  voteCount,
  commentCount,
  onRemove,
  isRemoving,
}: BookmarkCardProps) {
  const sourceLabel = source === 'BUNDESTAG' ? 'BUNDESTAG' : 'BUERGER';

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={source === 'BUNDESTAG' ? 'secondary' : 'default'}
            >
              {sourceLabel}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onRemove(id)}
            disabled={isRemoving}
            aria-label={`${title} aus Lesezeichen entfernen`}
            className="text-muted-foreground hover:text-destructive"
          >
            <BookmarkX className="size-4" />
          </Button>
        </div>

        <Link href={`/themen/${id}`} className="group">
          <h3 className="line-clamp-2 text-base font-semibold text-foreground group-hover:text-indigo-600">
            {title}
          </h3>
        </Link>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span
            className="flex items-center gap-1 font-mono"
            aria-label={`${formatNumber(voteCount)} Stimmen`}
          >
            <BarChart3 className="size-3.5" />
            {formatNumber(voteCount)}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <MessageCircle className="size-3.5" />
            {formatNumber(commentCount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GespeichertPage() {
  const utils = trpc.useUtils();

  const { data, isLoading, error } = trpc.feed.bookmarks.useQuery({});

  const removeBookmark = trpc.feed.removeBookmark.useMutation({
    onSuccess: () => {
      utils.feed.bookmarks.invalidate();
    },
  });

  const handleRemove = (topicId: string) => {
    removeBookmark.mutate({ topicId });
  };

  const bookmarks = data?.topics ?? [];
  const isEmpty = !isLoading && bookmarks.length === 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/feed"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Zurück zum Feed"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Bookmark className="size-5 text-indigo-600" />
          <h1 className="text-xl font-bold">Gespeicherte Themen</h1>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col gap-3">
                <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm text-destructive">
            Fehler beim Laden der Lesezeichen. Bitte versuche es erneut.
          </p>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Bookmark className="size-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              Du hast noch keine Themen gespeichert.
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Speichere Themen aus dem Feed, um sie später wiederzufinden.
            </p>
          </div>
          <Link href="/feed">
            <Button variant="default">Zum Feed</Button>
          </Link>
        </div>
      )}

      {/* Bookmark list */}
      {!isLoading && bookmarks.length > 0 && (
        <div className="space-y-4">
          {bookmarks.map((topic) => (
            <BookmarkedTopicCard
              key={topic.id}
              id={topic.id}
              title={topic.title}
              source={topic.source}
              category={topic.category}
              voteCount={topic.vote_count}
              commentCount={topic.comment_count}
              onRemove={handleRemove}
              isRemoving={removeBookmark.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
