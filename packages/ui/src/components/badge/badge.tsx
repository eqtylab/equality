import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from '@/components/badge/badge.module.css';
import { cn } from '@/lib/utils';

const badgeVariants = cva(styles['badge'], {
  variants: {
    variant: {
      default: styles['badge--default'],
      primary: styles['badge--primary'],
      secondary: styles['badge--secondary'],
      destructive: styles['badge--destructive'],
      outline: styles['badge--outline'],
      neutral: styles['badge--neutral'],
      success: styles['badge--success'],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
