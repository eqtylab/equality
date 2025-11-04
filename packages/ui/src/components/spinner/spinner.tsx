import styles from '@/components/spinner/spinner.module.css';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: number;
  color?: string;
  borderWidth?: number;
}

// TODO: Optimize to take variants for size - Color should always be dark/light
export const Spinner = ({
  size = 40,
  color = 'border-gray-400',
  borderWidth = 4,
}: SpinnerProps) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${borderWidth}px`,
  };

  return <div className={cn(styles['spinner'], color)} style={spinnerStyle} />;
};
