import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from '@/components/alert/alert.module.css';
import { Icon } from '@/components/icon/icon';
import { cn } from '@/lib/utils';

const alertVariants = cva(styles['alert'], {
  variants: {
    variant: {
      primary: styles['alert--primary'],
      neutral: styles['alert--neutral'],
      success: styles['alert--success'],
      warning: styles['alert--warning'],
      danger: styles['alert--danger'],
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

// Default icons for variants. Primary and neutral have no icon by default.
const defaultVariantIcons: Record<string, string> = {
  success: 'Check',
  warning: 'OctagonAlert',
  danger: 'TriangleAlert',
};

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title: string;
  description?: string | React.ReactNode;
  icon?: React.ReactElement | string | null;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, description, icon, ...props }, ref) => {
    // Use the provided icon, otherwise fall back to the variant's default icon.
    // Passing `icon={null}` explicitly opts out of the default icon.
    const effectiveIcon =
      icon === undefined ? (variant ? defaultVariantIcons[variant] : undefined) : icon;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          alertVariants({ variant }),
          effectiveIcon ? styles['alert--with-icon'] : '',
          className
        )}
        {...props}
      >
        {effectiveIcon ? (
          <Icon
            icon={effectiveIcon}
            size="sm"
            background="transparent"
            className={styles['alert-icon']}
          />
        ) : null}
        <h4 className={styles['alert-title']}>{title}</h4>
        {description ? <p className={styles['alert-description']}>{description}</p> : null}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert };
