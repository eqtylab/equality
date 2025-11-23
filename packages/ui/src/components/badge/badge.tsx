import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import styles from '@/components/badge/badge.module.css';
import { Button } from '@/components/button/button';
import { cn } from '@/lib/utils';

const XIcon = X as React.ComponentType<{ className?: string }>;

const badgeVariants = cva(styles['badge'], {
  variants: {
    variant: {
      primary: styles['badge--primary'],
      danger: styles['badge--danger'],
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
    VariantProps<typeof badgeVariants> {
  closeable?: boolean;
  handleClosable?: () => void;
}

function Badge({ className, variant, closeable, handleClosable, ...props }: BadgeProps) {
  const renderClosable = () => {
    if (closeable && handleClosable)
      return (
        <Button
          variant="tertiary"
          size="sm"
          onClick={handleClosable}
          className={styles['closable-btn']}
        >
          <XIcon />
        </Button>
      );
    return null;
  };

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {props.children}
      {renderClosable()}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
