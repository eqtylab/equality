import { cn } from '../lib/utils';

interface PulsingIconProps {
  className?: string;
  iconClassName?: string;
}

// Using "currentColor" to make it more flexible, so use a TW class "text-[color]" to set the color
const PulsingIcon = ({ className, iconClassName }: PulsingIconProps) => {
  return (
    <div className={cn('grid size-3 items-center justify-items-center', className)}>
      <div
        className={cn(
          'animate-pulse-glow-outer col-span-full col-start-1 row-start-1 size-3 rounded-full',
          iconClassName
        )}
      />
      <div
        className={cn(
          'animate-pulse-glow-inner col-span-full col-start-1 row-start-1 size-3 rounded-full',
          iconClassName
        )}
      />
    </div>
  );
};

export default PulsingIcon;
