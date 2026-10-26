import * as React from 'react';

import styles from '@/components/nav/nav.module.css';
import { cn } from '@/lib/utils';

interface NavPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Names the panel's landmark */
  'aria-label': string;
  /** The panel's name, as a heading screen readers can find */
  title?: string;
  /** Anything else above the rows, such as a `NavSwitcher` */
  header?: React.ReactNode;
}

// The sidebar's frame. A panel that drills puts a MenuDrill inside; the scroller is marked so the
// drill can reset it without importing this part
const NavPanel = React.forwardRef<HTMLElement, NavPanelProps>(
  ({ title, header, className, children, ...props }, ref) => (
    <nav ref={ref} className={cn(styles.panel, className)} {...props}>
      <div className={styles.scroller} data-menu-scroller="">
        {title && (
          <h2 className={styles['panel-header']} title={title}>
            {title}
          </h2>
        )}
        {header && <div className={styles['panel-header']}>{header}</div>}
        {children}
      </div>
    </nav>
  )
);
NavPanel.displayName = 'NavPanel';

export { NavPanel };
export type { NavPanelProps };
