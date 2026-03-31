'use client';

import { useState, useCallback } from 'react';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc/client';

const ACTION_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  user_suspended: { label: 'Nutzer gesperrt', variant: 'destructive' },
  user_banned: { label: 'Nutzer gebannt', variant: 'destructive' },
  user_warned: { label: 'Verwarnung', variant: 'secondary' },
  content_removed: { label: 'Inhalt entfernt', variant: 'destructive' },
  feature_flag_changed: { label: 'Feature Flag', variant: 'outline' },
  sync_triggered: { label: 'Sync', variant: 'outline' },
  report_resolved: { label: 'Meldung bearbeitet', variant: 'secondary' },
  moderation_resolve: { label: 'Moderation', variant: 'secondary' },
  tier_changed: { label: 'Stufe geändert', variant: 'secondary' },
  topic_closed: { label: 'Thema geschlossen', variant: 'outline' },
  cache_cleared: { label: 'Cache geleert', variant: 'outline' },
};

const ALL_ACTIONS = [
  'all',
  'user_suspended',
  'user_banned',
  'user_warned',
  'content_removed',
  'feature_flag_changed',
  'sync_triggered',
  'report_resolved',
  'moderation_resolve',
  'tier_changed',
  'topic_closed',
  'cache_cleared',
] as const;

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exportEnabled, setExportEnabled] = useState(false);

  const listQuery = trpc.adminAudit.list.useQuery(
    {
      page,
      pageSize: 20,
      action: actionFilter !== 'all' ? actionFilter : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      search: searchTerm || undefined,
    },
    { placeholderData: (prev) => prev }
  );

  const exportQuery = trpc.adminAudit.export.useQuery(
    {
      dateFrom: dateFrom || '2020-01-01',
      dateTo: dateTo || new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' }),
    },
    { enabled: exportEnabled }
  );

  const handleExport = useCallback(() => {
    setExportEnabled(true);
  }, []);

  // Trigger CSV download when export data is available
  if (exportEnabled && exportQuery.data && !exportQuery.isLoading) {
    const rows = exportQuery.data;
    const csvHeader = 'Zeitpunkt;Admin;Aktion;Ressource-Typ;Ressource-ID;Details';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csvRows = rows.map((r: any) =>
      [
        r.createdAt,
        r.actorName,
        r.action,
        r.resourceType ?? '',
        r.resourceId ?? '',
        r.details.replace(/"/g, '""'),
      ]
        .map((v) => `"${v}"`)
        .join(';')
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${dateFrom || 'all'}-${dateTo || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportEnabled(false);
  }

  const data = listQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit-Log</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exportQuery.isLoading}
        >
          <Download className="mr-1 size-3" />
          CSV Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Von:</label>
          <Input
            type="date"
            className="w-auto"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Bis:</label>
          <Input
            type="date"
            className="w-auto"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">Aktion:</label>
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            {ALL_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a === 'all'
                  ? 'Alle'
                  : ACTION_LABELS[a]?.label ?? a}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Admin suchen..."
            className="w-48 pl-8"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Zeitpunkt</th>
                  <th className="px-4 py-3 text-left font-medium">Admin</th>
                  <th className="px-4 py-3 text-left font-medium">Aktion</th>
                  <th className="px-4 py-3 text-left font-medium">Ressource</th>
                  <th className="px-4 py-3 text-left font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {listQuery.isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-28" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-40" />
                      </td>
                    </tr>
                  ))
                ) : (data?.entries ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      Keine Audit-Log-Einträge gefunden.
                    </td>
                  </tr>
                ) : (
                  ((data?.entries ?? []) as Array<{ id: string; actorName: string; action: string; resourceType: string | null; resourceId: string | null; payload: unknown; createdAt: string }>).map((entry) => {
                    const actionConfig = ACTION_LABELS[entry.action] ?? {
                      label: entry.action,
                      variant: 'outline' as const,
                    };

                    return (
                      <tr key={entry.id} className="border-b last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString('de-DE', {
                            timeZone: 'Europe/Berlin',
                          })}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {entry.actorName}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={actionConfig.variant} className="text-xs">
                            {actionConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {entry.resourceType ?? '--'}
                          {entry.resourceId && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              {entry.resourceId.slice(0, 8)}...
                            </span>
                          )}
                        </td>
                        <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                          {entry.payload
                            ? typeof entry.payload === 'string'
                              ? entry.payload
                              : JSON.stringify(entry.payload)
                            : '--'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Seite {data.page} von {data.totalPages} ({data.total} Einträge)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-1 size-3" />
              Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Weiter
              <ChevronRight className="ml-1 size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
