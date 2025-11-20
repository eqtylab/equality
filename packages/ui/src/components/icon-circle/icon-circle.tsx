import { forwardRef } from 'react';

import styles from '@/components/icon-circle/icon-circle.module.css';
import { cn } from '@/lib/utils';

export interface IconCircleProps {
  className?: string;
  icon?: React.ElementType;
  size?: 'sm' | 'md' | 'lg';
}

const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 32,
};

const IconCircle = forwardRef<HTMLDivElement, IconCircleProps>(
  ({ className, icon: Icon, size = 'sm', ...props }, ref) => {
    if (!Icon) return null;

    const IconComponent = Icon as React.ComponentType<{ size?: number }>;
    const iconSize = iconSizeMap[size];

    return (
      <div ref={ref} className={cn(styles['icon-circle'], className)} {...props}>
        <IconComponent size={iconSize} />
      </div>
    );
  }
);
IconCircle.displayName = 'IconCircle';

export { IconCircle };
