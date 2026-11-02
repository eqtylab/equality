import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import styles from '@/components/banner/banner.module.css';
import { Icon } from '@/components/icon/icon';
import { cn } from '@/lib/utils';

const bannerVariants = cva(styles['banner'], {
  variants: {
    /** The status the strip's colour reports */
    variant: {
      primary: styles['banner--primary'],
      neutral: styles['banner--neutral'],
      success: styles['banner--success'],
      warning: styles['banner--warning'],
      danger: styles['banner--danger'],
    },
    /** The edge that draws the rule. `top` for a banner at the foot of a page header */
    border: {
      bottom: styles['banner--border-bottom'],
      top: styles['banner--border-top'],
    },
  },
  defaultVariants: {
    variant: 'neutral',
    border: 'bottom',
  },
});

interface BannerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof bannerVariants> {
  /** Lucide icon name or element, drawn in a round chip before the message */
  icon: React.ReactElement | string;
  /** Control after the message, on its line, such as a link button */
  action?: React.ReactNode;
  /** Element to render. `aside` makes the banner a landmark, for one that stands apart from the page it tops */
  as?: 'div' | 'aside';
  /** The message, a sentence */
  children: React.ReactNode;
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  (
    { className, variant, border, icon, action, as: Component = 'div', children, ...props },
    ref
  ) => (
    <Component ref={ref} className={cn(bannerVariants({ variant, border }), className)} {...props}>
      <div className={styles['banner-content']}>
        <div className={styles['banner-icon']}>
          <Icon icon={icon} size="sm" background="transparent" className={styles['banner-glyph']} />
        </div>
        <p className={styles['banner-message']}>{children}</p>
        {action ? <div className={styles['banner-action']}>{action}</div> : null}
      </div>
    </Component>
  )
);
Banner.displayName = 'Banner';

export { Banner };
