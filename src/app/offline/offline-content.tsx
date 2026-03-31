'use client';

import { useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineContent() {
  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#fafafa] px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
        <WifiOff className="h-10 w-10 text-indigo-600" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Du bist offline</h1>
        <p className="max-w-sm text-gray-600">
          Deine naechste Abstimmung wird gespeichert und uebertragen, sobald du
          wieder online bist.
        </p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
