'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Eye,
  Ban,
  Shield,
  Loader2,
  Users,
  AlertTriangle,
  MessageSquare,
  Vote,
  Calendar,
  Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TIER_NAMES: Record<number, string> = {
  0: 'Beobachter',
  1: 'Teilnehmer',
  2: 'Mitwirkender',
  3: 'Moderator',
  4: 'Vertrauensperson',
};

const TIER_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  1: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  2: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  3: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  4: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  hate_speech: 'Hassrede',
  misinformation: 'Falschinformation',
  harassment: 'Belästigung',
  off_topic: 'Themenfern',
  other: 'Sonstiges',
};

export default function UsersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [tierDialogUser, setTierDialogUser] = useState<{ id: string; name: string; currentTier: number } | null>(null);
  const [suspendDialogUser, setSuspendDialogUser] = useState<{ id: string; name: string } | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchInput]);

  const listQuery = trpc.adminUsers.list.useQuery(
    {
      search: debouncedSearch || undefined,
      tier: tierFilter !== 'all' ? Number(tierFilter) : undefined,
      limit: 25,
    },
    {},
  );

  const users = listQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Nutzerverwaltung</h1>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nutzer suchen..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select value={tierFilter} onValueChange={(v) => v && setTierFilter(v)}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Stufen</SelectItem>
            <SelectItem value="0">Beobachter</SelectItem>
            <SelectItem value="1">Teilnehmer</SelectItem>
            <SelectItem value="2">Mitwirkender</SelectItem>
            <SelectItem value="3">Moderator</SelectItem>
            <SelectItem value="4">Vertrauensperson</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      {listQuery.isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Stufe</th>
                    <th className="px-4 py-3 text-left font-medium">Reputation</th>
                    <th className="px-4 py-3 text-left font-medium">Beigetreten</th>
                    <th className="px-4 py-3 text-left font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="size-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {(user.displayName ?? '?')[0].toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium">{user.displayName ?? 'Unbekannt'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', TIER_COLORS[user.privilegeTier ?? 0])}
                        >
                          {TIER_NAMES[user.privilegeTier ?? 0]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {user.reputationPoints ?? 0}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('de-DE')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="Profil ansehen"
                            onClick={() => setDetailUserId(user.id)}
                          >
                            <Eye className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="Privilegien ändern"
                            onClick={() =>
                              setTierDialogUser({
                                id: user.id,
                                name: user.displayName ?? 'Unbekannt',
                                currentTier: user.privilegeTier ?? 0,
                              })
                            }
                          >
                            <Shield className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="Sperren / Bannen"
                            onClick={() =>
                              setSuspendDialogUser({
                                id: user.id,
                                name: user.displayName ?? 'Unbekannt',
                              })
                            }
                          >
                            <Ban className="size-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && !listQuery.isLoading && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Users className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Keine Nutzer gefunden.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Load more */}
      {listQuery.data?.nextCursor && (
        <p className="text-center text-xs text-muted-foreground">
          Weitere Nutzer verfügbar. Verwende die Suche, um einzugrenzen.
        </p>
      )}

      {/* Detail Dialog */}
      {detailUserId && (
        <UserDetailDialog
          userId={detailUserId}
          open={!!detailUserId}
          onOpenChange={(open) => {
            if (!open) setDetailUserId(null);
          }}
        />
      )}

      {/* Tier Change Dialog */}
      {tierDialogUser && (
        <TierChangeDialog
          user={tierDialogUser}
          open={!!tierDialogUser}
          onOpenChange={(open) => {
            if (!open) setTierDialogUser(null);
          }}
        />
      )}

      {/* Suspend Dialog */}
      {suspendDialogUser && (
        <SuspendDialog
          user={suspendDialogUser}
          open={!!suspendDialogUser}
          onOpenChange={(open) => {
            if (!open) setSuspendDialogUser(null);
          }}
        />
      )}
    </div>
  );
}

// ── User Detail Dialog ──────────────────────────────────────────────

function UserDetailDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const detailQuery = trpc.adminUsers.detail.useQuery(
    { userId },
    { enabled: open },
  );

  const user = detailQuery.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nutzerprofil</DialogTitle>
          <DialogDescription>
            Details und Aktivität des Nutzers.
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-lg font-medium">
                  {(user.display_name ?? '?')[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-base font-semibold">{user.display_name ?? 'Unbekannt'}</p>
                <Badge
                  variant="secondary"
                  className={cn('text-xs', TIER_COLORS[user.privilege_tier ?? 0])}
                >
                  {TIER_NAMES[user.privilege_tier ?? 0]}
                </Badge>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={Star}
                label="Reputation"
                value={user.reputation_points ?? 0}
              />
              <StatCard
                icon={Vote}
                label="Abstimmungen"
                value={user.voteCount ?? 0}
              />
              <StatCard
                icon={MessageSquare}
                label="Kommentare"
                value={user.commentCount ?? 0}
              />
              <StatCard
                icon={Calendar}
                label="Beigetreten"
                value={
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString('de-DE')
                    : '-'
                }
              />
            </div>

            {/* Recent reports */}
            {user.recentReports && user.recentReports.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">Letzte Meldungen</p>
                <div className="space-y-1.5">
                  {user.recentReports.map(
                    (report: { id: string; reason: string; status: string; createdAt: string }) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-xs"
                      >
                        <span>{REASON_LABELS[report.reason] ?? report.reason}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {report.status}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">Nutzer nicht gefunden.</p>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Schließen
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 p-2">
      <Icon className="size-4 text-muted-foreground" />
      <span className="text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Tier Change Dialog ──────────────────────────────────────────────

function TierChangeDialog({
  user,
  open,
  onOpenChange,
}: {
  user: { id: string; name: string; currentTier: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [newTier, setNewTier] = useState(String(user.currentTier));
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.adminUsers.updateTier.useMutation({
    onSuccess: () => {
      utils.adminUsers.list.invalidate();
      utils.adminUsers.detail.invalidate();
      toast({
        title: 'Stufe geändert',
        description: `${user.name} ist jetzt ${TIER_NAMES[Number(newTier)]}.`,
        variant: 'success',
      });
      onOpenChange(false);
    },
    onError: (err) => {
      toast({
        title: 'Fehler',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Privilegstufe ändern</DialogTitle>
          <DialogDescription>
            Aktuelle Stufe von <strong>{user.name}</strong>:{' '}
            {TIER_NAMES[user.currentTier]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <label className="text-sm font-medium">Neue Stufe</label>
          <Select value={newTier} onValueChange={(v) => v && setNewTier(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIER_NAMES).map(([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label} (Stufe {val})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Abbrechen
          </DialogClose>
          <Button
            size="sm"
            disabled={mutation.isPending || Number(newTier) === user.currentTier}
            onClick={() =>
              mutation.mutate({ userId: user.id, tier: Number(newTier) })
            }
          >
            {mutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Suspend / Ban Dialog ────────────────────────────────────────────

function SuspendDialog({
  user,
  open,
  onOpenChange,
}: {
  user: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [action, setAction] = useState<'suspend' | 'ban'>('suspend');
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const mutation = trpc.adminUsers.suspend.useMutation({
    onSuccess: () => {
      utils.adminUsers.list.invalidate();
      toast({
        title: action === 'suspend' ? 'Nutzer gesperrt' : 'Nutzer gebannt',
        description: `${user.name} wurde ${action === 'suspend' ? 'gesperrt' : 'gebannt'}.`,
        variant: 'success',
      });
      onOpenChange(false);
    },
    onError: (err) => {
      toast({
        title: 'Fehler',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Nutzer sperren / bannen
            </div>
          </DialogTitle>
          <DialogDescription>
            Aktion für <strong>{user.name}</strong> auswählen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Aktion</label>
            <Select value={action} onValueChange={(v) => v && setAction(v as 'suspend' | 'ban')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="suspend">Sperren (temporär)</SelectItem>
                <SelectItem value="ban">Bannen (permanent)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Begründung (optional)</label>
            <Textarea
              placeholder="Grund für die Sperre..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Abbrechen
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                userId: user.id,
                action,
                reason: reason || undefined,
              })
            }
          >
            {mutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
            {action === 'suspend' ? 'Sperren' : 'Bannen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
