import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicSummaryProps {
  summary: string;
  className?: string;
}

export function TopicSummary({ summary, className }: TopicSummaryProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-l-4 border-primary bg-primary/5 p-4',
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          KI-Zusammenfassung
        </h3>
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        Diese Zusammenfassung wurde automatisch erstellt.
      </p>
    </div>
  );
}
