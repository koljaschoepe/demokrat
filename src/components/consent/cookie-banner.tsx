'use client';

import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

/**
 * Phase 176 -- Cookie consent banner.
 * Compact bottom banner, only shows if user has not yet made a choice.
 * Two options: essential only (default/primary) or accept all.
 */
export function CookieBanner() {
  const { consent, loaded, setConsent } = useCookieConsent();

  // Don't render on server or before localStorage is read
  if (!loaded) return null;

  // Already made a choice
  if (consent !== null) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="mx-auto max-w-lg rounded-xl border bg-popover p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="size-4 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium">Cookie-Einstellungen</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Wir verwenden technisch notwendige Cookies für den Betrieb der
                Plattform. Optional können Sie Analyse-Cookies aktivieren, um uns
                bei der Verbesserung zu helfen.{' '}
                <Link
                  href="/datenschutz"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Mehr erfahren
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConsent('essential')}
              >
                Nur notwendige
              </Button>
              <Button size="sm" onClick={() => setConsent('all')}>
                Alle akzeptieren
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
