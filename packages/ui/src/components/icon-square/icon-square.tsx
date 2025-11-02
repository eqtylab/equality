import styles from '@/components/icon-square/icon-square.module.css';
import { cn } from '@/lib/utils';

interface IconSquareProps {
  icon: React.ElementType;
  size?: 'sm' | 'md';
  className?: string;
}

const IconSquare = ({ icon: Icon, size = 'md', className }: IconSquareProps) => {
  const iconSizeClass = size === 'sm' ? styles['size--sm'] : styles['size--md'];

  return (
    <div className={cn(styles['icon-square'], className)}>
      <Icon className={cn(styles['icon'], iconSizeClass)} />
    </div>
  );
};

export { IconSquare };
