import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MapSkeletonProps {
  className?: string;
}

/**
 * Phase 190 -- Skeleton placeholder for lazy-loaded map components.
 * Shows a map-like loading state with a pulsing Germany outline hint.
 */
export function MapSkeleton({ className }: MapSkeletonProps) {
  return (
    <div
      className={cn(
        'relative flex flex-1 items-center justify-center',
        'bg-gradient-to-b from-blue-50 to-indigo-50',
        'dark:from-gray-900 dark:to-indigo-950',
        className,
      )}
      role="status"
      aria-label="Karte wird geladen"
      style={{ minHeight: 300 }}
    >
      {/* Simulated map tile grid */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-px opacity-30">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="rounded-none" />
        ))}
      </div>

      {/* Center loading indicator */}
      <div className="z-10 flex flex-col items-center gap-3">
        <div className="size-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <span className="text-sm font-medium text-muted-foreground">
          Karte wird geladen...
        </span>
      </div>
    </div>
  );
}
