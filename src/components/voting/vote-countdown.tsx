'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteCountdownProps {
  closesAt: string | null;
  className?: string;
}

/**
 * Displays remaining time until voting closes.
 * Updates every minute. Shows "Abstimmung beendet" when expired.
 */
export function VoteCountdown({ closesAt, className }: VoteCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!closesAt) {
      setTimeLeft('');
      return;
    }

    function calculate() {
      const now = Date.now();
      const end = new Date(closesAt!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Abstimmung beendet');
        setIsExpired(true);
        return;
      }

      setIsExpired(false);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`Noch ${days} ${days === 1 ? 'Tag' : 'Tage'}, ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`);
      } else if (hours > 0) {
        setTimeLeft(`Noch ${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}, ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`);
      } else if (minutes > 0) {
        setTimeLeft(`Noch ${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`);
      } else {
        setTimeLeft('Weniger als eine Minute');
      }
    }

    calculate();
    const interval = setInterval(calculate, 60_000);

    return () => clearInterval(interval);
  }, [closesAt]);

  if (!closesAt || !timeLeft) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-sm',
        isExpired
          ? 'text-gray-500 dark:text-gray-400'
          : 'text-muted-foreground',
        className,
      )}
    >
      <Clock className="size-3.5" />
      <span>{timeLeft}</span>
    </div>
  );
}
