import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { VariantProps } from 'class-variance-authority';
import { Check, ChevronDown, ChevronUp, Search } from 'lucide-react';

import styles from '@/components/select/select.module.css';
import { ELEVATION, generateElevationVariants } from '@/lib/elevations';
import {
  assignRefs,
  formatResultCount,
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
const ChevronDownIcon = ChevronDown as React.ComponentType<{ className?: string }>;
const ChevronUpIcon = ChevronUp as React.ComponentType<{ className?: string }>;
const SearchIcon = Search as React.ComponentType<{ className?: string }>;

const SEARCH_INPUT_SELECTOR = '[data-select-search]';
const NAVIGABLE_OPTION_SELECTOR = '[role="option"]:not([data-disabled]):not([hidden])';
// Radix owns these: arrows move into the options, Escape closes, Tab is trapped
const RADIX_HANDLED_SEARCH_KEYS = ['ArrowDown', 'ArrowUp', 'Escape', 'Tab'];

type SelectSearchContextValue = ListSearchState & {
  listId: string | undefined;
  setListId: (id: string | undefined) => void;
  markInteracted: () => void;
  hasInteracted: () => boolean;
};

const SelectSearchContext = React.createContext<SelectSearchContextValue | null>(null);

const useSelectSearch = () => React.useContext(SelectSearchContext);

const useIsSearching = () => isSearchActive(useSelectSearch());

const Select = ({
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>) => {
  const search = useListSearchState();
  const { resetForOpen } = search;
  const [listId, setListId] = React.useState<string | undefined>(undefined);
  const hasInteractedRef = React.useRef(false);
  const markInteracted = React.useCallback(() => {
    hasInteractedRef.current = true;
  }, []);
  const hasInteracted = React.useCallback(() => hasInteractedRef.current, []);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        resetForOpen();
        hasInteractedRef.current = false;
      }
      onOpenChange?.(open);
    },
    [onOpenChange, resetForOpen]
  );

  const value = React.useMemo<SelectSearchContextValue>(
    () => ({ ...search, listId, setListId, markInteracted, hasInteracted }),
    [search, listId, markInteracted, hasInteracted]
  );

  return (
    <SelectSearchContext.Provider value={value}>
      <SelectPrimitive.Root onOpenChange={handleOpenChange} {...props} />
    </SelectSearchContext.Provider>
  );
};

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref} className={cn(styles['select-trigger'], className)} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className={cn(styles['select-icon'], styles['select-icon--low-opacity'])} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(styles['select-scroll-button'], className)}
    {...props}
  >
    <ChevronUpIcon className={styles['select-icon']} />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(styles['select-scroll-button'], className)}
    {...props}
  >
    <ChevronDownIcon className={styles['select-icon']} />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectPortal = ({ children }: { children: React.ReactNode }) => (
  <SelectPrimitive.Portal container={usePortalContainer()}>{children}</SelectPrimitive.Portal>
);

const selectContentElevationVariants = generateElevationVariants(
  styles,
  'select-content',
  ELEVATION.OVERLAY
);

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> &
    VariantProps<typeof selectContentElevationVariants>
>(
  (
    {
      className,
      children,
      position = 'popper',
      elevation = ELEVATION.OVERLAY,
      onKeyDown,
      onKeyDownCapture,
      onPointerMoveCapture,
      onFocus,
      ...props
    },
    ref
  ) => {
    const ctx = useSelectSearch();
    const setListId = ctx?.setListId;
    const searching = isSearchActive(ctx);
    const resultCount = ctx?.matchCount ?? 0;

    // Stable so React attaches once rather than re-running setListId every render
    const composedContentRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        assignRefs(node, ref);
        setListId?.(node?.id || undefined);
      },
      [ref, setListId]
    );

    const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);
      if (!ctx?.enabled || !ctx.visible || ctx.hasInteracted()) return;
      if ((event.target as HTMLElement).closest(SEARCH_INPUT_SELECTOR)) return;
      // Radix focuses the selected option once positioned, which would strand the search input
      ctx.requestFocus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (!ctx?.enabled) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest(SEARCH_INPUT_SELECTOR)) return;

      // Radix stops at the first option on ArrowUp, so hand focus back to the search input
      if (event.key === 'ArrowUp' && ctx.visible) {
        const [firstOption] = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(NAVIGABLE_OPTION_SELECTOR)
        );
        if (firstOption && firstOption === target?.closest(NAVIGABLE_OPTION_SELECTOR)) {
          event.preventDefault();
          ctx.requestFocus();
          return;
        }
      }

      if (event.defaultPrevented) return;

      if (event.key === 'Backspace' && ctx.visible && ctx.query) {
        event.preventDefault();
        ctx.setQuery(ctx.query.slice(0, -1));
        ctx.requestFocus();
        return;
      }

      if (!isPrintableKey(event)) return;

      // preventDefault stops Radix's typeahead from also consuming the key
      event.preventDefault();
      if (!ctx.visible) {
        ctx.reveal(event.key);
      } else {
        ctx.setQuery(ctx.query + event.key);
        ctx.requestFocus();
      }
    };

    return (
      <SelectPortal>
        <SelectPrimitive.Content
          ref={composedContentRef}
          className={cn(
            styles['select-content'],
            position === 'popper' && styles['select-content--popper'],
            selectContentElevationVariants({ elevation }),
            className
          )}
          position={position}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onKeyDownCapture={(event) => {
            onKeyDownCapture?.(event);
            ctx?.markInteracted();
          }}
          // Capture phase: an option focuses itself on pointermove before the event bubbles
          onPointerMoveCapture={(event) => {
            onPointerMoveCapture?.(event);
            ctx?.markInteracted();
          }}
          {...props}
        >
          {/* Stays mounted while open so count updates are announced; zero is SelectEmpty's */}
          {ctx?.enabled ? (
            <div className={styles['select-sr-status']} role="status" aria-live="polite">
              {searching && resultCount > 0 ? formatResultCount(resultCount) : null}
            </div>
          ) : null}
          <SelectScrollUpButton />
          <SelectPrimitive.Viewport
            className={cn(
              styles['select-viewport'],
              position === 'popper' && styles['select-viewport--popper']
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPortal>
    );
  }
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

type SelectSearchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  icon?: React.ReactNode;
  alwaysVisible?: boolean;
};

const SelectSearch = React.forwardRef<HTMLInputElement, SelectSearchProps>(
  (
    {
      className,
      placeholder = 'Search...',
      icon,
      alwaysVisible = false,
      onKeyDown,
      'aria-label': ariaLabel,
      ...props
    },
    forwardedRef
  ) => {
    const ctx = useSelectSearch();
    if (!ctx) {
      throw new Error('SelectSearch must be used within a Select');
    }
    const { inputRef, isRendered } = useSearchInput(ctx, alwaysVisible);

    if (!isRendered) return null;

    return (
      <div className={styles['select-search']}>
        <span aria-hidden="true" className={styles['select-search-icon']}>
          {icon ?? <SearchIcon className={styles['select-search-icon-size']} />}
        </span>
        <input
          ref={(node) => {
            assignRefs(node, inputRef, forwardedRef);
          }}
          data-select-search=""
          className={cn(styles['select-search-input'], className)}
          value={ctx.query}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder}
          // Focus moves onto the options themselves, so this is a searchbox, not a combobox
          role="searchbox"
          aria-controls={ctx.listId}
          aria-autocomplete="list"
          onChange={(event) => ctx.setQuery(event.target.value)}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            // Anything else reaching Radix would trigger typeahead or select an option
            if (!RADIX_HANDLED_SEARCH_KEYS.includes(event.key)) event.stopPropagation();
          }}
          {...props}
        />
      </div>
    );
  }
);
SelectSearch.displayName = 'SelectSearch';

/* The wrapper stays mounted so screen readers already hold the live region */
const SelectEmpty = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  const ctx = useSelectSearch();
  if (!ctx) return null;

  const isEmpty = isSearchEmpty(ctx);

  return (
    <div
      role="status"
      aria-live="polite"
      className={isEmpty ? cn(styles['select-empty'], className) : undefined}
      {...props}
    >
      {isEmpty ? children : null}
    </div>
  );
};
SelectEmpty.displayName = 'SelectEmpty';

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => {
  const searching = useIsSearching();
  if (searching) return null;

  return (
    <SelectPrimitive.Label ref={ref} className={cn(styles['select-label'], className)} {...props} />
  );
});
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, textValue, ...props }, ref) => {
  const matches = useFilterableItem(useSelectSearch(), textValue, children);

  return (
    <SelectPrimitive.Item
      ref={ref}
      textValue={textValue}
      // Hidden, never unmounted: Radix renders the trigger's value from the selected item
      hidden={!matches || undefined}
      className={cn(styles['select-item'], className)}
      {...props}
    >
      <span className={styles['select-item-indicator']}>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className={styles['select-icon']} />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => {
  const searching = useIsSearching();
  if (searching) return null;

  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn(styles['select-separator'], className)}
      {...props}
    />
  );
});
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSearch,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
