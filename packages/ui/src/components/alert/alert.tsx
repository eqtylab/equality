import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from '@/components/alert/alert.module.css';
import { Icon } from '@/components/icon/icon';
import { cn } from '@/lib/utils';

const alertVariants = cva(styles['alert'], {
  variants: {
    variant: {
      primary: styles['alert--primary'],
      neutral: styles['alert--neutral'],
      success: styles['alert--success'],
      warning: styles['alert--warning'],
      danger: styles['alert--danger'],
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

// Default icons for variants. Primary and neutral have no icon by default.
const defaultVariantIcons: Record<string, string> = {
  success: 'Check',
  warning: 'OctagonAlert',
  danger: 'TriangleAlert',
};

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  title: string;
  description?: string | React.ReactNode;
  icon?: React.ReactElement | string | null;
  /**
   * Body content, as an alternative to `description`. Rendered in a `div` rather
   * than a `p`, so block-level content (paragraphs, lists, code blocks) is valid.
   * Use this instead of `description` when the body is more than a sentence.
   */
  children?: React.ReactNode;
  /**
   * Element to render. Defaults to `div` with `role="alert"`, which is an
   * assertive live region -- correct for a message that appears in response to
   * something the user did, wrong for static page content. Use `aside` for a
   * standing callout; it drops the live region unless you set `role` yourself.
   */
  as?: 'div' | 'aside' | 'section';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    { className, variant, title, description, icon, children, as: Component = 'div', ...props },
    ref
  ) => {
    // Use the provided icon, otherwise fall back to the variant's default icon.
    // Passing `icon={null}` explicitly opts out of the default icon.
    const effectiveIcon =
      icon === undefined ? (variant ? defaultVariantIcons[variant] : undefined) : icon;

    // A live region only makes sense for the default `div` alert; a standing
    // aside/section announces itself on page load otherwise.
    const role = Component === 'div' ? 'alert' : undefined;

    return (
      <Component
        ref={ref}
        role={role}
        className={cn(
          alertVariants({ variant }),
          effectiveIcon ? styles['alert--with-icon'] : '',
          className
        )}
        {...props}
      >
        {effectiveIcon ? (
          <Icon
            icon={effectiveIcon}
            size="sm"
            background="transparent"
            className={styles['alert-icon']}
          />
        ) : null}
        <h4 className={styles['alert-title']}>{title}</h4>
        {description ? <p className={styles['alert-description']}>{description}</p> : null}
        {children ? <div className={styles['alert-body']}>{children}</div> : null}
      </Component>
    );
  }
);
Alert.displayName = 'Alert';

export { Alert };
