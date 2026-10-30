import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { ArrowUpRight, ChevronDown, ChevronRight } from 'lucide-react';

import { NavDrillContext } from '@/components/nav-list/nav-drill-context';
import styles from '@/components/nav-list/nav-list.module.css';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import { cn } from '@/lib/utils';

const ListDepthContext = React.createContext(0);

// `mount` also means a remount or Suspense reshow: it must never reopen a folder the reader closed
type RevealFolder = (reason: 'mount' | 'change') => void;
const RevealFolderContext = React.createContext<RevealFolder | null>(null);

type NavListProps = React.HTMLAttributes<HTMLDivElement>;

const NavList = React.forwardRef<HTMLDivElement, NavListProps>(({ className, ...props }, ref) => (
  <div ref={ref} data-slot="nav-list" className={cn(styles['nav-list'], className)} {...props} />
));
NavList.displayName = 'NavList';

interface NavListGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Names the group's list; leave it out where a ‹ row already names what the rows belong to */
  label?: string;
}

const NavListGroup = React.forwardRef<HTMLDivElement, NavListGroupProps>(
  ({ label, className, children, ...props }, ref) => {
    const labelId = React.useId();
    const depth = React.useContext(ListDepthContext);

    const group = (
      <div
        ref={ref}
        data-slot="nav-list-group"
        className={cn(
          styles['nav-list-group'],
          !label && styles['nav-list-group--unlabelled'],
          className
        )}
        {...props}
      >
        {label && (
          <div id={labelId} className={styles['nav-list-group-label']}>
            {label}
          </div>
        )}
        <ul
          data-depth={depth}
          aria-labelledby={label ? labelId : undefined}
          className={styles['nav-list-items']}
        >
          <ListDepthContext.Provider value={depth + 1}>{children}</ListDepthContext.Provider>
        </ul>
      </div>
    );

    // Inside another group's list, anything but an <li> is invalid HTML
    return depth > 0 ? <li>{group}</li> : group;
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
  /** A status or count after the label; screen readers read it as part of the row */
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
    const revealFolder = React.useContext(RevealFolderContext);
    const wasCurrent = React.useRef(current);
    const Comp: React.ElementType = asChild ? Slot : props.href ? 'a' : 'button';
    const leaving = drillContext?.leaving ?? false;
    const childTarget =
      asChild && React.isValidElement<{ target?: string }>(children)
        ? children.props.target
        : undefined;
    const newTab = (props.target ?? childTarget) === '_blank';

    // Runs after the child's own onClick (Slot calls the child first). defaultPrevented is not
    // checked: router links prevent the default before they navigate
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!drill || !drillContext) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return;
      drillContext.requestDrill(drill);
    };

    useIsomorphicLayoutEffect(() => {
      if (current) revealFolder?.(wasCurrent.current ? 'mount' : 'change');
      wasCurrent.current = current;
    }, [current, revealFolder]);

    return (
      <li>
        <Comp
          ref={ref}
          type={Comp === 'button' ? 'button' : undefined}
          data-slot="nav-list-item"
          data-drill={drill}
          aria-current={current && !leaving ? 'page' : undefined}
          data-current={current && leaving ? 'page' : undefined}
          className={cn(styles['nav-list-item'], className)}
          onClick={handleClick}
          rel={newTab ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {prefix && (
            <span className={styles['nav-list-item-prefix']} aria-hidden="true">
              {prefix}
            </span>
          )}
          <span className={styles['nav-list-item-label']} title={label}>
            {label}
          </span>
          <Slottable>{children}</Slottable>
          {suffix && <span className={styles['nav-list-item-suffix']}>{suffix}</span>}
          {newTab && (
            <>
              <span
                className={cn(styles['nav-list-item-caret'], styles['nav-list-item-muted'])}
                aria-hidden="true"
              >
                <ArrowUpRight />
              </span>
              <span className={styles['nav-list-item-new-tab']}> (opens in a new tab)</span>
            </>
          )}
          {drill && (
            <span
              className={cn(styles['nav-list-item-caret'], styles['nav-list-item-muted'])}
              aria-hidden="true"
            >
              <ChevronRight />
            </span>
          )}
        </Comp>
      </li>
    );
  }
);
NavListItem.displayName = 'NavListItem';

const NavListSeparator = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => {
    const nested = React.useContext(ListDepthContext) > 0;
    const Comp = (nested ? 'li' : 'hr') as React.ElementType;
    return (
      <Comp
        ref={ref}
        role={nested ? 'separator' : undefined}
        className={cn(styles['nav-list-separator'], className)}
        {...props}
      />
    );
  }
);
NavListSeparator.displayName = 'NavListSeparator';

interface NavListExpandableProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Opens the group; pair it with `onOpenChange` to control it */
  open?: boolean;
  /** Opens the group on first render, such as when it holds the page on show */
  defaultOpen?: boolean;
  /** Called with the new state when the trigger is pressed or the current page moves inside */
  onOpenChange?: (open: boolean) => void;
}

const NavListExpandable = React.forwardRef<HTMLLIElement, NavListExpandableProps>(
  ({ open, defaultOpen = false, onOpenChange, className, ...props }, ref) => {
    const revealParent = React.useContext(RevealFolderContext);
    const [ownOpen, setOwnOpen] = React.useState(defaultOpen);
    const [instant, setInstant] = React.useState(false);
    const isOpen = open ?? ownOpen;
    const mounting = React.useRef(true);
    const closedByReader = React.useRef(false);
    const askedToOpen = React.useRef(false);

    const handleOpenChange = (next: boolean) => {
      closedByReader.current = !next;
      if (open === undefined) setOwnOpen(next);
      onOpenChange?.(next);
    };

    // Rows reveal from layout effects that run before this one, so `latest` is a render behind
    const latest = React.useRef({ isOpen, handleOpenChange, revealParent });
    useIsomorphicLayoutEffect(() => {
      latest.current = { isOpen, handleOpenChange, revealParent };
      if (isOpen) askedToOpen.current = false;
    });

    // Radix measures the content before the open lands, so without `data-instant` a folder
    // opening as it mounts animates in on load
    React.useEffect(() => {
      const frame = requestAnimationFrame(() => {
        mounting.current = false;
      });
      return () => cancelAnimationFrame(frame);
    }, []);

    React.useEffect(() => {
      if (!instant) return;
      const frame = requestAnimationFrame(() => setInstant(false));
      return () => cancelAnimationFrame(frame);
    }, [instant]);

    // A new identity would rerun every row's reveal effect
    const reveal = React.useCallback<RevealFolder>((reason) => {
      const folder = latest.current;
      folder.revealParent?.(reason);
      if (folder.isOpen) return;
      if (reason === 'mount' && (closedByReader.current || askedToOpen.current)) return;
      askedToOpen.current = true;
      if (mounting.current) setInstant(true);
      folder.handleOpenChange(true);
    }, []);

    return (
      <RevealFolderContext.Provider value={reveal}>
        <CollapsiblePrimitive.Root asChild open={isOpen} onOpenChange={handleOpenChange}>
          <li
            ref={ref}
            data-instant={instant ? '' : undefined}
            className={cn(styles['nav-list-expandable'], className)}
            {...props}
          />
        </CollapsiblePrimitive.Root>
      </RevealFolderContext.Provider>
    );
  }
);
NavListExpandable.displayName = 'NavListExpandable';

interface NavListExpandableTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'prefix'
> {
  /** The group's name, also its full title when it truncates */
  label: string;
  /** An icon before the label, on top-level groups only; hidden from screen readers */
  prefix?: React.ReactNode;
  /** A status or count after the label; screen readers read it as part of the row */
  suffix?: React.ReactNode;
}

const NavListExpandableTrigger = React.forwardRef<HTMLButtonElement, NavListExpandableTriggerProps>(
  ({ label, prefix, suffix, className, ...props }, ref) => (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      data-slot="nav-list-expandable-trigger"
      className={cn(styles['nav-list-item'], styles['nav-list-expandable-trigger'], className)}
      {...props}
    >
      {prefix && (
        <span className={styles['nav-list-item-prefix']} aria-hidden="true">
          {prefix}
        </span>
      )}
      <span className={styles['nav-list-item-label']} title={label}>
        {label}
      </span>
      {suffix && <span className={styles['nav-list-item-suffix']}>{suffix}</span>}
      <span
        className={cn(styles['nav-list-expandable-chevron'], styles['nav-list-item-muted'])}
        aria-hidden="true"
      >
        <ChevronDown />
      </span>
    </CollapsiblePrimitive.Trigger>
  )
);
NavListExpandableTrigger.displayName = 'NavListExpandableTrigger';

// forceMount keeps closed groups' links in the server HTML. With it, Radix never sets `hidden`,
// so the CSS hides a closed group from its parent's data-state
const NavListExpandableContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, children, ...props }, ref) => {
  const depth = React.useContext(ListDepthContext);
  return (
    <div className={styles['nav-list-expandable-panel']}>
      <CollapsiblePrimitive.Content forceMount className={styles['nav-list-expandable-content']}>
        <ul
          ref={ref}
          data-depth={depth}
          className={cn(styles['nav-list-items'], styles['nav-list-expandable-items'], className)}
          {...props}
        >
          <ListDepthContext.Provider value={depth + 1}>{children}</ListDepthContext.Provider>
        </ul>
      </CollapsiblePrimitive.Content>
    </div>
  );
});
NavListExpandableContent.displayName = 'NavListExpandableContent';

export {
  NavList,
  NavListExpandable,
  NavListExpandableContent,
  NavListExpandableTrigger,
  NavListGroup,
  NavListItem,
  NavListSeparator,
};
export type {
  NavListExpandableProps,
  NavListExpandableTriggerProps,
  NavListGroupProps,
  NavListItemProps,
  NavListProps,
};
