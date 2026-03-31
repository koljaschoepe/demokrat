'use client';

import Link from 'next/link';
import {
  Users,
  Vote,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  User,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc/client';
import { FACTION_COLORS } from '@/lib/charts/theme';

interface TopicItem {
  id: string;
  title: string;
  voteCount: number;
  status: string;
}

interface WahlkreisDashboardProps {
  wahlkreisId: number;
  className?: string;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-16" />
      <Skeleton className="h-24" />
    </div>
  );
}

/**
 * Phase 158 — Wahlkreis Dashboard (Rewrite)
 *
 * Shows comprehensive stats when a wahlkreis is selected on the map.
 * Fetches real data via tRPC.
 */
export function WahlkreisDashboard({ wahlkreisId, className }: WahlkreisDashboardProps) {
  const { data, isLoading, error } = trpc.map.wahlkreisDashboard.useQuery(
    { wahlkreisId },
    { staleTime: 300_000 },
  );

  if (isLoading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className={cn('py-4 text-center text-sm text-muted-foreground', className)}>
        Dashboard konnte nicht geladen werden.
      </div>
    );
  }

  const stufe = data.stats.fortschrittStufe;
  const stufePercent = (stufe / 5) * 100;

  return (
    <div className={cn('space-y-5', className)}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {data.wahlkreisInfo?.name ?? `Wahlkreis ${wahlkreisId}`}
          </h2>
          <Badge variant="secondary">WK {wahlkreisId}</Badge>
        </div>
        {data.wahlkreisInfo?.bundesland && (
          <p className="text-sm text-muted-foreground">{data.wahlkreisInfo.bundesland}</p>
        )}
      </div>

      {/* Fortschritt-Stufe */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-indigo-500" />
            <span className="text-sm font-medium">Stufe {stufe} von 5</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {stufe === 5 ? 'Maximalstufe erreicht' : `Nächstes Ziel: Stufe ${stufe + 1}`}
          </span>
        </div>
        <Progress value={stufePercent} className="h-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Users}
          label="Aktive Bürger"
          value={data.stats.activeUsersWeek.toLocaleString('de-DE')}
          sublabel="diese Woche"
        />
        <StatCard
          icon={Vote}
          label="Abstimmungen"
          value={data.stats.votesWeek.toLocaleString('de-DE')}
          sublabel="diese Woche"
        />
        <StatCard
          icon={TrendingUp}
          label="Registrierte"
          value={data.stats.registeredUsers.toLocaleString('de-DE')}
          sublabel="gesamt"
        />
        <StatCard
          icon={MessageSquare}
          label="Bridging-Score"
          value={`${Math.round(data.stats.avgBridgingScore * 100)}%`}
          sublabel="Durchschnitt"
        />
      </div>

      <Separator />

      {/* MdB Section */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Abgeordnete/r</h3>
        {data.mdb ? (
          <Link
            href={`/mdb/${data.mdb.id}`}
            className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              {data.mdb.fotoUrl ? (
                <img
                  src={data.mdb.fotoUrl}
                  alt={data.mdb.name}
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <User className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{data.mdb.name}</p>
              <Badge
                variant="outline"
                className="mt-0.5 text-xs"
                style={{
                  borderColor: FACTION_COLORS[data.mdb.fraktion] ?? '#6b7280',
                  color: FACTION_COLORS[data.mdb.fraktion] ?? '#6b7280',
                }}
              >
                {data.mdb.fraktion}
              </Badge>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">
            Kein Abgeordneter für diesen Wahlkreis gefunden.
          </p>
        )}
      </div>

      <Separator />

      {/* Top Topics */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Top-Themen</h3>
        {data.topTopics.length > 0 ? (
          <div className="space-y-2">
            {(data.topTopics as TopicItem[]).map((topic: TopicItem, index: number) => (
              <Link
                key={topic.id}
                href={`/themen/${topic.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  {index + 1}
                </span>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">{topic.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic.voteCount.toLocaleString('de-DE')} Stimmen
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {topic.status === 'voting' ? 'Aktiv' : topic.status === 'closed' ? 'Beendet' : topic.status}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Noch keine Themen in diesem Wahlkreis.
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="mt-1 text-lg font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </CardContent>
    </Card>
  );
}
