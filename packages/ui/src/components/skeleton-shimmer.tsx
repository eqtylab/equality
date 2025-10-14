import { Skeleton } from './skeleton';

interface ShimmerSkeletonProps {
  className?: string;
}

export const ShimmerSkeleton = ({ className }: ShimmerSkeletonProps) => {
  return (
    <div className="relative overflow-hidden">
      <Skeleton className={className} />
      <div className="animate-shimmer absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};
