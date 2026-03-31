'use client';

import { useState, useEffect, useCallback } from 'react';

export type CookieConsent = 'essential' | 'all';

const STORAGE_KEY = 'cookie-consent';

/**
 * Hook to manage cookie consent state.
 * Returns null during SSR and before localStorage is read.
 */
export function useCookieConsent() {
  const [consent, setConsentState] = useState<CookieConsent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'essential' || stored === 'all') {
      setConsentState(stored);
    }
    setLoaded(true);
  }, []);

  const setConsent = useCallback((value: CookieConsent) => {
    localStorage.setItem(STORAGE_KEY, value);
    setConsentState(value);
  }, []);

  const isAnalyticsEnabled = consent === 'all';

  return {
    /** Current consent value, null if not yet decided or not yet loaded */
    consent: loaded ? consent : null,
    /** Whether the localStorage has been read */
    loaded,
    /** Set the consent choice */
    setConsent,
    /** Convenience: true if user accepted all cookies */
    isAnalyticsEnabled,
  };
}
