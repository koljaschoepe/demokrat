'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { useAuth } from '@/lib/auth/use-auth';
import { CommentCard } from './comment-card';
import { CommentForm } from './comment-form';
import { ReportDialog } from './report-dialog';

interface CommentSectionProps {
  topicId: string;
  className?: string;
}

type SortOption = 'bridging' | 'newest' | 'oldest' | 'most_votes';
type FilterOption = 'all' | 'pro' | 'contra' | 'neutral';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'bridging', label: 'Bridging-Score' },
  { value: 'newest', label: 'Neueste' },
  { value: 'oldest', label: 'Älteste' },
  { value: 'most_votes', label: 'Meiste Stimmen' },
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'Alle' },
  { value: 'pro', label: 'Dafür' },
  { value: 'contra', label: 'Dagegen' },
  { value: 'neutral', label: 'Neutral' },
];

export function CommentSection({ topicId, className }: CommentSectionProps) {
  const { user } = useAuth();
  const [sort, setSort] = useState<SortOption>('bridging');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [editingComment, setEditingComment] = useState<{
    commentId: string;
    content: string;
    position: 'pro' | 'contra' | 'neutral';
  } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  // Main comments query
  const commentsQuery = trpc.comments.list.useInfiniteQuery(
    { topicId, sort, filter, parentId: null, limit: 20 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  // Mutations
  const createMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ topicId });
      setReplyTo(null);
    },
  });

  const updateMutation = trpc.comments.update.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ topicId });
      setEditingComment(null);
    },
  });

  const rateMutation = trpc.comments.rate.useMutation({
    onSuccess: () => {
      utils.comments.list.invalidate({ topicId });
    },
  });

  const handleCreate = useCallback(
    (data: { content: string; position: string; sources: string[] }) => {
      createMutation.mutate({
        topicId,
        content: data.content,
        position: data.position as 'pro' | 'contra' | 'neutral',
        sources: data.sources,
        parentId: replyTo?.id ?? undefined,
      });
    },
    [createMutation, topicId, replyTo],
  );

  const handleUpdate = useCallback(
    (data: { content: string }) => {
      if (!editingComment) return;
      updateMutation.mutate({ id: editingComment.commentId, content: data.content });
    },
    [updateMutation, editingComment],
  );

  const handleRate = useCallback(
    (commentId: string, rating: 'up' | 'down') => {
      rateMutation.mutate({ commentId, rating });
    },
    [rateMutation],
  );

  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }, []);

  const allComments = commentsQuery.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Diskussion</h2>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Kommentare filtern">
        {FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              filter === value
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <label htmlFor="comment-sort" className="text-xs text-muted-foreground">
          Sortierung:
        </label>
        <select
          id="comment-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Comment form */}
      {user ? (
        editingComment ? (
          <CommentForm
            topicId={topicId}
            editMode={{
              commentId: editingComment.commentId,
              initialContent: editingComment.content,
              initialPosition: editingComment.position,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingComment(null)}
          />
        ) : !replyTo ? (
          <CommentForm topicId={topicId} onSubmit={handleCreate} />
        ) : null
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/50 p-4 text-center text-sm text-muted-foreground">
          <a href="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Anmelden
          </a>{' '}
          um zu kommentieren
        </div>
      )}

      {/* Loading state */}
      {commentsQuery.isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!commentsQuery.isLoading && allComments.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Noch keine Kommentare. Starte die Diskussion!
        </div>
      )}

      {/* Comment list */}
      <div className="flex flex-col gap-3">
        {allComments.map((comment) => (
          <div key={comment.id}>
            <CommentCard
              {...comment}
              isOwnComment={user?.id === comment.author.id}
              onRate={handleRate}
              onReply={(id) =>
                setReplyTo({ id, author: comment.author.displayName })
              }
              onReport={(id) => setReportCommentId(id)}
              onEdit={(id) =>
                setEditingComment({
                  commentId: id,
                  content: comment.content,
                  position: comment.position,
                })
              }
            />

            {/* Reply form */}
            {replyTo?.id === comment.id && user && (
              <div className="mt-2 pl-6 md:pl-10">
                <CommentForm
                  topicId={topicId}
                  parentId={comment.id}
                  replyToAuthor={comment.author.displayName}
                  onSubmit={handleCreate}
                  onCancel={() => setReplyTo(null)}
                />
              </div>
            )}

            {/* Reply toggle + list */}
            {comment.replyCount > 0 && (
              <div className="mt-2 pl-6 md:pl-10">
                {!expandedReplies.has(comment.id) ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(comment.id)}
                    className="text-xs text-muted-foreground"
                  >
                    <ChevronDown className="size-3.5" />
                    {comment.replyCount} {comment.replyCount === 1 ? 'Antwort' : 'Antworten'} anzeigen
                  </Button>
                ) : (
                  <ReplyList
                    topicId={topicId}
                    parentId={comment.id}
                    userId={user?.id}
                    onRate={handleRate}
                    onReport={(id) => setReportCommentId(id)}
                    onCollapse={() => toggleReplies(comment.id)}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load more */}
      {commentsQuery.hasNextPage && (
        <Button
          variant="outline"
          onClick={() => commentsQuery.fetchNextPage()}
          disabled={commentsQuery.isFetchingNextPage}
          className="mx-auto"
        >
          {commentsQuery.isFetchingNextPage ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Laden...
            </>
          ) : (
            'Mehr laden'
          )}
        </Button>
      )}

      {/* Report dialog */}
      <ReportDialog
        commentId={reportCommentId ?? ''}
        open={reportCommentId !== null}
        onOpenChange={(open) => {
          if (!open) setReportCommentId(null);
        }}
      />
    </div>
  );
}

// Nested reply list component
function ReplyList({
  topicId,
  parentId,
  userId,
  onRate,
  onReport,
  onCollapse,
}: {
  topicId: string;
  parentId: string;
  userId?: string;
  onRate: (commentId: string, rating: 'up' | 'down') => void;
  onReport: (commentId: string) => void;
  onCollapse: () => void;
}) {
  const repliesQuery = trpc.comments.list.useQuery({
    topicId,
    parentId,
    sort: 'oldest',
    filter: 'all',
    limit: 50,
  });

  if (repliesQuery.isLoading) {
    return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
  }

  const replies = repliesQuery.data?.items ?? [];

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onCollapse}
        className="w-fit text-xs text-muted-foreground"
      >
        Antworten ausblenden
      </Button>
      {replies.map((reply) => (
        <CommentCard
          key={reply.id}
          {...reply}
          isOwnComment={userId === reply.author.id}
          onRate={onRate}
          onReport={onReport}
        />
      ))}
    </div>
  );
}
