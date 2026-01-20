import styles from '@/components/skeleton/skeleton.module.css';
import { Elevation, ELEVATION, generateElevationVariants } from '@/lib/elevations';
import { cn } from '@/lib/utils';

const skeletonElevationVariants = generateElevationVariants(styles, 'skeleton', ELEVATION.RAISED);

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
}

function Skeleton({ className, elevation = ELEVATION.RAISED, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(styles['skeleton'], skeletonElevationVariants({ elevation }), className)}
      {...props}
    />
  );
}

export { Skeleton };
