'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareModal } from './share-modal';

interface ShareButtonProps {
  topicId: string;
  topicTitle: string;
  choice?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

/**
 * Phase 161 — Share Button
 *
 * Button that opens the share modal for "Ich habe abgestimmt" cards.
 */
export function ShareButton({
  topicId,
  topicTitle,
  choice,
  className,
  variant = 'outline',
  size = 'sm',
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={className}
      >
        <Share2 className="size-4" />
        Teilen
      </Button>
      <ShareModal
        topicId={topicId}
        topicTitle={topicTitle}
        choice={choice}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
