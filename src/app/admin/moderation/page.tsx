'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  hate_speech: 'Hassrede',
  misinformation: 'Falschinformation',
  harassment: 'Belästigung',
  off_topic: 'Themenfern',
  other: 'Sonstiges',
};

const REASON_OPTIONS = [
  { value: 'all', label: 'Alle Gründe' },
  { value: 'spam', label: 'Spam' },
  { value: 'hate_speech', label: 'Hassrede' },
  { value: 'misinformation', label: 'Falschinformation' },
  { value: 'harassment', label: 'Belästigung' },
  { value: 'off_topic', label: 'Themenfern' },
  { value: 'other', label: 'Sonstiges' },
];

const CONTENT_TYPE_OPTIONS = [
  { value: 'all', label: 'Alle Typen' },
  { value: 'comment', label: 'Kommentar' },
  { value: 'topic', label: 'Thema' },
];

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<'reports' | 'topics'>('reports');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Moderations-Queue</h1>
      </div>

      {/* Stats bar */}
      <StatsBar />

      {/* Tab buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'reports'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          Gemeldete Inhalte
        </button>
        <button
          onClick={() => setActiveTab('topics')}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'topics'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          Markierte Themen
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'reports' ? <ReportsTab /> : <TopicsTab />}
    </div>
  );
}

function StatsBar() {
  const statsQuery = trpc.moderation.stats.useQuery(undefined, { retry: 1 });

  if (statsQuery.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const stats = statsQuery.data;

  const items = [
    { label: 'Ausstehend', value: stats?.pendingReports ?? 0, color: 'text-amber-600' },
    { label: 'Bestätigt heute', value: stats?.confirmedToday ?? 0, color: 'text-red-600' },
    { label: 'Abgewiesen heute', value: stats?.dismissedToday ?? 0, color: 'text-green-600' },
    { label: 'Markierte Kommentare', value: stats?.flaggedComments ?? 0, color: 'text-muted-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(({ label, value, color }) => (
        <Card key={label}>
          <CardContent className="flex flex-col items-center gap-1 py-3">
            <span className={cn('text-2xl font-bold tabular-nums', color)}>{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReportsTab() {
  const [resolveNote, setResolveNote] = useState<Record<string, string>>({});
  const [reasonFilter, setReasonFilter] = useState('all');
  const [contentTypeFilter, setContentTypeFilter] = useState('all');
  const [pendingReportId, setPendingReportId] = useState<string | null>(null);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const reportsQuery = trpc.moderation.pendingReports.useInfiniteQuery(
    {
      limit: 20,
      ...(contentTypeFilter !== 'all'
        ? { type: contentTypeFilter as 'comment' | 'topic' }
        : {}),
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );

  const resolveMutation = trpc.moderation.resolveReport.useMutation({
    onMutate: ({ reportId }) => {
      setPendingReportId(reportId);
    },
    onSuccess: (_data, variables) => {
      utils.moderation.pendingReports.invalidate();
      utils.moderation.stats.invalidate();
      setPendingReportId(null);

      const actionLabels: Record<string, string> = {
        confirm: 'bestätigt',
        dismiss: 'abgewiesen',
        escalate: 'eskaliert',
      };

      const label = actionLabels[variables.action] ?? variables.action;

      if (variables.action === 'confirm') {
        toast({
          title: `Meldung ${label}`,
          description: 'Der Melder erhält +5 Reputationspunkte.',
          variant: 'success',
        });
      } else {
        toast({
          title: `Meldung ${label}`,
          variant: 'success',
        });
      }
    },
    onError: () => {
      setPendingReportId(null);
      toast({
        title: 'Fehler',
        description: 'Die Meldung konnte nicht bearbeitet werden.',
        variant: 'destructive',
      });
    },
  });

  // Client-side reason filter (since the backend doesn't have a reason filter)
  const allReports = reportsQuery.data?.pages.flatMap((p) => p.items) ?? [];
  const filteredReports =
    reasonFilter === 'all'
      ? allReports
      : allReports.filter((r) => r.reason === reasonFilter);

  if (reportsQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" />
          Filter:
        </div>
        <Select value={reasonFilter} onValueChange={(v) => v && setReasonFilter(v)}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REASON_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={contentTypeFilter} onValueChange={(v) => v && setContentTypeFilter(v)}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONTENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="size-8 text-green-500" />
            <p className="text-sm text-muted-foreground">Keine ausstehenden Meldungen</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isThisPending = pendingReportId === report.id;
            return (
              <Card key={report.id}>
                <CardContent className="flex flex-col gap-3 pt-4">
                  {/* Report meta */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Flag className="size-4 text-amber-500" />
                    <span className="text-sm font-medium">{report.reporterName}</span>
                    <Badge variant="outline" className="text-xs">
                      {REASON_LABELS[report.reason] ?? report.reason}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {report.contentType === 'comment' ? 'Kommentar' : 'Thema'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString('de-DE')}
                    </span>
                  </div>

                  {/* Reported content */}
                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {report.contentType === 'comment' ? 'Kommentar' : 'Thema'} von{' '}
                      <span className="font-medium">{report.contentAuthor}</span>
                    </p>
                    <p className="mt-1 text-sm">{report.contentPreview}</p>
                  </div>

                  {report.details && (
                    <p className="text-xs text-muted-foreground">Details: {report.details}</p>
                  )}

                  {/* Note input */}
                  <input
                    type="text"
                    placeholder="Notiz (optional)"
                    value={resolveNote[report.id] ?? ''}
                    onChange={(e) =>
                      setResolveNote((prev) => ({ ...prev, [report.id]: e.target.value }))
                    }
                    className="rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                  />

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        resolveMutation.mutate({
                          reportId: report.id,
                          action: 'confirm',
                          note: resolveNote[report.id] || undefined,
                        })
                      }
                      disabled={isThisPending}
                    >
                      {isThisPending && resolveMutation.variables?.action === 'confirm' ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      Bestätigen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        resolveMutation.mutate({
                          reportId: report.id,
                          action: 'dismiss',
                          note: resolveNote[report.id] || undefined,
                        })
                      }
                      disabled={isThisPending}
                    >
                      {isThisPending && resolveMutation.variables?.action === 'dismiss' ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      Abweisen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        resolveMutation.mutate({
                          reportId: report.id,
                          action: 'escalate',
                          note: resolveNote[report.id] || undefined,
                        })
                      }
                      disabled={isThisPending}
                    >
                      {isThisPending && resolveMutation.variables?.action === 'escalate' ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <AlertTriangle className="size-3.5" />
                      )}
                      Eskalieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {reportsQuery.hasNextPage && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => reportsQuery.fetchNextPage()}
              disabled={reportsQuery.isFetchingNextPage}
            >
              {reportsQuery.isFetchingNextPage ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Mehr laden'
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function TopicsTab() {
  const topicsQuery = trpc.moderation.pendingTopics.useQuery({ limit: 20 });

  if (topicsQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  const topics = topicsQuery.data?.items ?? [];

  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <CheckCircle2 className="size-8 text-green-500" />
          <p className="text-sm text-muted-foreground">Keine markierten Themen</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {topics.map((topic) => (
        <Card key={topic.id}>
          <CardContent className="flex items-center justify-between gap-4 pt-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{topic.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {topic.status}
                </Badge>
                <span className="text-xs text-muted-foreground">{topic.authorName}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(topic.createdAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
