'use client';

import { Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopicDetailMobileBar() {
  const scrollToVoting = () => {
    // Scroll to voting section
    const votingSection = document.querySelector('[data-slot="separator"]');
    votingSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <Button
        className="w-full"
        size="lg"
        onClick={scrollToVoting}
      >
        <Vote className="size-4" />
        Abstimmen
      </Button>
    </div>
  );
}
