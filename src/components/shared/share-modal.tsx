'use client';

import { useState, useCallback } from 'react';
import { Link2, Share2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ShareModalProps {
  title: string;
  text: string;
  url: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareModal({
  title,
  text,
  url,
  open,
  onOpenChange,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [supportsShare] = useState(
    () => typeof navigator !== 'undefined' && !!navigator.share
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleWebShare = useCallback(async () => {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // User cancelled or share failed — ignore
    }
  }, [title, text, url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Teilen</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {/* Copy Link */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleCopyLink}
          >
            <Link2 className="size-4" />
            {copied ? 'Link kopiert!' : 'Link kopieren'}
          </Button>

          {/* Web Share API */}
          {supportsShare && (
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleWebShare}
            >
              <Share2 className="size-4" />
              Teilen
            </Button>
          )}

          {/* Share as Image (placeholder) */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            disabled
          >
            <Image className="size-4" />
            Als Bild teilen
            <span className="ml-auto text-xs text-muted-foreground">
              Bald verfügbar
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
