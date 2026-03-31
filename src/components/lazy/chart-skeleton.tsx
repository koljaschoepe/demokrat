import { Skeleton } from '@/components/ui/skeleton';

interface ChartSkeletonProps {
  className?: string;
  /** Height of the chart skeleton in pixels */
  height?: number;
}

/**
 * Phase 190 -- Skeleton placeholder for lazy-loaded chart components.
 * Renders animated bars to indicate a chart is loading.
 */
export function ChartSkeleton({ className, height = 200 }: ChartSkeletonProps) {
  return (
    <div
      className={className}
      style={{ height }}
      role="status"
      aria-label="Diagramm wird geladen"
    >
      <div className="flex h-full items-end gap-2 px-4 pb-6 pt-2">
        <Skeleton className="h-[40%] flex-1 rounded-t-sm" />
        <Skeleton className="h-[65%] flex-1 rounded-t-sm" />
        <Skeleton className="h-[80%] flex-1 rounded-t-sm" />
        <Skeleton className="h-[55%] flex-1 rounded-t-sm" />
        <Skeleton className="h-[70%] flex-1 rounded-t-sm" />
        <Skeleton className="h-[45%] flex-1 rounded-t-sm" />
        <Skeleton className="h-[90%] flex-1 rounded-t-sm" />
      </div>
      <span className="sr-only">Diagramm wird geladen...</span>
    </div>
  );
}
