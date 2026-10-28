import styles from '@/components/spinner/spinner.module.css';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning';
}

export const Spinner = ({ size = 'md', variant = 'primary' }: SpinnerProps) => {
  return (
    <span className={styles['spinner-container']}>
      <span className={cn(styles['spinner'], styles[size], styles[variant])} />
      <span className={cn(styles['spinner-background'], styles[size])} />
    </span>
  );
};
