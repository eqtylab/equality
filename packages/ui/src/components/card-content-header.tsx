import { forwardRef } from 'react';

import { cn } from '../lib/utils';
import { Button } from './button';
import { IconCircle } from './icon-circle';

export interface CardContentHeaderProps {
  className?: string;
  icon?: React.ElementType;
  heading?: string;
  onButtonClick?: () => void;
}

const CardContentHeader = forwardRef<HTMLDivElement, CardContentHeaderProps>(
  ({ className, icon, heading, onButtonClick, ...props }, ref) => {
    const shouldRender = heading || onButtonClick;
    const shouldWrap = !!onButtonClick;

    if (!shouldRender) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between gap-2',
          shouldWrap && 'flex-wrap',
          className
        )}
        {...props}
      >
        <IconCircle icon={icon} />
        {onButtonClick && (
          <Button className="@sm/card:order-3" variant="outline" size="sm" onClick={onButtonClick}>
            See All
          </Button>
        )}
        {heading && (
          <h3
            className={cn(
              'text-card-foreground grow text-lg',
              onButtonClick && 'w-full @sm/card:w-auto'
            )}
          >
            {heading}
          </h3>
        )}
      </div>
    );
  }
);
CardContentHeader.displayName = 'CardContentHeader';

export { CardContentHeader };
