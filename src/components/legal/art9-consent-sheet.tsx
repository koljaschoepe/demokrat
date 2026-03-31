'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Art9ConsentSheetProps {
  open: boolean;
  onConsent: () => void;
  onClose: () => void;
}

export function Art9ConsentSheet({
  open,
  onConsent,
  onClose,
}: Art9ConsentSheetProps) {
  const [accepted, setAccepted] = useState(false);

  function handleConsent() {
    if (accepted) {
      onConsent();
      setAccepted(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onClose();
      setAccepted(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <SheetTitle>Politische Meinungsdaten</SheetTitle>
          </div>
          <SheetDescription>
            Einwilligung nach Art. 9 DSGVO
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Deine Abstimmungen sind politische Meinungen im Sinne von Art. 9
            DSGVO und damit besonders schützenswert. Wir speichern sie
            pseudonym und sicher auf Servern in der EU. Du kannst deine Daten
            jederzeit einsehen und löschen.
          </p>

          <div className="flex items-start gap-2">
            <Checkbox
              id="art9-consent"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked)}
            />
            <Label
              htmlFor="art9-consent"
              className="text-sm font-normal leading-snug"
            >
              Ich willige ein, dass meine politischen Meinungsdaten verarbeitet
              werden
            </Label>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!accepted}
            onClick={handleConsent}
          >
            Einwilligen und abstimmen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
