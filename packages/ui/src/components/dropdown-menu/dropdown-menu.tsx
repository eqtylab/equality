import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle, Search } from 'lucide-react';

import styles from '@/components/dropdown-menu/dropdown-menu.module.css';
import {
  assignRefs,
  formatResultCount,
  getNodeText,
  isPrintableKey,
  isSearchActive,
  isSearchEmpty,
  useFilterableItem,
  useListSearchState,
  useSearchInput,
  type ListSearchState,
} from '@/lib/list-search';
import { cn } from '@/lib/utils';
import { usePortalContainer } from '@/theme/portal-container';

const CheckIcon = Check as React.ComponentType<{ className?: string }>;
const ChevronRightIcon = ChevronRight as React.ComponentType<{ className?: string }>;
const CircleIcon = Circle as React.ComponentType<{ className?: string }>;
const SearchIcon = Search as React.ComponentType<{ className?: string }>;

/*
 * Search context - Shared by Root, Content, the Item variants, DropdownMenuSearch
 * and DropdownMenuEmpty so the whole menu can behave as one searchable unit
 */

type DropdownMenuSearchContextValue = ListSearchState & {
  /* The Radix menu's id (read off the DOM), so the search input can aria-controls the list */
  listId: string | undefined;
  setListId: (id: string | undefined) => void;
};

const DropdownMenuSearchContext = React.createContext<DropdownMenuSearchContextValue | null>(null);

const useDropdownMenuSearch = () => React.useContext(DropdownMenuSearchContext);

const useIsSearching = () => isSearchActive(useDropdownMenuSearch());

/*
 * Ancestry of SubTrigger contents for the current branch, used to render the "Parent >"
 * breadcrumb on flattened submenu items while searching. Separate from the search context
 * (which is a single Root-level instance) because ancestry is per-branch and stacks as the
 * tree nests. Default [] so items outside any flattened submenu render no breadcrumb.
 */
const DropdownMenuBreadcrumbContext = React.createContext<string[]>([]);

const useBreadcrumbAncestry = () => React.useContext(DropdownMenuBreadcrumbContext);

/** Stable names used to identify sub components regardless of reference identity */
const SUB_CONTENT_NAME = 'DropdownMenuSubContent';
const SUB_TRIGGER_NAME = 'DropdownMenuSubTrigger';

/* Match an element by its component displayName, skipping host elements like <div> */
function hasDisplayName(
  node: React.ReactNode,
  name: string
): node is React.ReactElement<{ children?: React.ReactNode }> {
  return (
    React.isValidElement(node) &&
    typeof node.type !== 'string' &&
    (node.type as { displayName?: string }).displayName === name
  );
}

const isSubContent = (
  node: React.ReactNode
): node is React.ReactElement<{ children?: React.ReactNode }> =>
  hasDisplayName(node, SUB_CONTENT_NAME);

const isSubTrigger = (
  node: React.ReactNode
): node is React.ReactElement<{ children?: React.ReactNode }> =>
  hasDisplayName(node, SUB_TRIGGER_NAME);

/*
 * Find the first DropdownMenuSubContent's children, descending recursively
 * through fragments, arrays and host elements
 */
function findSubContentChildren(nodes: React.ReactNode): React.ReactNode {
  let result: React.ReactNode = null;
  let done = false;

  const walk = (ns: React.ReactNode) => {
    React.Children.forEach(ns, (child) => {
      if (done || !React.isValidElement(child)) return;
      if (isSubContent(child)) {
        result = child.props.children ?? null;
        done = true;
        return;
      }
      const nested = (child.props as { children?: React.ReactNode }).children;
      if (nested != null) walk(nested);
    });
  };

  walk(nodes);
  return result;
}

/*
 * Grab the SubTrigger's label text for the breadcrumb. getNodeText drops any leading icon,
 * so the breadcrumb stays text-only. Shallow on purpose: Radix requires SubTrigger to be a
 * direct child of Sub, and recursing could pick up a nested submenu's trigger instead.
 */
function getSubTriggerLabel(nodes: React.ReactNode): string {
  const trigger = React.Children.toArray(nodes).find(isSubTrigger);
  return trigger ? getNodeText(trigger.props.children) : '';
}

/*
 * Root component - manages the search context and the open state
 */
const DropdownMenu = ({
  children,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) => {
  const search = useListSearchState();
  const { resetForOpen } = search;

  // Radix owns the menu's id; Content mirrors it here so the search input can point
  // aria-controls at the list it filters
  const [listId, setListId] = React.useState<string | undefined>(undefined);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) resetForOpen();
      onOpenChange?.(open);
    },
    [onOpenChange, resetForOpen]
  );

  const value = React.useMemo<DropdownMenuSearchContextValue>(
    () => ({ ...search, listId, setListId }),
    [search, listId]
  );

  return (
    <DropdownMenuSearchContext.Provider value={value}>
      <DropdownMenuPrimitive.Root onOpenChange={handleOpenChange} {...props}>
        {children}
      </DropdownMenuPrimitive.Root>
    </DropdownMenuSearchContext.Provider>
  );
};

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => (
  <DropdownMenuPrimitive.Portal container={usePortalContainer()}>
    {children}
  </DropdownMenuPrimitive.Portal>
);

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

/*
 * SubTrigger - hidden while searching (its items are flattened up into the main list)
 */
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => {
  const searching = useIsSearching();
  if (searching) return null;

  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        styles['dropdown-menu-trigger'],
        inset && styles['dropdown-menu-inset'],
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className={styles['dropdown-menu-subtrigger-chevron']} />
    </DropdownMenuPrimitive.SubTrigger>
  );
});
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(styles['dropdown-menu-sub-content'], className)}
    {...props}
  />
));
DropdownMenuSubContent.displayName = SUB_CONTENT_NAME;

const DropdownMenuSub = ({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Sub>) => {
  const searching = useIsSearching();
  const parentAncestry = useBreadcrumbAncestry();

  if (searching) {
    // Flatten: pull the SubContent's items inline so they participate in the filter
    // (recursive so it survives fragments / arrays / host-element wrapping), and push this
    // sub's label onto the ancestry so the flattened items can show a "Parent >" prefix.
    // Nested subs in the flattened output re-read this context and append their own crumb.
    const label = getSubTriggerLabel(children);
    const ancestry = label ? [...parentAncestry, label] : parentAncestry;
    return (
      <DropdownMenuBreadcrumbContext.Provider value={ancestry}>
        {findSubContentChildren(children)}
      </DropdownMenuBreadcrumbContext.Provider>
    );
  }

  return <DropdownMenuPrimitive.Sub {...props}>{children}</DropdownMenuPrimitive.Sub>;
};

/** Shared selector for the menu items search/keyboard nav jump between */
const MENU_ITEM_SELECTOR =
  '[role="menuitem"]:not([data-disabled]),' +
  '[role="menuitemcheckbox"]:not([data-disabled]),' +
  '[role="menuitemradio"]:not([data-disabled])';

/*
 * Content - intercepts the first printable key to reveal the search input, and sends
 * ArrowUp back to the search input when it's pressed on the first item
 */
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, onKeyDown, children, ...props }, ref) => {
  const ctx = useDropdownMenuSearch();
  const setListId = ctx?.setListId;
  const searching = !!ctx && ctx.query.trim().length > 0;
  const resultCount = ctx?.matchCount ?? 0;

  // Stable ref so React attaches once (mount) / detaches once (unmount) rather than
  // flip-flopping setListId every render, which a fresh inline callback would trigger
  const composedContentRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      assignRefs(node, ref);
      // Read Radix's generated id rather than override it (the trigger's aria-controls
      // depends on it); the search input then points aria-controls at the same list
      setListId?.(node?.id || undefined);
    },
    [ref, setListId]
  );

  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        ref={composedContentRef}
        sideOffset={sideOffset}
        className={cn(styles['dropdown-menu-content'], className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!ctx?.enabled) return;

          // ArrowUp on the first item sends focus back to the search input instead of doing
          // nothing (the roving focus group doesn't loop). Handled ahead of the
          // defaultPrevented bail-out below because that group already calls preventDefault()
          // on ArrowUp - for its own empty, non-looping candidate search - before the event
          // bubbles up to us. Tab is deliberately left to Radix's standard menu handling.
          if (event.key === 'ArrowUp' && ctx.visible) {
            const itemTarget = (event.target as HTMLElement | null)?.closest<HTMLElement>(
              MENU_ITEM_SELECTOR
            );
            const items = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR)
            );
            if (itemTarget && items[0] === itemTarget) {
              event.preventDefault();
              ctx.requestFocus();
              return;
            }
          }

          if (event.defaultPrevented) return;

          if (!isPrintableKey(event)) return;

          // If the search input already has focus, let it type normally
          const target = event.target as HTMLElement | null;
          if (target?.closest?.('[data-dropdown-search]')) return;

          // preventDefault() stops Radix's built-in typeahead from also handling this key
          event.preventDefault();
          if (!ctx.visible) {
            // First keystroke: reveal and seed the search input
            ctx.reveal(event.key);
          } else {
            // Bring focus back to the input
            ctx.setQuery(ctx.query + event.key);
            ctx.requestFocus();
          }
        }}
        {...props}
      >
        {/* Polite live region announcing how many items match as the query narrows.
            It stays mounted while the menu is open so the update isn't missed; the
            zero-match case is left to DropdownMenuEmpty so the two don't double-speak. */}
        {ctx?.enabled ? (
          <div className={styles['dropdown-menu-sr-status']} role="status" aria-live="polite">
            {searching && resultCount > 0 ? formatResultCount(resultCount) : null}
          </div>
        ) : null}
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPortal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

type DropdownMenuSearchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  icon?: React.ReactNode;
  alwaysVisible?: boolean;
};

/*
 * Search input - renders the search input and manages the search context
 */
const DropdownMenuSearch = React.forwardRef<HTMLInputElement, DropdownMenuSearchProps>(
  (
    {
      className,
      placeholder = 'Search...',
      icon,
      /* Render the input immediately instead of revealing on first keypress */
      alwaysVisible = false,
      onKeyDown,
      /* Pulled out of props so the placeholder fallback below isn't overwritten by the spread */
      'aria-label': ariaLabel,
      ...props
    },
    forwardedRef
  ) => {
    const ctx = useDropdownMenuSearch();
    if (!ctx) {
      throw new Error('DropdownMenuSearch must be used within a DropdownMenu');
    }
    const { inputRef, isRendered } = useSearchInput(ctx, alwaysVisible);

    if (!isRendered) return null;

    return (
      <div className={styles['dropdown-menu-search']}>
        <span aria-hidden="true" className={styles['dropdown-menu-item-icon']}>
          {icon ?? <SearchIcon className={styles['icon-size']} />}
        </span>
        <input
          /* Keep the internal ref - focus management depends on it - and mirror the node
             onto whatever the consumer passed */
          ref={(node) => {
            assignRefs(node, inputRef, forwardedRef);
          }}
          data-dropdown-search=""
          className={cn(styles['dropdown-menu-search-input'], className)}
          value={ctx.query}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder}
          /* The list uses menu/menuitem semantics, so this is a searchbox controlling the
             menu - not a combobox, which would imply a listbox of options that doesn't
             exist here. Match counts are surfaced by the live region in DropdownMenuContent. */
          role="searchbox"
          aria-controls={ctx.listId}
          aria-autocomplete="list"
          onChange={(event) => ctx.setQuery(event.target.value)}
          onKeyDown={(event) => {
            onKeyDown?.(event);

            // Arrow keys move focus into the list - Radix won't do this for us because focus
            // is on the input, not a menu item. Jump to the first/last currently-visible item.
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              const menu = event.currentTarget.closest('[role="menu"]');
              const items = menu
                ? Array.from(menu.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR))
                : [];
              if (items.length) {
                event.preventDefault();
                (event.key === 'ArrowUp' ? items[items.length - 1] : items[0]).focus();
              }
              return;
            }

            // Bubble events to Radix for its standard menu handling (close / select / Tab)
            if (['Enter', 'Escape', 'Tab'].includes(event.key)) return;

            // Everything else stays in the input so Radix typeahead / shortcuts don't fire
            event.stopPropagation();
          }}
          {...props}
        />
      </div>
    );
  }
);
DropdownMenuSearch.displayName = 'DropdownMenuSearch';

/*
 * Empty search state - shows its message only when a query doesn't match any items
 *
 * The wrapper stays mounted (empty, unstyled, zero height) so screen readers have
 * the live region in the tree before the message arrives - a region inserted with
 * its text already in place is frequently missed
 */
const DropdownMenuEmpty = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const ctx = useDropdownMenuSearch();
  if (!ctx) return null;

  const isEmpty = isSearchEmpty(ctx);

  return (
    <div
      role="status"
      aria-live="polite"
      className={isEmpty ? cn(styles['dropdown-menu-empty'], className) : undefined}
      {...props}
    >
      {isEmpty ? children : null}
    </div>
  );
};
DropdownMenuEmpty.displayName = 'DropdownMenuEmpty';

/*
 * Breadcrumb prefix for flattened submenu items while searching - shows the ancestor
 * submenu path ("Parent > Child") de-emphasized. aria-hidden so the item's accessible
 * name stays just its own label; the ancestry is purely visual context. Renders nothing
 * for items that aren't inside a flattened submenu (empty ancestry).
 */
const ItemBreadcrumb = () => {
  const ancestry = useBreadcrumbAncestry();
  if (!ancestry.length) return null;

  return (
    <span className={styles['dropdown-menu-breadcrumb']} aria-hidden="true">
      {ancestry.map((crumb, index) => (
        <React.Fragment key={index}>
          {crumb}
          <ChevronRightIcon />
        </React.Fragment>
      ))}
    </span>
  );
};

/*
 * Items - each variant hides itself when it doesn't match the active query
 */
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: 'neutral' | 'warning' | 'danger';
  }
>(({ className, inset, variant = 'neutral', textValue, children, ...props }, ref) => {
  const visible = useFilterableItem(useDropdownMenuSearch(), textValue, children);
  if (!visible) return null;

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      textValue={textValue}
      className={cn(
        styles['dropdown-menu-item'],
        inset && styles['dropdown-menu-inset'],
        variant === 'warning' && styles['dropdown-menu-item-warning'],
        variant === 'danger' && styles['dropdown-menu-item-danger'],
        className
      )}
      {...props}
    >
      <ItemBreadcrumb />
      {children}
    </DropdownMenuPrimitive.Item>
  );
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, textValue, ...props }, ref) => {
  const visible = useFilterableItem(useDropdownMenuSearch(), textValue, children);
  if (!visible) return null;

  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      textValue={textValue}
      className={cn(styles['dropdown-menu-checkbox-item'], className)}
      checked={checked}
      {...props}
    >
      <span className={styles['dropdown-menu-item-indicator-checkbox']}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className={styles['icon-size']} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      <ItemBreadcrumb />
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, textValue, ...props }, ref) => {
  const visible = useFilterableItem(useDropdownMenuSearch(), textValue, children);
  if (!visible) return null;

  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      textValue={textValue}
      className={cn(styles['dropdown-menu-radio-item'], className)}
      {...props}
    >
      <span className={styles['dropdown-menu-item-indicator-radio']}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className={styles['radio-icon']} />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      <ItemBreadcrumb />
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

/*
 * Label - hidden while searching
 */
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => {
  const searching = useIsSearching();
  if (searching) return null;

  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        styles['dropdown-menu-label'],
        inset && styles['dropdown-menu-inset'],
        className
      )}
      {...props}
    />
  );
});
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

/*
 * Separator - hidden while searching
 */
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const searching = useIsSearching();
  if (searching) return null;

  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn(styles['dropdown-menu-separator'], className)}
      {...props}
    />
  );
});
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn(styles['dropdown-menu-shortcut'], className)} {...props} />;
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSearch,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
