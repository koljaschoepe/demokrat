'use client';

import { useCallback, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc/client';
import type { UserPreferences } from '@/lib/auth/types';

interface NotificationSettingsProps {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
}

export function NotificationSettings({
  preferences,
  onUpdate,
}: NotificationSettingsProps) {
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const updatePreferences = trpc.users.updatePreferences.useMutation({
    onSuccess: (data) => {
      onUpdate(data.preferences);
      setFeedback({
        type: 'success',
        message: 'Benachrichtigungen aktualisiert.',
      });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.message });
    },
  });

  const handleToggle = useCallback(
    (
      field:
        | 'notification_votes'
        | 'notification_comments'
        | 'notification_results',
      value: boolean,
    ) => {
      updatePreferences.mutate({ [field]: value });
    },
    [updatePreferences],
  );

  return (
    <div className="flex flex-col gap-5">
      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="notif-votes" className="flex-1 cursor-pointer">
          <div>
            <p className="font-medium">Abstimmungen</p>
            <p className="text-xs text-muted-foreground">
              Benachrichtigung bei neuen Abstimmungen in deinen Kategorien.
            </p>
          </div>
        </Label>
        <Switch
          id="notif-votes"
          checked={preferences.notification_votes}
          onCheckedChange={(checked: boolean) =>
            handleToggle('notification_votes', checked)
          }
          disabled={updatePreferences.isPending}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="notif-comments" className="flex-1 cursor-pointer">
          <div>
            <p className="font-medium">Kommentare</p>
            <p className="text-xs text-muted-foreground">
              Benachrichtigung bei Antworten auf deine Kommentare.
            </p>
          </div>
        </Label>
        <Switch
          id="notif-comments"
          checked={preferences.notification_comments}
          onCheckedChange={(checked: boolean) =>
            handleToggle('notification_comments', checked)
          }
          disabled={updatePreferences.isPending}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="notif-results" className="flex-1 cursor-pointer">
          <div>
            <p className="font-medium">Ergebnisse</p>
            <p className="text-xs text-muted-foreground">
              Benachrichtigung wenn Abstimmungsergebnisse vorliegen.
            </p>
          </div>
        </Label>
        <Switch
          id="notif-results"
          checked={preferences.notification_results}
          onCheckedChange={(checked: boolean) =>
            handleToggle('notification_results', checked)
          }
          disabled={updatePreferences.isPending}
        />
      </div>
    </div>
  );
}
