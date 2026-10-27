import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as LucideIcons from 'lucide-react';

import styles from '@/components/icon-button/icon-button.module.css';
import { cn } from '@/lib/utils';

const iconButtonVariants = cva(styles['icon-btn'], {
  variants: {
    size: {
      sm: styles['size--sm'],
      md: styles['size--md'],
      lg: styles['size--lg'],
    },
    variant: {
      primary: styles['icon-btn--primary'],
      danger: styles['icon-btn--danger'],
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'primary',
  },
});

const iconSizeMap = {
  sm: 16,
  md: 22,
  lg: 26,
};

export interface IconButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'name'>,
    VariantProps<typeof iconButtonVariants> {
  name: keyof typeof LucideIcons;
  label?: string;
  href?: string;
  target?: string;
  download?: string | boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(
  function IconButton(
    {
      className,
      size = 'sm',
      variant = 'primary',
      name,
      label,
      href,
      target,
      download,
      disabled,
      ...props
    },
    ref
  ) {
    const Icon = LucideIcons[name] as LucideIcons.LucideIcon;
    const iconSize = iconSizeMap[size || 'sm'];
    const IconComponent = Icon as React.ComponentType<{ size?: number }>;

    if (!Icon) {
      throw new Error(`Icon "${name}" not found in lucide-react`);
    }

    const content = <IconComponent size={iconSize} />;

    if (href && !disabled) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          download={download}
          aria-label={label}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className={cn(iconButtonVariants({ size, variant }), className)}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        aria-label={label}
        disabled={disabled}
        className={cn(iconButtonVariants({ size, variant }), className)}
        {...props}
      >
        {content}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton };
