'use client';

import {
  Users,
  Vote,
  TrendingUp,
  Activity,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatsCard } from '@/components/admin/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc/client';

export default function AnalyticsPage() {
  const overview = trpc.adminAnalytics.overview.useQuery();
  const regTrend = trpc.adminAnalytics.registrationTrend.useQuery();
  const voteTrend = trpc.adminAnalytics.voteTrend.useQuery();
  const topTopics = trpc.adminAnalytics.topTopics.useQuery();
  const topWahlkreise = trpc.adminAnalytics.topWahlkreise.useQuery();

  const o = overview.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {overview.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="mb-2 h-3 w-20" />
                <Skeleton className="h-7 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              title="Nutzer gesamt"
              value={o?.totalUsers?.toLocaleString('de-DE') ?? '0'}
              icon={Users}
            />
            <StatsCard
              title="WAU (7 Tage)"
              value={o?.wau?.toLocaleString('de-DE') ?? '0'}
              icon={Activity}
            />
            <StatsCard
              title="DAU (heute)"
              value={o?.dau?.toLocaleString('de-DE') ?? '0'}
              icon={TrendingUp}
            />
            <StatsCard
              title="Abstimmungen gesamt"
              value={o?.totalVotes?.toLocaleString('de-DE') ?? '0'}
              icon={Vote}
            />
            <StatsCard
              title="Stimmen (Woche)"
              value={o?.votesThisWeek?.toLocaleString('de-DE') ?? '0'}
              icon={BarChart3}
            />
            <StatsCard
              title="Bridging-Score"
              value={
                o?.avgBridgingScore != null
                  ? o.avgBridgingScore.toFixed(2)
                  : '0.00'
              }
              icon={ArrowUpRight}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Registration Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Registrierungen (30 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            {regTrend.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={regTrend.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return `${d.getDate()}.${d.getMonth() + 1}.`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) =>
                      new Date(String(v)).toLocaleDateString('de-DE', {
                        timeZone: 'Europe/Berlin',
                      })
                    }
                    formatter={(value) => [String(value), 'Registrierungen']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.15)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Vote Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Abstimmungen (30 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            {voteTrend.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={voteTrend.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v: string) => {
                      const d = new Date(v);
                      return `${d.getDate()}.${d.getMonth() + 1}.`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(v) =>
                      new Date(String(v)).toLocaleDateString('de-DE', {
                        timeZone: 'Europe/Berlin',
                      })
                    }
                    formatter={(value) => [String(value), 'Stimmen']}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Top-Themen (nach Stimmen)</CardTitle>
          </CardHeader>
          <CardContent>
            {topTopics.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-6 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (topTopics.data ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Keine Themen vorhanden.
              </p>
            ) : (
              <div className="space-y-3">
                {(topTopics.data ?? []).map((topic: { id: string; title: string; category: string; voteCount: number }, index: number) => (
                  <div
                    key={topic.id}
                    className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{topic.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.voteCount.toLocaleString('de-DE')} Stimmen
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {topic.category}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Wahlkreise */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivste Wahlkreise</CardTitle>
          </CardHeader>
          <CardContent>
            {topWahlkreise.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-6 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (topWahlkreise.data ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Keine Wahlkreis-Daten vorhanden.
              </p>
            ) : (
              <div className="space-y-3">
                {(topWahlkreise.data ?? []).map((wk: { wahlkreisId: number; name: string; registeredUsers: number; activeUsersWeek: number; votesWeek: number; avgBridgingScore: number }, index: number) => (
                  <div
                    key={wk.wahlkreisId}
                    className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{wk.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {wk.activeUsersWeek} aktive Nutzer &middot;{' '}
                        {wk.votesWeek} Stimmen
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {wk.registeredUsers} Nutzer
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
