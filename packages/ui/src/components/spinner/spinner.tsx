import styles from '@/components/spinner/spinner.module.css';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'neutral' | 'primary' | 'success' | 'danger' | 'warning';
  label?: string;
}

export const Spinner = ({ size = 'md', variant = 'primary', label = 'Loading' }: SpinnerProps) => {
  return (
    <div className={styles['spinner-container']} role="status">
      <div className={cn(styles['spinner'], styles[size], styles[variant])} />
      <div className={cn(styles['spinner-background'], styles[size])} />
      <span className={styles['visually-hidden']}>{label}</span>
    </div>
  );
};
