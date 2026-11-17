import * as React from 'react';

import styles from '@/components/nav/nav.module.css';
import { cn } from '@/lib/utils';

interface NavPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Names the panel's landmark */
  'aria-label': string;
  /** Above the rows: a heading, a `NavSwitcher`, or controls of your own with `bareHeader` */
  header?: React.ReactNode;
  /** Leaves the header unpadded and unclipped, for controls of your own, such as a site card */
  bareHeader?: boolean;
}

// NavDrill and @eqtylab/docs' Sidebar.astro find this scroller by data-nav-scroller; renaming the
// attribute breaks both without an error
const NavPanel = React.forwardRef<HTMLElement, NavPanelProps>(
  ({ header, bareHeader = false, className, children, ...props }, ref) => (
    <nav ref={ref} className={cn(styles['nav-panel'], className)} {...props}>
      <div className={styles['nav-scroller']} data-nav-scroller="">
        {header && (
          <div
            className={cn(styles['nav-panel-header'], !bareHeader && styles['nav-panel-heading'])}
          >
            {header}
          </div>
        )}
        {children}
      </div>
    </nav>
  )
);
NavPanel.displayName = 'NavPanel';

export { NavPanel };
export type { NavPanelProps };
