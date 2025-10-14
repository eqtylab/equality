import { forwardRef } from 'react';

import { cn } from '../lib/utils';

export interface IconCircleProps {
  className?: string;
  icon?: React.ElementType;
}

const IconCircle = forwardRef<HTMLDivElement, IconCircleProps>(
  ({ className, icon, ...props }, ref) => {
    if (!icon) return null;

    const IconElement = icon as React.ElementType;

    return (
      <div
        ref={ref}
        className={cn(
          'bg-foreground/10 text-foreground flex size-4 h-9 w-9 shrink-0 items-center justify-center rounded-full',
          className
        )}
        {...props}
      >
        <IconElement className="h-5 w-5" />
      </div>
    );
  }
);
IconCircle.displayName = 'IconCircle';

export { IconCircle };
