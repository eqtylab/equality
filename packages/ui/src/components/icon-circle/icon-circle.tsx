import { forwardRef } from 'react';

import styles from '@/components/icon-circle/icon-circle.module.css';
import { cn } from '@/lib/utils';

export interface IconCircleProps {
  className?: string;
  icon?: React.ElementType;
}

const IconCircle = forwardRef<HTMLDivElement, IconCircleProps>(
  ({ className, icon, ...props }, ref) => {
    if (!icon) return null;

    const IconElement = icon as React.ElementType;

    return (
      <div ref={ref} className={cn(styles.container, className)} {...props}>
        <IconElement className={styles.icon} />
      </div>
    );
  }
);
IconCircle.displayName = 'IconCircle';

export { IconCircle };
