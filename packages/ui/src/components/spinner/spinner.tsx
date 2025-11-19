import styles from '@/components/spinner/spinner.module.css';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'theme' | 'primary' | 'secondary' | 'green' | 'red' | 'gold';
}

export const Spinner = ({ size = 'md', color = 'theme' }: SpinnerProps) => {
  return (
    <div className={styles['spinner-container']}>
      <div className={cn(styles['spinner'], styles[size], styles[color])} />
      <div className={cn(styles['spinner-background'], styles[size])} />
    </div>
  );
};
