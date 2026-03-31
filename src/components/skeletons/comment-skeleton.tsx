import { Skeleton } from '@/components/ui/skeleton';

interface CommentSkeletonProps {
  count?: number;
}

function SingleCommentSkeleton() {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <Skeleton className="size-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        {/* Name + time */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        {/* Content lines */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
        {/* Rating bar */}
        <Skeleton className="h-6 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function CommentSkeleton({ count = 3 }: CommentSkeletonProps) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }, (_, i) => (
        <SingleCommentSkeleton key={i} />
      ))}
    </div>
  );
}
