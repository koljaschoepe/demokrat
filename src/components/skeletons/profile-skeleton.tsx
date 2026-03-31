import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-6 w-10" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Tab bar */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Content cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
