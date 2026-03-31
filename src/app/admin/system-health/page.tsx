'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseMs: number;
  message?: string;
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  region: string;
  services: ServiceStatus[];
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HealthData = await res.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    intervalRef.current = setInterval(fetchHealth, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchHealth]);

  const handleRefresh = () => {
    setLoading(true);
    fetchHealth();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">System Health</h1>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Letztes Update:{' '}
              {lastRefresh.toLocaleTimeString('de-DE', {
                timeZone: 'Europe/Berlin',
              })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn('mr-1 size-3', loading && 'animate-spin')} />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Overall Status Banner */}
      {loading && !health ? (
        <Skeleton className="h-16 w-full rounded-lg" />
      ) : error && !health ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardContent className="flex items-center gap-3 pt-4">
            <XCircle className="size-6 text-red-500" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400">
                Health Check fehlgeschlagen
              </p>
              <p className="text-sm text-red-600 dark:text-red-500">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : health ? (
        <Card
          className={cn(
            'border',
            health.status === 'healthy' &&
              'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
            health.status === 'degraded' &&
              'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
            health.status === 'down' &&
              'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
          )}
        >
          <CardContent className="flex items-center gap-3 pt-4">
            <OverallStatusIcon status={health.status} />
            <div>
              <p
                className={cn(
                  'font-medium',
                  health.status === 'healthy' &&
                    'text-emerald-700 dark:text-emerald-400',
                  health.status === 'degraded' &&
                    'text-amber-700 dark:text-amber-400',
                  health.status === 'down' && 'text-red-700 dark:text-red-400'
                )}
              >
                {health.status === 'healthy'
                  ? 'Alle Systeme betriebsbereit'
                  : health.status === 'degraded'
                    ? 'Einige Dienste eingeschränkt'
                    : 'Systemausfall erkannt'}
              </p>
              <p className="text-xs text-muted-foreground">
                Region: {health.region} &middot; Zeitstempel:{' '}
                {new Date(health.timestamp).toLocaleString('de-DE', {
                  timeZone: 'Europe/Berlin',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Service Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {loading && !health
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))
          : (health?.services ?? []).map((service) => (
              <Card key={service.name}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ServiceStatusIcon status={service.status} />
                        <h3 className="font-medium">{service.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            service.status === 'healthy'
                              ? 'secondary'
                              : service.status === 'degraded'
                                ? 'outline'
                                : 'destructive'
                          }
                          className={cn(
                            'text-xs',
                            service.status === 'healthy' &&
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          )}
                        >
                          {service.status === 'healthy'
                            ? 'Gesund'
                            : service.status === 'degraded'
                              ? 'Eingeschränkt'
                              : 'Ausgefallen'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Antwortzeit: {service.responseMs}ms
                      </p>
                      {service.message && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {service.message}
                        </p>
                      )}
                    </div>
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-lg',
                        service.status === 'healthy' && 'bg-emerald-100 dark:bg-emerald-900/30',
                        service.status === 'degraded' && 'bg-amber-100 dark:bg-amber-900/30',
                        service.status === 'down' && 'bg-red-100 dark:bg-red-900/30'
                      )}
                    >
                      <Activity
                        className={cn(
                          'size-5',
                          service.status === 'healthy' && 'text-emerald-600',
                          service.status === 'degraded' && 'text-amber-600',
                          service.status === 'down' && 'text-red-600'
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Response Time Summary */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle>Antwortzeiten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {health.services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium">{service.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          service.responseMs < 500
                            ? 'bg-emerald-500'
                            : service.responseMs < 2000
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        )}
                        style={{
                          width: `${Math.min((service.responseMs / 5000) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm tabular-nums text-muted-foreground">
                      {service.responseMs}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OverallStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="size-6 text-emerald-500" />;
    case 'degraded':
      return <AlertTriangle className="size-6 text-amber-500" />;
    case 'down':
      return <XCircle className="size-6 text-red-500" />;
    default:
      return <Activity className="size-6 text-muted-foreground" />;
  }
}

function ServiceStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="size-4 text-emerald-500" />;
    case 'degraded':
      return <AlertTriangle className="size-4 text-amber-500" />;
    case 'down':
      return <XCircle className="size-4 text-red-500" />;
    default:
      return <Activity className="size-4 text-muted-foreground" />;
  }
}
