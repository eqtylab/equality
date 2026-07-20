import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle, Search } from 'lucide-react';

import styles from '@/components/dropdown-menu/dropdown-menu.module.css';
import { cn, getThemeProviderRoot } from '@/lib/utils';

const CheckIcon = Check as React.ComponentType<{ className?: string }>;
const ChevronRightIcon = ChevronRight as React.ComponentType<{ className?: string }>;
const CircleIcon = Circle as React.ComponentType<{ className?: string }>;
const SearchIcon = Search as React.ComponentType<{ className?: string }>;

/*
 * Search context - Shared by Root, Content, the Item variants, DropdownMenuSearch
 * and DropdownMenuEmpty so the whole menu can behave as one searchable unit
 */

type DropdownMenuSearchContextValue = {
  /* True while a <DropdownMenuSearch /> is mounted in the tree */
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  /* True once the search input is actually shown */
  visible: boolean;
  /* Reveal the search input */
  reveal: (seed: string) => void;
  query: string;
  setQuery: (value: string) => void;
  /* Re-focus the search input from outside DropdownMenuSearch */
  focusSignal: number;
  requestFocus: () => void;
  /* Item registry, used for the optional empty state */
  registerItem: (id: string, matches: boolean) => void;
  unregisterItem: (id: string) => void;
  matchCount: number;
};

const DropdownMenuSearchContext = React.createContext<DropdownMenuSearchContextValue | null>(null);

const useDropdownMenuSearch = () => React.useContext(DropdownMenuSearchContext);

/* True when there is an active (non-empty) search query */
const useIsSearching = () => {
  const ctx = useDropdownMenuSearch();
  return !!ctx && ctx.query.trim().length > 0;
};

/* Pull plain text out of children so we can match against it */
function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return '';
}

/** Stable name used to identify DropdownMenuSubContent regardless of reference identity */
const SUB_CONTENT_NAME = 'DropdownMenuSubContent';

function isSubContent(
  node: React.ReactNode
): node is React.ReactElement<{ children?: React.ReactNode }> {
  return (
    React.isValidElement(node) &&
    typeof node.type !== 'string' && // skip host elements like <div>
    (node.type as { displayName?: string }).displayName === SUB_CONTENT_NAME
  );
}

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
 * Shared logic for every item variant: decide whether the item is visible for the current query
 * and register its match state (so DropdownMenuEmpty can know when nothing matched)
 */
function useFilterableItem(textValue: string | undefined, children: React.ReactNode): boolean {
  const ctx = useDropdownMenuSearch();
  const id = React.useId();
  const query = ctx?.query.trim().toLowerCase() ?? '';
  const visible = !query || (textValue ?? getNodeText(children)).toLowerCase().includes(query);

  React.useEffect(() => {
    if (!ctx || !ctx.enabled) return;
    ctx.registerItem(id, visible);
    return () => ctx.unregisterItem(id);
  }, [ctx, ctx?.enabled, id, visible]);

  return visible;
}

/*
 * Root component - manages the search context and the open state
 */
const DropdownMenu = ({
  children,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root>) => {
  const [enabled, setEnabled] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [query, setQuery] = React.useState('');

  // Bumped whenever something outside DropdownMenuSearch wants the input re-focused
  const [focusSignal, setFocusSignal] = React.useState(0);
  const requestFocus = React.useCallback(() => setFocusSignal((n) => n + 1), []);

  // Item registry for the empty state
  const itemsRef = React.useRef<Map<string, boolean>>(new Map());
  const [matchCount, setMatchCount] = React.useState(0);
  const recount = React.useCallback(() => {
    let count = 0;
    itemsRef.current.forEach((matches) => {
      if (matches) count += 1;
    });
    setMatchCount(count);
  }, []);
  const registerItem = React.useCallback(
    (id: string, matches: boolean) => {
      itemsRef.current.set(id, matches);
      recount();
    },
    [recount]
  );
  const unregisterItem = React.useCallback(
    (id: string) => {
      itemsRef.current.delete(id);
      recount();
    },
    [recount]
  );

  const reveal = React.useCallback((seed: string) => {
    setVisible(true);
    setQuery(seed);
  }, []);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      // Reset when opening to keep the filtered list intact while closing
      if (open) {
        setVisible(false);
        setQuery('');
      }
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const value = React.useMemo<DropdownMenuSearchContextValue>(
    () => ({
      enabled,
      setEnabled,
      visible,
      reveal,
      query,
      setQuery,
      focusSignal,
      requestFocus,
      registerItem,
      unregisterItem,
      matchCount,
    }),
    [
      enabled,
      visible,
      reveal,
      query,
      focusSignal,
      requestFocus,
      registerItem,
      unregisterItem,
      matchCount,
    ]
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
  <DropdownMenuPrimitive.Portal container={getThemeProviderRoot()}>
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
      <ChevronRightIcon className="ml-auto" />
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

  if (searching) {
    // Flatten: pull the SubContent's items inline so they participate in the filter
    // Recursive so it survives fragments / arrays / host-element wrapping
    return <>{findSubContentChildren(children)}</>;
  }

  return <DropdownMenuPrimitive.Sub {...props}>{children}</DropdownMenuPrimitive.Sub>;
};

/*
 * Content - intercepts the first printable key to reveal the search input
 */
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, onKeyDown, ...props }, ref) => {
  const ctx = useDropdownMenuSearch();

  return (
    <DropdownMenuPortal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(styles['dropdown-menu-content'], className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!ctx?.enabled || event.defaultPrevented) return;

          const isPrintable =
            event.key.length === 1 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.altKey &&
            /\S/.test(event.key);
          if (!isPrintable) return;

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
      />
    </DropdownMenuPortal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

/*
 * Search input - renders the search input and manages the search context
 */
const DropdownMenuSearch = ({
  className,
  placeholder = 'Search...',
  icon,
  /* Render the input immediately instead of revealing on first keypress */
  alwaysVisible = false,
  onKeyDown,
  /* Pulled out of props so the placeholder fallback below isn't overwritten by the spread */
  'aria-label': ariaLabel,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  icon?: React.ReactNode;
  alwaysVisible?: boolean;
}) => {
  const ctx = useDropdownMenuSearch();
  if (!ctx) {
    throw new Error('DropdownMenuSearch must be used within a DropdownMenu');
  }
  const { setEnabled, reveal, visible, focusSignal } = ctx;

  const inputRef = React.useRef<HTMLInputElement>(null);

  // Tell Content a search exists so it knows to intercept keystrokes
  React.useEffect(() => {
    setEnabled(true);
    return () => setEnabled(false);
  }, [setEnabled]);

  // Focus the input when it becomes visible AND whenever focus is requested from Content
  React.useEffect(() => {
    if (!visible) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
  }, [visible, focusSignal]);

  // If always visible, reveal as soon as the menu opens
  React.useEffect(() => {
    if (alwaysVisible && !visible) reveal('');
  }, [alwaysVisible, visible, reveal]);

  if (!alwaysVisible && !visible) return null;

  return (
    <div className={styles['dropdown-menu-search']}>
      {icon ?? <SearchIcon className={styles['icon-size']} />}
      <input
        ref={inputRef}
        data-dropdown-search=""
        className={cn(styles['dropdown-menu-search-input'], className)}
        value={ctx.query}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        onChange={(event) => ctx.setQuery(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event);

          // Arrow keys move focus into the list - Radix won't do this for us because focus
          // is on the input, not a menu item. Jump to the first/last currently-visible item
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            const menu = event.currentTarget.closest('[role="menu"]');
            const items = menu
              ? Array.from(
                  menu.querySelectorAll<HTMLElement>(
                    '[role="menuitem"]:not([data-disabled]),' +
                      '[role="menuitemcheckbox"]:not([data-disabled]),' +
                      '[role="menuitemradio"]:not([data-disabled])'
                  )
                )
              : [];
            if (items.length) {
              event.preventDefault();
              (event.key === 'ArrowDown' ? items[0] : items[items.length - 1]).focus();
            }
            return;
          }

          // Bubble events to Radix (close / select / tab out)
          if (['Enter', 'Escape', 'Tab'].includes(event.key)) return;

          // Everything else stays in the input so Radix typeahead / shortcuts don't fire
          event.stopPropagation();
        }}
        {...props}
      />
    </div>
  );
};
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

  const query = ctx.query.trim();
  const isEmpty = !!query && ctx.matchCount === 0;

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
 * Items - each variant hides itself when it doesn't match the active query
 */
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: 'neutral' | 'danger';
  }
>(({ className, inset, variant = 'neutral', textValue, children, ...props }, ref) => {
  const visible = useFilterableItem(textValue, children);
  if (!visible) return null;

  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      textValue={textValue}
      className={cn(
        styles['dropdown-menu-item'],
        inset && styles['dropdown-menu-inset'],
        variant === 'danger' && styles['dropdown-menu-item-danger'],
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, textValue, ...props }, ref) => {
  const visible = useFilterableItem(textValue, children);
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
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, textValue, ...props }, ref) => {
  const visible = useFilterableItem(textValue, children);
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
