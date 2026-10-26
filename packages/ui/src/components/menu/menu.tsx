import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { ChevronRight } from 'lucide-react';

import { MenuDrillContext } from '@/components/menu/menu-drill-context';
import styles from '@/components/menu/menu.module.css';
import { cn } from '@/lib/utils';

type MenuSize = 'md' | 'sm';

const ListDepthContext = React.createContext(0);
const GroupLabelContext = React.createContext<string | undefined>(undefined);

interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Row height for every list inside: `sm` is one 4px step shorter */
  size?: MenuSize;
}

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ size = 'md', className, ...props }, ref) => (
    <div ref={ref} data-size={size} className={cn(styles.menu, className)} {...props} />
  )
);
Menu.displayName = 'Menu';

interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the group's list; leave it out where a ‹ row already names what the rows belong to */
  label?: string;
}

const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(
  ({ label, className, children, ...props }, ref) => {
    const labelId = React.useId();

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
        <GroupLabelContext.Provider value={label ? labelId : undefined}>
          {children}
        </GroupLabelContext.Provider>
      </div>
    );
  }
);
MenuGroup.displayName = 'MenuGroup';

type MenuListProps = React.HTMLAttributes<HTMLUListElement>;

const MenuList = React.forwardRef<HTMLUListElement, MenuListProps>(
  ({ className, children, ...props }, ref) => {
    const depth = React.useContext(ListDepthContext);
    const labelId = React.useContext(GroupLabelContext);

    return (
      <ul
        ref={ref}
        data-depth={depth}
        aria-labelledby={labelId}
        className={cn(styles.list, className)}
        {...props}
      >
        <ListDepthContext.Provider value={depth + 1}>
          <GroupLabelContext.Provider value={undefined}>{children}</GroupLabelContext.Provider>
        </ListDepthContext.Provider>
      </ul>
    );
  }
);
MenuList.displayName = 'MenuList';

interface MenuItemProps
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
  /** The view of the `MenuDrill` level this row opens; adds the › caret */
  drill?: string;
  /** Renders the row as its only child, such as a router link */
  asChild?: boolean;
}

const MenuItem = React.forwardRef<HTMLElement, MenuItemProps>(
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
    const drillContext = React.useContext(MenuDrillContext);
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
          data-slot="menu-item"
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
MenuItem.displayName = 'MenuItem';

const MenuSeparator = ({ className, ...props }: React.HTMLAttributes<HTMLHRElement>) => (
  <hr className={cn(styles.separator, className)} {...props} />
);

export { Menu, MenuGroup, MenuItem, MenuList, MenuSeparator };
export type { MenuGroupProps, MenuItemProps, MenuListProps, MenuProps, MenuSize };
