import * as React from 'react';

import styles from '@/components/nav/nav.module.css';
import { cn } from '@/lib/utils';

interface NavPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Names the panel's landmark */
  'aria-label': string;
  /** Above the rows, such as a `NavSwitcher` or a heading */
  header?: React.ReactNode;
}

// NavDrill finds this scroller by data-nav-scroller to reset it; renaming the attribute breaks that
// without an error
const NavPanel = React.forwardRef<HTMLElement, NavPanelProps>(
  ({ header, className, children, ...props }, ref) => (
    <nav ref={ref} className={cn(styles.panel, className)} {...props}>
      <div className={styles.scroller} data-nav-scroller="">
        {header && <div className={styles['panel-header']}>{header}</div>}
        {children}
      </div>
    </nav>
  )
);
NavPanel.displayName = 'NavPanel';

export { NavPanel };
export type { NavPanelProps };
