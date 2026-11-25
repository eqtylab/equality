import { forwardRef } from 'react';

import { Button } from '@/components/button/button';
import { TitleBlock, TitleBlockMark } from '@/components/title-block/title-block';

export interface CardContentHeaderProps {
  className?: string;
  /** A Lucide icon name or a React element, shown on a tile beside the heading. */
  icon: React.ReactElement | string;
  /** The card's title, rendered as an `h3`. */
  heading?: string;
  /** Shows a "See All" button at the end of the header and runs on click. */
  onButtonClick?: () => void;
}

const CardContentHeader = forwardRef<HTMLDivElement, CardContentHeaderProps>(
  ({ className, icon, heading, onButtonClick, ...props }, ref) => {
    if (!heading && !onButtonClick) {
      return null;
    }

    return (
      <TitleBlock
        ref={ref}
        size="sm"
        className={className}
        mark={<TitleBlockMark icon={icon} />}
        title={heading}
        actions={
          onButtonClick && (
            <Button
              variant="tertiary"
              size="sm"
              aria-label={heading ? `See All ${heading}` : undefined}
              onClick={onButtonClick}
            >
              See All
            </Button>
          )
        }
        {...props}
      />
    );
  }
);
CardContentHeader.displayName = 'CardContentHeader';

export { CardContentHeader };
