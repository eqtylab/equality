import { forwardRef } from 'react';

import { Button } from '@/components/button/button';
import styles from '@/components/card-content-header/card-content-header.module.css';
import { IconCircle } from '@/components/icon-circle/icon-circle';
import { cn } from '@/lib/utils';

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
        className={cn(styles.container, shouldWrap && styles.wrap, className)}
        {...props}
      >
        <IconCircle icon={icon} />
        {onButtonClick && (
          <Button className={styles.button} variant="outline" size="sm" onClick={onButtonClick}>
            See All
          </Button>
        )}
        {heading && (
          <h3 className={cn(styles.title, onButtonClick && styles['title-width'])}>{heading}</h3>
        )}
      </div>
    );
  }
);
CardContentHeader.displayName = 'CardContentHeader';

export { CardContentHeader };
