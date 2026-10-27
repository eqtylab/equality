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

const NavRail = React.forwardRef<HTMLElement, NavRailProps>(
  ({ className, children, ...props }, ref) => (
    <nav ref={ref} className={cn(styles['nav-rail'], className)} {...props}>
      <div className={styles['nav-scroller']}>
        <TooltipProvider delayDuration={300}>
          <ul className={styles['nav-rail-list']}>{children}</ul>
        </TooltipProvider>
      </div>
    </nav>
  )
);
NavRail.displayName = 'NavRail';

interface NavRailItemBaseProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** The item's only visible content; hidden from screen readers */
  icon: React.ReactNode;
  /** The item's accessible name and its tooltip */
  label: string;
  /** Marks the item as the section on show */
  current?: boolean;
}

interface NavRailItemLinkProps extends NavRailItemBaseProps {
  /** Where the item goes */
  href: string;
  asChild?: false;
}

interface NavRailItemSlotProps extends NavRailItemBaseProps {
  href?: string;
  /** Renders the item as its only child, such as a router link */
  asChild: true;
}

type NavRailItemProps = NavRailItemLinkProps | NavRailItemSlotProps;

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
