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

export type BadgeDisplayMode = 'both' | 'text-only' | 'icon-only';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  closeable?: boolean;
  handleClosable?: () => void;
  truncate?: boolean;
  truncateLength?: number;
  icon?: React.ReactElement | string;
  display?: BadgeDisplayMode;
}

// Default icons for variants
const defaultVariantIcons: Record<string, string> = {
  success: 'Check',
  warning: 'OctagonAlert',
  danger: 'TriangleAlert',
};

function Badge({
  className,
  variant,
  closeable,
  handleClosable,
  truncate = false,
  truncateLength = 50,
  icon,
  display = 'both',
  ...props
}: BadgeProps) {
  // Use default icon for variant if no icon is provided
  const effectiveIcon = icon ?? (variant ? defaultVariantIcons[variant] : undefined);

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
    if (effectiveIcon && display !== 'text-only') {
      return <Icon icon={effectiveIcon} size="xs" className={styles['icon']} />;
    }
    return null;
  };

  // Validate icon-only mode requires an icon
  // If icon-only is set without an icon, fallback to showing both
  const effectiveDisplay = display === 'icon-only' && !effectiveIcon ? 'both' : display;
  const shouldShowChildren = effectiveDisplay !== 'icon-only';
  const isIconOnly = effectiveDisplay === 'icon-only' && effectiveIcon;

  return (
    <div
      className={cn(
        variant !== null && badgeVariants({ variant }),
        variant === null && styles['badge'],
        isIconOnly && styles['badge--icon-only'],
        className
      )}
      {...props}
    >
      {renderIcon()}
      {shouldShowChildren && renderChildren()}
      {renderClosable()}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
