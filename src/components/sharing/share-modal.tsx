'use client';

import { useState, useCallback } from 'react';
import { Share2, Download, X, Smartphone, MessageCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  topicId: string;
  topicTitle: string;
  choice?: string;
  open: boolean;
  onClose: () => void;
}

const FORMATS = [
  {
    key: 'twitter',
    label: 'Twitter / X',
    icon: Globe,
    ratio: '16:9',
    description: 'Optimal für Twitter und LinkedIn',
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    ratio: '1:1',
    description: 'Quadratisch für Messenger',
  },
  {
    key: 'instagram',
    label: 'Instagram Story',
    icon: Smartphone,
    ratio: '9:16',
    description: 'Hochformat für Stories',
  },
] as const;

/**
 * Phase 161 — Share Modal
 *
 * Modal for sharing vote results and "Ich habe abgestimmt" cards.
 * Provides format selection, preview, download, and native share.
 */
export function ShareModal({ topicId, topicTitle, choice, open, onClose }: ShareModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('twitter');
  const [downloading, setDownloading] = useState(false);

  const shareCardUrl = `/api/og/share-card?title=${encodeURIComponent(topicTitle)}&choice=${choice ?? 'ja'}&format=${selectedFormat}`;
  const resultUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/themen/${topicId}/ergebnis`
    : `/themen/${topicId}/ergebnis`;

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const response = await fetch(shareCardUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demokrat-abstimmung-${selectedFormat}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[share] Download failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [shareCardUrl, selectedFormat]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return;

    try {
      // Try sharing with image if possible
      const response = await fetch(shareCardUrl);
      const blob = await response.blob();
      const file = new File([blob], 'demokrat-abstimmung.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Ich habe abgestimmt: ${topicTitle}`,
          text: `Sieh dir mein Abstimmungsergebnis an!`,
          url: resultUrl,
          files: [file],
        });
      } else {
        await navigator.share({
          title: `Ich habe abgestimmt: ${topicTitle}`,
          text: `Sieh dir mein Abstimmungsergebnis an!`,
          url: resultUrl,
        });
      }
    } catch {
      // User cancelled
    }
  }, [shareCardUrl, topicTitle, resultUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <Card className="relative z-10 mx-4 mb-4 w-full max-w-md sm:mb-0">
        <CardContent className="p-5">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Teilen</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="size-4" />
              <span className="sr-only">Schließen</span>
            </Button>
          </div>

          {/* Format picker */}
          <div className="mb-4 space-y-2">
            <p className="text-sm text-muted-foreground">Format wählen:</p>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.key}
                    type="button"
                    onClick={() => setSelectedFormat(format.key)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors',
                      selectedFormat === format.key
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'hover:bg-muted',
                    )}
                  >
                    <Icon className="size-5" />
                    <span className="font-medium">{format.label}</span>
                    <span className="text-muted-foreground">{format.ratio}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-4 overflow-hidden rounded-lg border bg-muted/50">
            <img
              src={shareCardUrl}
              alt="Vorschau der Share-Card"
              className="mx-auto max-h-48 w-auto object-contain"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download className="size-4" />
              {downloading ? 'Laden...' : 'Herunterladen'}
            </Button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={handleNativeShare}
              >
                <Share2 className="size-4" />
                Teilen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
