import { forwardRef } from 'react';

import { Button } from '@/components/button/button';
import styles from '@/components/card-content-header/card-content-header.module.css';
import { Icon } from '@/components/icon/icon';
import { cn } from '@/lib/utils';

export interface CardContentHeaderProps {
  className?: string;
  icon: React.ReactElement | string;
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
          styles['card-content-header'],
          shouldWrap && styles['card-content-header--wrap'],
          className
        )}
        {...props}
      >
        {/* TODO refactor this to be a slot so elevation can be set independently */}
        <Icon icon={icon} background="circle" elevation="overlay" />
        {onButtonClick && (
          <Button className={styles.button} variant="tertiary" size="sm" onClick={onButtonClick}>
            See All
          </Button>
        )}
        {heading && (
          <h3 className={cn(styles.title, onButtonClick && styles['title--button-click'])}>
            {heading}
          </h3>
        )}
      </div>
    );
  }
);
CardContentHeader.displayName = 'CardContentHeader';

export { CardContentHeader };
