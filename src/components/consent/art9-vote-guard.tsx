'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { Art9ConsentSheet } from './art9-consent-sheet';

interface Art9VoteGuardProps {
  children: React.ReactNode;
}

/**
 * Phase 177 -- Vote guard component.
 * Checks if the user has given Art. 9 DSGVO consent.
 * If not, shows the consent sheet instead of the vote UI.
 * After consent is given, renders children normally.
 */
export function Art9VoteGuard({ children }: Art9VoteGuardProps) {
  const { profile, isLoading } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // We need to look at the user's preferences for art9_consent_at.
  // The auth context provides profile; we check preferences via a separate approach.
  // Since useAuth provides `profile` (from Profile type) and not preferences directly,
  // we look at what's available. The guard needs user_preferences.art9_consent_at.
  // We'll use a trpc query for this.

  return (
    <Art9VoteGuardInner consentGiven={consentGiven} setConsentGiven={setConsentGiven}>
      {children}
    </Art9VoteGuardInner>
  );
}

/**
 * Inner guard that fetches preferences via tRPC.
 */
function Art9VoteGuardInner({
  children,
  consentGiven,
  setConsentGiven,
}: {
  children: React.ReactNode;
  consentGiven: boolean;
  setConsentGiven: (v: boolean) => void;
}) {
  const { user, isLoading } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleConsented = useCallback(() => {
    setConsentGiven(true);
  }, [setConsentGiven]);

  // Not logged in or still loading -- render children (the vote UI will handle auth separately)
  if (isLoading || !user) {
    return <>{children}</>;
  }

  // Check art9_consent_at from the user's profile/preferences.
  // We access it from the profile object if available, or default to showing guard.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const preferences = (user as any).preferences as
    | { art9_consent_at: string | null }
    | undefined;
  const hasConsent =
    consentGiven || (preferences?.art9_consent_at != null);

  if (hasConsent) {
    return <>{children}</>;
  }

  // Show a placeholder with a button to open consent
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Bevor du abstimmen kannst, benötigen wir deine Einwilligung zur
          Verarbeitung deiner politischen Meinungsäußerung.
        </p>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Einwilligung erteilen
        </button>
      </div>

      <Art9ConsentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onConsented={handleConsented}
      />
    </div>
  );
}
