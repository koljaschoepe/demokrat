'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ConsentLevel = 'essential' | 'all';

const STORAGE_KEY = 'cookie_consent';

/** Subscribers get notified when we write to localStorage. */
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  // On the server we can't read localStorage — assume no consent yet.
  return null;
}

function setConsent(level: ConsentLevel) {
  localStorage.setItem(STORAGE_KEY, level);
  // Notify all subscribers so the component re-renders.
  listeners.forEach((fn) => fn());
}

export function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay slightly to trigger the slide-up animation
    if (!consent) {
      const timer = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(timer);
    }
  }, [consent]);

  const handleEssential = useCallback(() => setConsent('essential'), []);
  const handleAll = useCallback(() => setConsent('all'), []);

  if (consent) return null;

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t bg-background p-4 shadow-lg transition-transform duration-500 ease-out',
        mounted ? 'translate-y-0' : 'translate-y-full'
      )}
      role="dialog"
      aria-label="Cookie-Einwilligung"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Wir verwenden technisch notwendige Cookies, um die Funktionalitat der
          Plattform sicherzustellen. Optionale Cookies helfen uns, die Plattform zu
          verbessern.{' '}
          <Link
            href="/datenschutz"
            className="text-primary underline-offset-4 hover:underline"
          >
            Mehr erfahren
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={handleEssential}>
            Nur notwendige
          </Button>
          <Button size="sm" onClick={handleAll}>
            Akzeptieren
          </Button>
        </div>
      </div>
    </div>
  );
}
