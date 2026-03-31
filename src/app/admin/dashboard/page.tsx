'use client';

import { useState } from 'react';
import {
  Users,
  Vote,
  MessageSquare,
  Activity,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { StatsCard } from '@/components/admin/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Phase 166 -- Admin Dashboard with real data.
 *
 * Fetches stats, recent activity, and exposes quick actions via tRPC.
 */
export default function AdminDashboardPage() {
  const [syncSource, setSyncSource] = useState<string | null>(null);

  const stats = trpc.admin.stats.useQuery(undefined, {
    refetchInterval: 60_000, // refresh every minute
  });

  const activity = trpc.admin.recentActivity.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const triggerSync = trpc.admin.triggerSync.useMutation({
    onSuccess: () => {
      setSyncSource(null);
      stats.refetch();
      activity.refetch();
    },
    onError: () => {
      setSyncSource(null);
    },
  });

  const clearCache = trpc.admin.clearCache.useMutation({
    onSuccess: () => {
      stats.refetch();
    },
  });

  const handleSync = (source: 'dip' | 'abgeordnetenwatch' | 'meilisearch' | 'content') => {
    setSyncSource(source);
    triggerSync.mutate({ source });
  };

  const handleClearCache = () => {
    clearCache.mutate();
  };

  // Format number with German locale
  const fmt = (n: number) => n.toLocaleString('de-DE');

  // Format change percentage as display string
  const fmtChange = (pct: number, label: string) => {
    if (pct === 0) return `+/- 0% ${label}`;
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct}% ${label}`;
  };

  const changeType = (pct: number) => {
    if (pct > 0) return 'positive' as const;
    if (pct < 0) return 'negative' as const;
    return 'neutral' as const;
  };

  // Format relative time for activity entries
  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return 'gerade eben';
    if (minutes < 60) return `vor ${minutes} Min.`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    const days = Math.floor(hours / 24);
    return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
  };

  // Map audit_log action to readable German text
  const formatAction = (action: string, resourceType: string, resourceId: string | null) => {
    const actionMap: Record<string, string> = {
      sync_triggered: 'Sync gestartet',
      cache_cleared: 'Cache geleert',
      user_registered: 'Nutzer registriert',
      vote_cast: 'Abstimmung abgegeben',
      topic_created: 'Thema erstellt',
      report_created: 'Meldung eingegangen',
      report_resolved: 'Meldung bearbeitet',
      comment_created: 'Kommentar erstellt',
      content_moderated: 'Inhalt moderiert',
    };

    const label = actionMap[action] ?? action;
    if (resourceId) {
      return `${label}: ${resourceType} #${resourceId.slice(0, 8)}`;
    }
    return label;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats Grid */}
      {stats.isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Lade Statistiken...
          </span>
        </div>
      ) : stats.error ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 pt-4">
            <AlertTriangle className="size-5 text-destructive" />
            <p className="text-sm text-destructive">
              Statistiken konnten nicht geladen werden.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => stats.refetch()}
            >
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      ) : stats.data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Nutzer"
            value={fmt(stats.data.totalUsers)}
            change={fmtChange(stats.data.usersChange, 'diese Woche')}
            changeType={changeType(stats.data.usersChange)}
            icon={Users}
          />
          <StatsCard
            title="Abstimmungen"
            value={fmt(stats.data.totalVotes)}
            change={fmtChange(stats.data.votesChange, 'diese Woche')}
            changeType={changeType(stats.data.votesChange)}
            icon={Vote}
          />
          <StatsCard
            title="Themen"
            value={fmt(stats.data.totalTopics)}
            icon={MessageSquare}
          />
          <StatsCard
            title="Aktive heute"
            value={fmt(stats.data.activeToday)}
            change={
              stats.data.openReports > 0
                ? `${stats.data.openReports} offene Meldungen`
                : undefined
            }
            changeType={stats.data.openReports > 0 ? 'negative' : 'neutral'}
            icon={Activity}
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Letzte Aktivität</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : activity.error ? (
              <p className="text-sm text-destructive">
                Aktivität konnte nicht geladen werden.
              </p>
            ) : activity.data && activity.data.length > 0 ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {activity.data.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-sm">
                      {formatAction(
                        item.action,
                        item.resourceType,
                        item.resourceId,
                      )}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Keine Aktivität vorhanden.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleSync('dip')}
              disabled={triggerSync.isPending}
            >
              <RefreshCw
                className={cn(
                  'size-4',
                  syncSource === 'dip' && triggerSync.isPending && 'animate-spin',
                )}
              />
              {syncSource === 'dip' && triggerSync.isPending
                ? 'Synchronisiert DIP...'
                : 'DIP Sync starten'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleSync('abgeordnetenwatch')}
              disabled={triggerSync.isPending}
            >
              <RefreshCw
                className={cn(
                  'size-4',
                  syncSource === 'abgeordnetenwatch' &&
                    triggerSync.isPending &&
                    'animate-spin',
                )}
              />
              {syncSource === 'abgeordnetenwatch' && triggerSync.isPending
                ? 'Synchronisiert AW...'
                : 'Abgeordnetenwatch Sync'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => handleSync('meilisearch')}
              disabled={triggerSync.isPending}
            >
              <RefreshCw
                className={cn(
                  'size-4',
                  syncSource === 'meilisearch' &&
                    triggerSync.isPending &&
                    'animate-spin',
                )}
              />
              {syncSource === 'meilisearch' && triggerSync.isPending
                ? 'Reindexiert...'
                : 'Suchindex neu aufbauen'}
            </Button>

            <div className="my-2 border-t" />

            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
              onClick={handleClearCache}
              disabled={clearCache.isPending}
            >
              <Trash2 className="size-4" />
              {clearCache.isPending ? 'Wird geleert...' : 'Cache leeren'}
            </Button>

            {(triggerSync.isSuccess || clearCache.isSuccess) && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Aktion erfolgreich ausgeführt.
              </p>
            )}
            {(triggerSync.error || clearCache.error) && (
              <p className="text-xs text-destructive">
                {triggerSync.error?.message ??
                  clearCache.error?.message ??
                  'Aktion fehlgeschlagen.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
