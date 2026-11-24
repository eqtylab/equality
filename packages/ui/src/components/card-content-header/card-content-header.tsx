import { forwardRef } from 'react';

import { Button } from '@/components/button/button';
import styles from '@/components/card-content-header/card-content-header.module.css';
import { Icon } from '@/components/icon/icon';
import { cn } from '@/lib/utils';

export interface CardContentHeaderProps {
  className?: string;
  /** A Lucide icon name or a React element, shown in a circle beside the heading. */
  icon: React.ReactElement | string;
  /** The card's title, rendered as an `h3`. */
  heading?: string;
  /** Shows a "See All" button at the end of the heading's line and runs on click. */
  onButtonClick?: () => void;
}

const CardContentHeader = forwardRef<HTMLDivElement, CardContentHeaderProps>(
  ({ className, icon, heading, onButtonClick, ...props }, ref) => {
    if (!heading && !onButtonClick) {
      return null;
    }

    return (
      <div ref={ref} className={cn(styles['card-content-header'], className)} {...props}>
        {/* TODO refactor this to be a slot so elevation can be set independently */}
        <Icon className={styles.mark} icon={icon} background="circle" elevation="overlay" />
        <div className={styles.line}>
          {heading && <h3 className={styles.title}>{heading}</h3>}
          {onButtonClick && (
            <Button className={styles.button} variant="tertiary" size="sm" onClick={onButtonClick}>
              See All
            </Button>
          )}
        </div>
      </div>
    );
  }
);
CardContentHeader.displayName = 'CardContentHeader';

export { CardContentHeader };
