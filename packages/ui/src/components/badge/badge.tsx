import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

import styles from '@/components/badge/badge.module.css';
import { Button } from '@/components/button/button';
import { Icon } from '@/components/icon/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';

const XIcon = X as React.ComponentType<{ className?: string }>;

const badgeVariants = cva(styles['badge'], {
  variants: {
    variant: {
      primary: styles['badge--primary'],
      danger: styles['badge--danger'],
      neutral: styles['badge--neutral'],
      warning: styles['badge--warning'],
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
  truncate?: boolean;
  truncateLength?: number;
  icon?: React.ReactElement | string;
}

function Badge({
  className,
  variant,
  closeable,
  handleClosable,
  truncate = false,
  truncateLength = 50,
  icon,
  ...props
}: BadgeProps) {
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

  const renderChildren = () => {
    const children = props.children;

    if (truncate && typeof children === 'string' && children.length > truncateLength) {
      const displayLabel = children.slice(0, truncateLength) + '...';
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>{displayLabel}</TooltipTrigger>
            <TooltipContent className={styles['tooltip']}>{children}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return children;
  };

  const renderIcon = () => {
    if (icon) {
      return <Icon icon={icon} size="xs" className={styles['icon']} />;
    }
    return null;
  };

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {renderIcon()}
      {renderChildren()}
      {renderClosable()}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
