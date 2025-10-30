import styles from '@/components/shimmer-skeleton/shimmer-skeleton.module.css';
import { Skeleton } from '@/components/skeleton/skeleton';
import { cn } from '@/lib/utils';

interface ShimmerSkeletonProps {
  className?: string;
}

// TODO: Check why there's two components (Skeleton and ShimmerSkeleton) - Optimize to one component
const ShimmerSkeleton = ({ className }: ShimmerSkeletonProps) => {
  return (
    <div className={cn(styles['shimmer-skeleton'], className)}>
      <Skeleton className={className} />
      <div className={cn(styles['content'], className)} />
    </div>
  );
};

export { ShimmerSkeleton };
