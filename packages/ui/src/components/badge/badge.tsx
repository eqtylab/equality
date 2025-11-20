import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from '@/components/badge/badge.module.css';
import { cn } from '@/lib/utils';

const badgeVariants = cva(styles['badge'], {
  variants: {
    variant: {
      primary: styles['badge--primary'],
      destructive: styles['badge--destructive'],
      neutral: styles['badge--neutral'],
      success: styles['badge--success'],
    },
  },
  defaultVariants: {
    variant: 'primary',
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
