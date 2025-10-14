import { cn } from '../lib/utils';

interface IconSquareProps {
  icon: React.ElementType;
  size?: 'sm' | 'md';
  className?: string;
}

const IconSquare = ({ icon: Icon, size = 'md', className }: IconSquareProps) => {
  const iconSizeClass = size === 'sm' ? 'size-4' : 'size-5';

  return (
    <div className={cn('bg-foreground/10 w-max rounded-lg p-2', className)}>
      <Icon className={cn('text-foreground', iconSizeClass)} />
    </div>
  );
};

export { IconSquare };
