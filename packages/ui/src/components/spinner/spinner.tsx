import styles from '@/components/spinner/spinner.module.css';
import { Elevation, ELEVATION, generateElevationVariants } from '@/lib/elevations';
import { cn } from '@/lib/utils';

const spinnerElevationVariants = generateElevationVariants(
  styles,
  'spinner-background',
  ELEVATION.RAISED
);

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning';
  elevation?: Elevation;
}

export const Spinner = ({
  size = 'md',
  variant = 'neutral',
  elevation = ELEVATION.RAISED,
}: SpinnerProps) => {
  return (
    <div className={styles['spinner-container']}>
      <div className={cn(styles['spinner'], styles[size], styles[variant])} />
      <div
        className={cn(
          styles['spinner-background'],
          styles[size],
          spinnerElevationVariants({ elevation })
        )}
      />
    </div>
  );
};
