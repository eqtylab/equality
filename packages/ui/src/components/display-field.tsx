import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleCheck, CircleX } from 'lucide-react';

import { cn } from '../lib/utils';

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
  truncate?: boolean;
}

function DisplayField({
  className,
  variant,
  children,
  prefix,
  truncate = false,
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

  return (
    <div
      className={cn(
        'border-border bg-black-5 text-foreground ring-offset-background ring-ring/70 flex w-full overflow-clip text-clip rounded-md border text-base focus-visible:ring-1 focus-visible:ring-offset-2 md:text-sm',
        className
      )}
      {...props}
    >
      {prefix && (
        <div
          className={cn(
            'flex items-center gap-1 rounded-br-md rounded-tr-md px-2 text-sm font-medium text-black transition-colors',
            displayFieldVariants({ variant: variant }),
            className
          )}
        >
          {getIcon()}
          {prefix}
        </div>
      )}
      <span
        className={cn(
          'block w-full px-3 py-2 font-mono',
          truncate ? 'truncate' : 'overflow-scroll'
        )}
      >
        {children}
      </span>
    </div>
  );
}

export { DisplayField, displayFieldVariants };
