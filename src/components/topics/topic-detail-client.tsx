'use client';

import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth/use-auth';
import { trpc } from '@/lib/trpc/client';
import { TopicLifecycle } from '@/components/topics/topic-lifecycle';
import { CommentSection } from '@/components/comments/comment-section';
import { getCategoryLabel } from '@/lib/constants/categories';

interface TopicDetailClientProps {
  topicId: string;
}

function TopicDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="mb-6 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="mb-8 h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export function TopicDetailClient({ topicId }: TopicDetailClientProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: topic, isLoading, error } = trpc.topics.getById.useQuery(
    { id: topicId },
    { staleTime: 30_000 },
  );

  // Mutations
  const supportMutation = trpc.topics.support.useMutation({
    onSuccess: () => {
      utils.topics.getById.invalidate({ id: topicId });
    },
  });

  const unsupportMutation = trpc.topics.unsupport.useMutation({
    onSuccess: () => {
      utils.topics.getById.invalidate({ id: topicId });
    },
  });

  const publishMutation = trpc.topics.publish.useMutation({
    onSuccess: () => {
      utils.topics.getById.invalidate({ id: topicId });
    },
  });

  if (isLoading) return <TopicDetailSkeleton />;

  if (error || !topic) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-sm text-destructive">
          {error?.message ?? 'Thema nicht gefunden.'}
        </p>
        <Link href="/feed" className="mt-4 inline-block text-sm text-muted-foreground hover:text-foreground">
          Zurück zum Feed
        </Link>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = topic as any;

  const status = (t.status ?? 'active') as string;
  const source = (t.source ?? 'BUNDESTAG') as string;
  const category = (t.category ?? '') as string;
  const title = (t.title ?? '') as string;
  const description = (t.description ?? '') as string;
  const supporterCount = (t.supporter_count ?? 0) as number;
  const voteCount = (t.vote_count ?? 0) as number;
  const closesAt = (t.closes_at ?? null) as string | null;
  const activatedAt = (t.activated_at ?? null) as string | null;
  const createdBy = (t.created_by ?? '') as string;
  const votingFormat = (t.voting_format ?? 'yes_no_abstain') as string;

  const isCreator = user?.id === createdBy;
  const sourceLabel = source === 'BUNDESTAG' ? 'BUNDESTAG' : 'BUERGER';
  const categoryLabel = getCategoryLabel(category) ?? category;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      {/* Back link */}
      <Link
        href="/feed"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Zurück zum Feed
      </Link>

      {/* Topic header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={source === 'BUNDESTAG' ? 'secondary' : 'default'}>
            {sourceLabel}
          </Badge>
          <Badge variant="outline">{categoryLabel}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Topic lifecycle */}
      <TopicLifecycle
        topicId={topicId}
        status={status as 'draft' | 'pending' | 'active' | 'voting' | 'closed' | 'archived'}
        supporterCount={supporterCount}
        isCreator={isCreator}
        closesAt={closesAt}
        activatedAt={activatedAt}
        onSupport={() => supportMutation.mutate({ topicId })}
        onUnsupport={() => unsupportMutation.mutate({ topicId })}
        onPublish={() => publishMutation.mutate({ topicId })}
        className="mb-8"
      />

      {/* Voting section */}
      {(status === 'voting' || status === 'active') && (
        <div className="mb-8 rounded-lg border border-indigo-200 bg-indigo-50/50 p-6 text-center dark:border-indigo-800 dark:bg-indigo-950/30">
          <BarChart3 className="mx-auto mb-2 size-8 text-indigo-500" />
          <p className="text-sm font-medium text-foreground">Abstimmungsbereich</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {voteCount} Stimmen bisher abgegeben
          </p>
        </div>
      )}

      {/* Results link */}
      {status === 'closed' && (
        <div className="mb-8">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            render={<Link href={`/themen/${topicId}/ergebnis`} />}
          >
            <BarChart3 className="size-4" />
            Ergebnis ansehen
          </Button>
        </div>
      )}

      {/* Comment section */}
      <CommentSection topicId={topicId} />
    </div>
  );
}
