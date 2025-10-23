import * as React from 'react';
import { MiddleTruncate } from '@re-dev/react-truncate';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleCheck, CircleX } from 'lucide-react';

import { cn } from '../lib/utils';
import { CopyButton } from './copy-button';

const displayFieldVariants = cva('', {
  variants: {
    variant: {
      neutral: 'bg-lilac',
      success: 'bg-mint',
      failure: 'bg-red',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

export interface DisplayFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof displayFieldVariants> {
  variant?: 'neutral' | 'success' | 'failure';
  prefix?: string;
  truncate?: true | false | 'middle';
  copy?: boolean;
  actions?: React.ReactNode;
}

function DisplayField({
  className,
  variant,
  children,
  prefix,
  truncate = false,
  copy = true,
  actions,
  ...props
}: DisplayFieldProps) {
  const getIcon = () => {
    if (variant === 'success') {
      return <CircleCheck className="w-4" />;
    }
    if (variant === 'failure') {
      return <CircleX className="w-4" />;
    }
    return null;
  };

  const renderContent = () => {
    if (truncate === 'middle' && typeof children === 'string') {
      return <MiddleTruncate end={8}>{children}</MiddleTruncate>;
    }
    return children;
  };

  const getTruncateClass = () => {
    if (truncate === 'middle') return '';
    if (truncate === true) return 'truncate';
    return 'overflow-x-scroll';
  };

  const getValueForCopy = () => {
    if (typeof children === 'string') {
      return children;
    }
    return '';
  };

  const showActions = copy || actions;

  return (
    <div className={cn('flex w-full items-center gap-2', className)} {...props}>
      <div
        className={cn(
          'border-border bg-black-5 text-foreground ring-offset-background ring-ring/70 h-9.5 flex w-full overflow-clip text-clip rounded-md border text-base focus-visible:ring-1 focus-visible:ring-offset-2 md:text-sm'
        )}
      >
        {prefix && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-br-md rounded-tr-md px-2 text-sm font-medium text-black transition-colors',
              displayFieldVariants({ variant: variant })
            )}
          >
            {getIcon()}
            {prefix}
          </div>
        )}
        <span
          className={cn('block w-full overflow-y-clip px-3 py-2 font-mono', getTruncateClass())}
        >
          {renderContent()}
        </span>
        {showActions && (
          <div className="flex items-center">
            {copy && <CopyButton value={getValueForCopy()} size="sm" />}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export { DisplayField, displayFieldVariants };
