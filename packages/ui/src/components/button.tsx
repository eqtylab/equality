import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const buttonVariants = cva(
  'ring-offset-background focus-visible:ring-ring focus-visible:outline-hidden inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'border-highlight/0 bg-highlight/50 text-foreground hover:not-disabled:border-highlight hover:not-disabled:bg-highlight/60 border',
        destructive:
          'border-red/0 bg-red/50 text-foreground hover:not-disabled:border-red hover:not-disabled:bg-red/60 border',
        secondary:
          'border-foreground bg-foreground text-background hover:not-disabled:border-primary hover:not-disabled:bg-primary/80 border',
        tertiary:
          'border-border text-foreground hover:not-disabled:text-accent-foreground hover:not-disabled:bg-white/10 border bg-black/60',
        outline:
          'border-border text-foreground hover:text-accent-foreground bg-black/60 hover:border hover:bg-white/10',
        link: 'text-lilac hover:not-disabled:underline underline-offset-4',
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

type ButtonBaseProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'>;
type AnchorBaseProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'prefix'>;

export type ButtonProps = VariantProps<typeof buttonVariants> &
  (
    | (ButtonBaseProps & {
        asChild?: boolean;
        href?: never;
        prefix?: React.ReactNode;
        suffix?: React.ReactNode;
      })
    | (AnchorBaseProps & {
        asChild?: never;
        href: string;
        prefix?: React.ReactNode;
        suffix?: React.ReactNode;
        target?: string;
        rel?: string;
        download?: string | boolean;
      })
  );

const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className, variant, size, asChild = false, prefix, suffix, children, ...props }, ref) => {
    const isLink = 'href' in props && props.href;

    if (isLink) {
      const { href, target, rel, download, ...anchorProps } = props as AnchorBaseProps & {
        href: string;
        target?: string;
        rel?: string;
        download?: string | boolean;
      };

      return (
        <a
          href={href}
          target={target}
          rel={rel}
          download={download}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...anchorProps}
        >
          {prefix}
          {children}
          {suffix}
        </a>
      );
    }

    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...(props as ButtonBaseProps)}
      >
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
