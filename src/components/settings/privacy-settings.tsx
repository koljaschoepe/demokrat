'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Download,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc/client';
import type { UserPreferences } from '@/lib/auth/types';

interface PrivacySettingsProps {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
}

function formatConsentDate(dateString: string | null): string {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function PrivacySettings({
  preferences,
  onUpdate,
}: PrivacySettingsProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);

  const updateArt9Consent = trpc.auth.updateArt9Consent.useMutation({
    onSuccess: (data) => {
      onUpdate(data.preferences);
      setShowRevokeConfirm(false);
      setFeedback({
        type: 'success',
        message: 'Einwilligung aktualisiert.',
      });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.message });
    },
  });

  const requestDataExport = trpc.auth.requestDataExport.useMutation({
    onSuccess: (data) => {
      setFeedback({ type: 'success', message: data.message });
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.message });
    },
  });

  const deleteAccount = trpc.auth.deleteAccount.useMutation({
    onSuccess: () => {
      router.push('/');
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.message });
      setShowDeleteConfirm(false);
    },
  });

  const handleRevokeConsent = useCallback(() => {
    updateArt9Consent.mutate({ consent: false });
  }, [updateArt9Consent]);

  const handleDeleteAccount = useCallback(() => {
    deleteAccount.mutate({ confirmation: 'DELETE' });
  }, [deleteAccount]);

  return (
    <div className="flex flex-col gap-6">
      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Art. 9 Einwilligung */}
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Art. 9 DSGVO Einwilligung</p>
              <p className="text-sm text-muted-foreground">
                Einwilligung zur Verarbeitung besonderer Kategorien
                personenbezogener Daten (politische Meinungen).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {preferences.art9_consent_at ? (
              <>
                <Badge variant="secondary">Erteilt</Badge>
                <span className="text-xs text-muted-foreground">
                  am {formatConsentDate(preferences.art9_consent_at)}
                </span>
              </>
            ) : (
              <Badge variant="outline">Nicht erteilt</Badge>
            )}
          </div>

          {preferences.art9_consent_at && !showRevokeConfirm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevokeConfirm(true)}
              disabled={updateArt9Consent.isPending}
            >
              Einwilligung widerrufen
            </Button>
          )}

          {showRevokeConfirm && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Einwilligung widerrufen?</AlertTitle>
              <AlertDescription>
                Alle deine Abstimmungsdaten werden unwiderruflich gelöscht.
                Dieser Vorgang kann nicht rückgängig gemacht werden.
              </AlertDescription>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRevokeConsent}
                  disabled={updateArt9Consent.isPending}
                >
                  {updateArt9Consent.isPending
                    ? 'Wird widerrufen...'
                    : 'Ja, widerrufen'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevokeConfirm(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Datenexport */}
      <Card>
        <CardContent className="flex items-center gap-3">
          <Download className="size-5 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <p className="font-medium">Datenexport (Art. 20 DSGVO)</p>
            <p className="text-sm text-muted-foreground">
              Fordere eine Kopie aller deiner Daten an.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => requestDataExport.mutate()}
            disabled={requestDataExport.isPending}
          >
            {requestDataExport.isPending ? 'Wird erstellt...' : 'Anfordern'}
          </Button>
        </CardContent>
      </Card>

      {/* Konto löschen */}
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <Trash2 className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Konto löschen</p>
              <p className="text-sm text-muted-foreground">
                Dein Konto und alle damit verbundenen Daten werden
                unwiderruflich gelöscht.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="self-start"
            >
              Konto löschen
            </Button>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Bist du sicher?</AlertTitle>
              <AlertDescription>
                Dieser Vorgang kann nicht rückgängig gemacht werden. Alle deine
                Daten, Abstimmungen und Kommentare werden dauerhaft gelöscht.
              </AlertDescription>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccount.isPending}
                >
                  {deleteAccount.isPending
                    ? 'Wird gelöscht...'
                    : 'Endgültig löschen'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
