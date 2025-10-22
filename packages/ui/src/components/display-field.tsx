import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const displayFieldVariants = cva(
  'inline-flex items-center gap-2 text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        neutral: 'bg-lilac',
        success: 'bg-green',
        failure: 'bg-red',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
);

export interface DisplayFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof displayFieldVariants> {
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
  return (
    <div
      className={cn(
        'border-border bg-background text-foreground ring-offset-background ring-ring/70 w-full rounded-md border px-3 py-2 text-base focus-visible:ring-1 focus-visible:ring-offset-2 md:text-sm',
        className
      )}
      {...props}
    >
      {prefix && <div className="bg-[#ff0000] text-white">{prefix}</div>}
      <span className={cn(truncate && 'truncate')}>{children}</span>
    </div>
  );
}

export { DisplayField, displayFieldVariants };
