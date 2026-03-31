'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc/client';
import { Plus } from 'lucide-react';

export default function FeatureFlagsPage() {
  const utils = trpc.useUtils();
  const { data: flags, isLoading } = trpc.featureFlags.list.useQuery();
  const updateMutation = trpc.featureFlags.update.useMutation({
    onSuccess: () => utils.featureFlags.list.invalidate(),
  });
  const createMutation = trpc.featureFlags.create.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate();
      setCreateOpen(false);
      setNewId('');
      setNewName('');
      setNewDescription('');
    },
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleToggle = (id: string, currentEnabled: boolean) => {
    updateMutation.mutate({ id, enabled: !currentEnabled });
  };

  const handleRolloutChange = (id: string, value: number) => {
    updateMutation.mutate({ id, rolloutPercentage: value });
  };

  const handleCreate = () => {
    if (!newId || !newName) return;
    createMutation.mutate({
      id: newId,
      name: newName,
      description: newDescription || undefined,
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Feature Flags</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="h-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Feature Flags</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus data-icon="inline-start" />
          Neue Flag
        </Button>
      </div>

      <div className="space-y-4">
        {(flags ?? []).map((flag) => (
          <Card key={flag.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{flag.name}</h3>
                    <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                      {flag.enabled ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                    {flag.rolloutPercentage < 100 && (
                      <Badge variant="outline">
                        {flag.rolloutPercentage}% Rollout
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {flag.description}
                  </p>

                  {/* Rollout percentage slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <Label className="shrink-0 text-xs text-muted-foreground">
                      Rollout:
                    </Label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={flag.rolloutPercentage}
                      onChange={(e) =>
                        handleRolloutChange(flag.id, Number(e.target.value))
                      }
                      className="h-1.5 w-full max-w-[200px] cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                    />
                    <span className="min-w-[3ch] text-xs tabular-nums text-muted-foreground">
                      {flag.rolloutPercentage}%
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    ID: <code className="rounded bg-muted px-1">{flag.id}</code>
                    {' | '}Aktualisiert: {formatDate(flag.updatedAt)}
                  </p>
                </div>
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={() => handleToggle(flag.id, flag.enabled)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Flag Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Feature Flag erstellen</DialogTitle>
            <DialogDescription>
              Erstelle eine neue Flag, um ein Feature schrittweise auszurollen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="flag-id">ID</Label>
              <Input
                id="flag-id"
                placeholder="mein-neues-feature"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Nur Kleinbuchstaben, Zahlen und Bindestriche.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag-name">Name</Label>
              <Input
                id="flag-name"
                placeholder="Mein neues Feature"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flag-desc">Beschreibung</Label>
              <Input
                id="flag-desc"
                placeholder="Was macht dieses Feature?"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          {createMutation.error && (
            <p className="text-sm text-destructive">
              {createMutation.error.message}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newId || !newName || createMutation.isPending}
            >
              {createMutation.isPending ? 'Erstelle...' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
