import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedCardSkeletonProps {
  count?: number;
}

function SingleFeedCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4">
        {/* Badge */}
        <Skeleton className="h-5 w-20 rounded-full" />
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        {/* Description lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        {/* Stats row */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Button */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function FeedCardSkeleton({ count = 3 }: FeedCardSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }, (_, i) => (
        <SingleFeedCardSkeleton key={i} />
      ))}
    </div>
  );
}
