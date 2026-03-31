'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc/client';

const SOURCE_LABELS: Record<string, string> = {
  dip: 'DIP API',
  abgeordnetenwatch: 'abgeordnetenwatch',
  meilisearch: 'Meilisearch',
  content: 'Content Pipeline',
};

const STATUS_MAP: Record<string, 'ok' | 'warning' | 'error'> = {
  success: 'ok',
  running: 'warning',
  partial: 'warning',
  failed: 'error',
};

type SourceFilter = 'all' | 'dip' | 'abgeordnetenwatch' | 'meilisearch' | 'content';

export default function SyncPage() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  const statusQuery = trpc.adminSync.status.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const historyQuery = trpc.adminSync.history.useQuery(
    { source: sourceFilter, limit: 50 },
    { refetchInterval: 30_000 }
  );

  const triggerSync = trpc.admin.triggerSync.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
      historyQuery.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sync-Monitoring</h1>

      {/* Sync Source Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {statusQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          (statusQuery.data ?? []).map((src) => {
            const displayStatus = src.lastRun
              ? STATUS_MAP[src.lastRun.status] ?? 'error'
              : 'error';

            return (
              <Card key={src.source}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusDot status={displayStatus} />
                        <h3 className="font-medium">
                          {SOURCE_LABELS[src.source] ?? src.source}
                        </h3>
                      </div>
                      {src.lastRun ? (
                        <>
                          <p className="text-xs text-muted-foreground">
                            Letzter Sync:{' '}
                            {new Date(src.lastRun.startedAt).toLocaleString('de-DE', {
                              timeZone: 'Europe/Berlin',
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {src.lastRun.recordsProcessed.toLocaleString('de-DE')} Datensätze
                          </p>
                          {src.lastRun.errorMessage && (
                            <p className="text-xs text-red-500">
                              {src.lastRun.errorMessage}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Noch kein Sync durchgeführt
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerSync.mutate({ source: src.source as any })}
                      disabled={triggerSync.isPending}
                    >
                      <RefreshCw
                        className={cn(
                          'mr-1 size-3',
                          triggerSync.isPending && 'animate-spin'
                        )}
                      />
                      Sync
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sync-Verlauf</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <div className="flex gap-1">
                {(['all', 'dip', 'abgeordnetenwatch', 'meilisearch', 'content'] as const).map(
                  (f) => (
                    <Button
                      key={f}
                      variant={sourceFilter === f ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setSourceFilter(f)}
                    >
                      {f === 'all' ? 'Alle' : SOURCE_LABELS[f] ?? f}
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {historyQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-4 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (historyQuery.data ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Noch keine Sync-Einträge vorhanden.
            </p>
          ) : (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(historyQuery.data ?? []).map((entry: any) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <SyncStatusIcon status={entry.status} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {SOURCE_LABELS[entry.source] ?? entry.source}
                      </span>
                      <Badge
                        variant={
                          entry.status === 'success'
                            ? 'secondary'
                            : entry.status === 'failed'
                              ? 'destructive'
                              : 'outline'
                        }
                        className="text-xs"
                      >
                        {entry.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(entry.startedAt).toLocaleString('de-DE', {
                          timeZone: 'Europe/Berlin',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.recordsProcessed.toLocaleString('de-DE')} Datensätze verarbeitet
                      {entry.finishedAt && (
                        <>
                          {' '}
                          &middot;{' '}
                          {Math.round(
                            (new Date(entry.finishedAt).getTime() -
                              new Date(entry.startedAt).getTime()) /
                              1000
                          )}
                          s Dauer
                        </>
                      )}
                    </p>
                    {entry.errorMessage && (
                      <p className="text-xs text-red-500">{entry.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusDot({ status }: { status: 'ok' | 'warning' | 'error' }) {
  return (
    <div
      className={cn(
        'size-2.5 rounded-full',
        status === 'ok' && 'bg-emerald-500',
        status === 'warning' && 'bg-amber-500',
        status === 'error' && 'bg-red-500'
      )}
    />
  );
}

function SyncStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />;
    case 'running':
    case 'partial':
      return <Clock className="mt-0.5 size-4 shrink-0 text-amber-500" />;
    case 'failed':
      return <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />;
    default:
      return <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />;
  }
}
