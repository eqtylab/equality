import * as React from 'react';
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as LucideIcons from 'lucide-react';

import styles from '@/components/icon/icon.module.css';
import { cn } from '@/lib/utils';

const iconVariants = cva(styles['icon-container'], {
  variants: {
    size: {
      xs: styles['size--xs'],
      sm: styles['size--sm'],
      md: styles['size--md'],
      lg: styles['size--lg'],
    },
    background: {
      square: styles['background--square'],
      circle: styles['background--circle'],
      transparent: styles['background--transparent'],
    },
  },
  defaultVariants: {
    size: 'md',
    background: 'transparent',
  },
});

const isUrl = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/');
};

export interface IconProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof iconVariants> {
  icon: React.ReactElement | string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  background?: 'square' | 'circle' | 'transparent';
}

const Icon = forwardRef<HTMLDivElement, IconProps>(
  ({ className, size, background, icon, ...props }, ref) => {
    let renderedIcon;

    if (typeof icon === 'string') {
      if (isUrl(icon)) {
        // URL - render as an image
        renderedIcon = <img src={icon} alt={''} className={cn(styles['icon'], 'object-cover')} />;
      } else {
        // Lucide icon by string name
        const LucideIcon = LucideIcons[icon as keyof typeof LucideIcons] as React.ElementType;

        if (!LucideIcon) {
          throw new Error(`Icon "${icon}" not found in lucide-react`);
        }

        renderedIcon = <LucideIcon className={cn(styles['icon'])} />;
      }
    } else if (React.isValidElement(icon)) {
      // React element (e.g., <CustomIcon />) - clone to inject className
      const existingProps = icon.props as React.HTMLAttributes<HTMLElement> &
        Record<string, unknown>;

      renderedIcon = React.cloneElement(
        icon as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          ...existingProps,
          className: cn(styles['icon'], existingProps.className),
        } as React.HTMLAttributes<HTMLElement>
      );
    } else {
      throw new Error('Icon must be either a string (Lucide icon name) or a React element');
    }

    return (
      <div ref={ref} className={cn(iconVariants({ size, background }), className)} {...props}>
        {renderedIcon}
      </div>
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };
