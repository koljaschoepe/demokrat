'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

interface ReportDialogProps {
  commentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'hate_speech', label: 'Hassrede' },
  { value: 'misinformation', label: 'Falschinformation' },
  { value: 'harassment', label: 'Belästigung' },
  { value: 'off_topic', label: 'Themenfern' },
  { value: 'other', label: 'Sonstiges' },
] as const;

type ReportReason = (typeof REPORT_REASONS)[number]['value'];

export function ReportDialog({ commentId, open, onOpenChange }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [success, setSuccess] = useState(false);

  const reportMutation = trpc.comments.report.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        setReason(null);
        setDetails('');
      }, 2000);
    },
  });

  if (!open) return null;

  function handleSubmit() {
    if (!reason) return;
    reportMutation.mutate({
      commentId,
      reason,
      ...(details.trim() ? { details: details.trim() } : {}),
    });
  }

  function handleClose() {
    onOpenChange(false);
    setReason(null);
    setDetails('');
    setSuccess(false);
    reportMutation.reset();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Kommentar melden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute right-3 top-3"
          onClick={handleClose}
          aria-label="Schließen"
        >
          <X className="size-4" />
        </Button>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">
              Danke für deine Meldung. Wir prüfen den Kommentar.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Kommentar melden</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Bitte wähle einen Grund für die Meldung.
            </p>

            {/* Reason radio group */}
            <div className="mb-4 flex flex-col gap-2" role="radiogroup" aria-label="Meldegrund">
              {REPORT_REASONS.map(({ value, label }) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                    reason === value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                      : 'border-border hover:bg-muted',
                  )}
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={value}
                    checked={reason === value}
                    onChange={() => setReason(value)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center rounded-full border-2',
                      reason === value ? 'border-indigo-500' : 'border-muted-foreground/30',
                    )}
                  >
                    {reason === value && <span className="size-2 rounded-full bg-indigo-500" />}
                  </span>
                  {label}
                </label>
              ))}
            </div>

            {/* Details textarea */}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Weitere Details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="Beschreibe das Problem genauer..."
                className="w-full resize-none rounded-lg border border-border bg-background p-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-xs text-muted-foreground">{details.length} / 500</span>
            </div>

            {/* Community guidelines link */}
            <p className="mb-4 text-xs text-muted-foreground">
              Lies unsere{' '}
              <a href="/community-guidelines" className="text-indigo-600 underline dark:text-indigo-400">
                Community-Richtlinien
              </a>
            </p>

            {/* Error */}
            {reportMutation.error && (
              <p className="mb-3 text-sm text-red-600 dark:text-red-400">
                {reportMutation.error.message}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!reason || reportMutation.isPending}
              >
                {reportMutation.isPending ? 'Wird gemeldet...' : 'Melden'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
