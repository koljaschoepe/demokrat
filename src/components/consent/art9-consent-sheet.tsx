'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

interface Art9ConsentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsented: () => void;
}

/**
 * Phase 177 -- Art. 9 DSGVO consent sheet.
 * Displayed before the user's first vote to obtain explicit consent
 * for processing political opinion data (Art. 9 Abs. 2 lit. a DSGVO).
 */
export function Art9ConsentSheet({
  open,
  onOpenChange,
  onConsented,
}: Art9ConsentSheetProps) {
  const [agreed, setAgreed] = useState(false);
  const utils = trpc.useUtils();

  const consentMutation = trpc.users.giveArt9Consent.useMutation({
    onSuccess: () => {
      utils.users.invalidate();
      onConsented();
      onOpenChange(false);
    },
  });

  const handleConfirm = () => {
    if (!agreed) return;
    consentMutation.mutate();
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Einwilligung zur Stimmabgabe"
      description="Art. 9 DSGVO -- Verarbeitung besonderer Datenkategorien"
      defaultSnap="md"
    >
      <div className="space-y-4 py-2">
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="space-y-2 text-sm">
            <p>
              Deine Stimme ist eine <strong>politische Meinungsäußerung</strong> nach
              Art. 9 DSGVO. Politische Meinungen gehören zu den besonderen Kategorien
              personenbezogener Daten und genießen einen erhöhten Schutz.
            </p>
            <p>
              Wir speichern deine Stimmen{' '}
              <strong>anonymisiert und getrennt von deinem Profil</strong>. Nach der
              Stimmabgabe ist eine Zuordnung zu deiner Person technisch nicht möglich.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg p-2">
          <Checkbox
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            id="art9-consent"
          />
          <label
            htmlFor="art9-consent"
            className="cursor-pointer text-sm leading-relaxed"
          >
            Ich habe verstanden und stimme der Verarbeitung meiner politischen
            Meinungsäußerung gemäß Art. 9 Abs. 2 lit. a DSGVO ausdrücklich zu.
          </label>
        </div>

        <p className="text-xs text-muted-foreground">
          Du kannst deine Einwilligung jederzeit in den Einstellungen widerrufen.
          Bereits abgegebene anonymisierte Stimmen bleiben davon unberührt.{' '}
          <Link
            href="/datenschutz"
            className="underline underline-offset-2 hover:text-foreground"
            target="_blank"
          >
            Datenschutzerklärung lesen
          </Link>
        </p>

        {consentMutation.error && (
          <p className="text-sm text-destructive">
            {consentMutation.error.message}
          </p>
        )}

        <Button
          className="w-full"
          disabled={!agreed || consentMutation.isPending}
          onClick={handleConfirm}
        >
          {consentMutation.isPending
            ? 'Wird gespeichert...'
            : 'Zustimmen und abstimmen'}
        </Button>
      </div>
    </BottomSheet>
  );
}
