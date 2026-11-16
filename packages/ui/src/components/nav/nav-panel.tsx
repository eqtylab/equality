import * as React from 'react';

import styles from '@/components/nav/nav.module.css';
import { cn } from '@/lib/utils';

interface NavPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Names the panel's landmark */
  'aria-label': string;
  /** Above the rows: a `NavSwitcher`, a heading as a string, or controls of your own, left unstyled */
  header?: React.ReactNode;
}

// NavDrill finds this scroller by data-nav-scroller to reset it; renaming the attribute breaks that
// without an error
const NavPanel = React.forwardRef<HTMLElement, NavPanelProps>(
  ({ header, className, children, ...props }, ref) => (
    <nav ref={ref} className={cn(styles['nav-panel'], className)} {...props}>
      <div className={styles['nav-scroller']} data-nav-scroller="">
        {header && (
          <div
            className={cn(
              styles['nav-panel-header'],
              typeof header === 'string' && styles['nav-panel-heading']
            )}
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
