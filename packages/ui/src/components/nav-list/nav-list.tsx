import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { ChevronRight } from 'lucide-react';

import { NavDrillContext } from '@/components/nav-list/nav-drill-context';
import styles from '@/components/nav-list/nav-list.module.css';
import { cn } from '@/lib/utils';

const ListDepthContext = React.createContext(0);

interface NavListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Row height for every group inside: `sm` is one 4px step shorter */
  size?: 'md' | 'sm';
}

const NavList = React.forwardRef<HTMLDivElement, NavListProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <div ref={ref} data-size={size} className={cn(styles.root, className)} {...props} />
  )
);
NavList.displayName = 'NavList';

interface NavListGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the group's list; leave it out where a ‹ row already names what the rows belong to */
  label?: string;
}

const NavListGroup = React.forwardRef<HTMLDivElement, NavListGroupProps>(
  ({ label, className, children, ...props }, ref) => {
    const labelId = React.useId();
    const depth = React.useContext(ListDepthContext);

    return (
      <div
        ref={ref}
        className={cn(styles.group, !label && styles['group-unlabelled'], className)}
        {...props}
      >
        {label && (
          <div id={labelId} className={styles['group-label']}>
            {label}
          </div>
        )}
        <ul
          data-depth={depth}
          aria-labelledby={label ? labelId : undefined}
          className={styles.list}
        >
          <ListDepthContext.Provider value={depth + 1}>{children}</ListDepthContext.Provider>
        </ul>
      </div>
    );
  }
);
NavListGroup.displayName = 'NavListGroup';

interface NavListItemProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, 'prefix'>,
    Pick<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel' | 'download'> {
  /** The row's text, also its full title when it truncates */
  label: string;
  /** An icon before the label, on top-level rows only; hidden from screen readers */
  prefix?: React.ReactNode;
  /** Badges or marks after the label; screen readers read them as part of the row */
  suffix?: React.ReactNode;
  /** Marks the row as the page on show */
  current?: boolean;
  /** The `value` of the `NavDrillLevel` this row opens; adds the › caret */
  drill?: string;
  /** Renders the row as its only child, such as a router link */
  asChild?: boolean;
}

const NavListItem = React.forwardRef<HTMLElement, NavListItemProps>(
  (
    {
      label,
      prefix,
      suffix,
      current = false,
      drill,
      asChild = false,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const drillContext = React.useContext(NavDrillContext);
    const Comp: React.ElementType = asChild ? Slot : props.href ? 'a' : 'button';
    const leaving = drillContext?.leaving ?? false;

    // Runs after the child's own onClick (Slot calls the child first). defaultPrevented is not
    // checked: router links prevent the default before they navigate
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!drill || !drillContext) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      drillContext.requestDrill(drill);
    };

    return (
      <li>
        <Comp
          ref={ref}
          type={Comp === 'button' ? 'button' : undefined}
          data-slot="nav-list-item"
          data-drill={drill}
          aria-current={current && !leaving ? 'page' : undefined}
          data-current={current && leaving ? 'page' : undefined}
          className={cn(styles.item, className)}
          onClick={handleClick}
          {...props}
        >
          {prefix && (
            <span className={styles['item-prefix']} aria-hidden="true">
              {prefix}
            </span>
          )}
          <span className={styles['item-label']} title={label}>
            {label}
          </span>
          <Slottable>{children}</Slottable>
          {suffix && <span className={styles['item-suffix']}>{suffix}</span>}
          {drill && (
            <span className={styles['item-caret']} aria-hidden="true">
              <ChevronRight />
            </span>
          )}
        </Comp>
      </li>
    );
  }
);
NavListItem.displayName = 'NavListItem';

const NavListSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={cn(styles.separator, className)} {...props} />
);

export { NavList, NavListGroup, NavListItem, NavListSeparator };
export type { NavListGroupProps, NavListItemProps, NavListProps };
