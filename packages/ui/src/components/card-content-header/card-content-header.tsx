import { forwardRef } from 'react';

import { Button } from '@/components/button/button';
import styles from '@/components/card-content-header/card-content-header.module.css';
import { Icon } from '@/components/icon/icon';
import { TitleBlock } from '@/components/title-block/title-block';

export interface CardContentHeaderProps {
  className?: string;
  /** A Lucide icon name or a React element, shown in a circle beside the heading. */
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
        mark={
          <Icon
            icon={icon}
            size="sm"
            background="circle"
            elevation="overlay"
            aria-hidden
            className={styles.mark}
          />
        }
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
