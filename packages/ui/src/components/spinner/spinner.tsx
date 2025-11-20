import styles from '@/components/spinner/spinner.module.css';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning';
}

export const Spinner = ({ size = 'md', variant = 'neutral' }: SpinnerProps) => {
  return (
    <div className={styles['spinner-container']}>
      <div className={cn(styles['spinner'], styles[size], styles[variant])} />
      <div className={cn(styles['spinner-background'], styles[size])} />
    </div>
  );
};
