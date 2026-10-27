import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';

import styles from '@/components/nav/nav.module.css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';

interface NavRailProps extends React.HTMLAttributes<HTMLElement> {
  /** Names the rail's landmark */
  'aria-label': string;
}

const NavRail = ({ className, children, ...props }: NavRailProps) => (
  <nav className={cn(styles['nav-rail'], className)} {...props}>
    <div className={styles['nav-scroller']}>
      <TooltipProvider delayDuration={300}>
        <ul className={styles['nav-rail-list']}>{children}</ul>
      </TooltipProvider>
    </div>
  </nav>
);

interface NavRailItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The item's only visible content; hidden from screen readers */
  icon: React.ReactNode;
  /** The item's accessible name and its tooltip */
  label: string;
  /** Marks the item as the section on show */
  current?: boolean;
  /** Renders the item as its only child, such as a router link */
  asChild?: boolean;
}

const NavRailItem = React.forwardRef<HTMLAnchorElement, NavRailItemProps>(
  ({ icon, label, current = false, asChild = false, className, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
      <li>
        <Tooltip>
          <TooltipTrigger asChild>
            <Comp
              ref={ref}
              aria-label={label}
              aria-current={current ? 'page' : undefined}
              className={cn(styles['nav-rail-item'], className)}
              {...props}
            >
              <span aria-hidden="true">{icon}</span>
              <Slottable>{children}</Slottable>
            </Comp>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </li>
    );
  }
);
NavRailItem.displayName = 'NavRailItem';

export { NavRail, NavRailItem };
export type { NavRailItemProps, NavRailProps };
