import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from '@/components/button/button.module.css';
import { cn } from '@/lib/utils';

const buttonVariants = cva(styles['button'], {
  variants: {
    variant: {
      primary: styles['button--primary'],
      danger: styles['button--danger'],
      secondary: styles['button--secondary'],
      tertiary: styles['button--tertiary'],
      link: styles['button--link'],
    },
    size: {
      sm: styles['size--sm'],
      md: styles['size--md'],
      lg: styles['size--lg'],
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

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
