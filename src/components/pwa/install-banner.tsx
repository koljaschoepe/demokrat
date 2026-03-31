'use client';

import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/use-install-prompt';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Install banner shown at the top of the feed when the app can be installed.
 */
export function InstallBanner() {
  const { canInstall, promptInstall, isInstalled } = useInstallPrompt();
  const [showIOSHint, setShowIOSHint] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isIOS() && !isInstalled) {
      const iosDismissed = localStorage.getItem('demokrat-ios-install-dismissed');
      if (!iosDismissed) {
        setShowIOSHint(true);
      }
    }
  }, [isInstalled]);

  // Animate in after mount
  useEffect(() => {
    if (canInstall || showIOSHint) {
      const timer = setTimeout(() => setVisible(true), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [canInstall, showIOSHint]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setDismissed(true);
      if (showIOSHint) {
        localStorage.setItem('demokrat-ios-install-dismissed', 'true');
        setShowIOSHint(false);
      }
    }, 300);
  };

  if (dismissed) return null;

  // iOS instructions
  if (showIOSHint && !isInstalled) {
    return (
      <div
        className={`relative flex items-center gap-3 rounded-xl bg-indigo-50 p-3 ring-1 ring-indigo-200 transition-all duration-300 motion-reduce:transition-none ${
          visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
        role="banner"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
          <Share className="h-5 w-5 text-indigo-600" aria-hidden="true" />
        </div>
        <div className="flex-1 text-sm">
          <p className="font-medium text-indigo-900">
            Zum Home-Bildschirm hinzufügen
          </p>
          <p className="text-indigo-700">
            Tippe auf{' '}
            <Share className="inline h-3.5 w-3.5" aria-hidden="true" /> und
            dann &quot;Zum Home-Bildschirm&quot;
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-md p-1 text-indigo-400 hover:text-indigo-600"
          aria-label="Banner schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (!canInstall) return null;

  return (
    <div
      className={`relative flex items-center gap-3 rounded-xl bg-indigo-50 p-3 ring-1 ring-indigo-200 transition-all duration-300 motion-reduce:transition-none ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
      role="banner"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
        <Download className="h-5 w-5 text-indigo-600" aria-hidden="true" />
      </div>
      <p className="flex-1 text-sm font-medium text-indigo-900">
        Demokrat als App installieren
      </p>
      <button
        type="button"
        onClick={() => void promptInstall()}
        className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
      >
        Installieren
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 rounded-md p-1 text-indigo-400 hover:text-indigo-600"
        aria-label="Banner schließen"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
