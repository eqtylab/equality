import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  'ring-offset-background focus-visible:ring-ring focus-visible:outline-hidden inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'border-highlight/0 bg-highlight/50 text-foreground hover:border-highlight hover:bg-highlight/60 border',
        destructive: 'text-red hover:border-red hover:bg-red/10 border bg-black/60',
        outline:
          'border-border text-foreground hover:text-accent-foreground border bg-black/60 hover:bg-white/10',
        secondary:
          'border-foreground bg-foreground text-background hover:border-primary hover:bg-primary/80 border',
        tertiary:
          'border-background text-secondary-foreground hover:border-foreground/70 hover:bg-background/80 border bg-black/60',
        ghost: 'hover:bg-lilac-button',
        link: 'text-lilac underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-7 rounded-md px-2 text-xs',
        md: 'h-10 rounded-md px-3 py-2',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, prefix, suffix, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {prefix}
        {children}
        {suffix}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
