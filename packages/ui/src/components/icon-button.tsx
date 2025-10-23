import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as LucideIcons from 'lucide-react';

import { cn } from '../lib/utils';

const iconButtonVariants = cva(
  'focus-visible:ring-ring inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 32,
};

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'name'>,
    VariantProps<typeof iconButtonVariants> {
  name: keyof typeof LucideIcons;
  label: string;
  href?: string;
  target?: string;
  download?: string | boolean;
}

function IconButton({
  className,
  size = 'md',
  name,
  label,
  href,
  target,
  download,
  disabled,
  ...props
}: IconButtonProps) {
  const Icon = LucideIcons[name] as LucideIcons.LucideIcon;
  const iconSize = iconSizeMap[size || 'md'];

  if (!Icon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  const content = <Icon size={iconSize} />;

  if (href && !disabled) {
    return (
      <a
        href={href}
        target={target}
        download={download}
        aria-label={label}
        className={cn(iconButtonVariants({ size }), className)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={cn(iconButtonVariants({ size }), className)}
      {...props}
    >
      {content}
    </button>
  );
}

export { IconButton, iconButtonVariants };
