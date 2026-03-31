'use client';

import { useState, useCallback } from 'react';
import { Share2, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResultShareBarProps {
  topicId: string;
  topicTitle: string;
  className?: string;
}

/**
 * Phase 160 — Result Share Bar
 *
 * Share functionality for public result pages.
 * Uses Web Share API on supported devices, falls back to clipboard.
 */
export function ResultShareBar({ topicId, topicTitle, className }: ResultShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/themen/${topicId}/ergebnis`
    : `/themen/${topicId}/ergebnis`;

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `Abstimmungsergebnis: ${topicTitle}`,
      text: `Sieh dir das Abstimmungsergebnis an: ${topicTitle}`,
      url: shareUrl,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [shareUrl, topicTitle]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }, [shareUrl]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button variant="outline" size="sm" onClick={handleShare}>
        <Share2 className="size-4" />
        Teilen
      </Button>
      <Button variant="ghost" size="sm" onClick={handleCopyLink}>
        {copied ? (
          <>
            <Check className="size-4 text-green-600" />
            Kopiert
          </>
        ) : (
          <>
            <Link2 className="size-4" />
            Link kopieren
          </>
        )}
      </Button>
    </div>
  );
}
