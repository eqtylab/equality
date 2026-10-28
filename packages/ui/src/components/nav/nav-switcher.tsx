import * as React from 'react';
import { ChevronsUpDown, TriangleAlert } from 'lucide-react';

import { buttonVariants } from '@/components/button/button';
import styles from '@/components/nav/nav.module.css';
import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectItem,
  SelectSearch,
  SelectSeparator,
  SelectTrigger,
} from '@/components/select/select';
import { blockClosedTypeahead } from '@/components/select/select-typeahead';
import { Skeleton } from '@/components/skeleton/skeleton';
import { Spinner } from '@/components/spinner/spinner';
import { cn } from '@/lib/utils';

interface NavSwitcherOption {
  /** The option's value, passed to `onValueChange` */
  value: string;
  /** The option's name in the list */
  label: string;
  /** Matched by search as well as the label, for identifiers a user may know but never sees */
  keywords?: string[];
}

interface NavSwitcherAction {
  /** The action's link text */
  label: string;
  /** Runs once the list has closed */
  onSelect: () => void;
}

interface NavSwitcherBaseProps {
  /** Shows a placeholder at the switcher's height while the current item loads */
  loading?: false;
  /** The current item's name, shown as the panel's heading */
  label: string;
  /** Singular and lowercase, for the trigger's name: "{label}, switch {noun}" */
  noun: string;
  /** Plural and lowercase, for the search and empty copy */
  collection: string;
  /** The items to switch between */
  options: NavSwitcherOption[];
  /** The current item's value */
  value: string;
  /** Called with the picked item's value */
  onValueChange: (value: string) => void;
  /** Hover or focus on an option, for a caller that preloads its destination */
  onHighlight?: (value: string) => void;
  /** Hover or focus leaves an option, for a caller that cancels its preload */
  onHighlightEnd?: () => void;
  /** A command at the bottom of the list, kept while searching, such as "Create Project" */
  action?: NavSwitcherAction;
}

type NavSwitcherRetryProps =
  | { error?: false; retrying?: never; onRetry?: never }
  | {
      /** The list failed to load: the list says so and offers Retry */
      error: boolean;
      /** A retry is in flight: the Retry row reads "Retrying..." */
      retrying?: boolean;
      /** Called when Retry is picked; the list stays open */
      onRetry: () => void;
    };

type NavSwitcherLoadedProps = NavSwitcherBaseProps & NavSwitcherRetryProps;

interface NavSwitcherLoadingProps {
  loading: true;
}

type NavSwitcherProps = NavSwitcherLoadedProps | NavSwitcherLoadingProps;

// The heading is named by the label alone; the trigger's name starts with it and says what the
// control does (WCAG 2.5.3)
const NavSwitcherSelect = React.forwardRef<HTMLButtonElement, NavSwitcherLoadedProps>(
  (
    {
      label,
      noun,
      collection,
      options,
      value,
      onValueChange,
      onHighlight,
      onHighlightEnd,
      action,
      error,
      retrying,
      onRetry,
    },
    ref
  ) => {
    const labelId = React.useId();
    const actionValue = React.useId();
    const retryValue = React.useId();
    const errorId = React.useId();
    const actionPending = React.useRef(false);
    const [open, setOpen] = React.useState(false);
    const keepOpen = React.useRef(false);
    const [announcement, setAnnouncement] = React.useState('');
    const [listState, setListState] = React.useState({ error, retrying });

    if (listState.error !== error || listState.retrying !== retrying) {
      setListState({ error, retrying });
      // A background refetch toggles retrying with nothing to report
      if (error || listState.error) {
        setAnnouncement(
          error
            ? retrying
              ? 'Retrying...'
              : `Couldn't load ${collection}.`
            : options.length > 0
              ? `Loaded ${collection}.`
              : `No ${collection} found.`
        );
      }
    }

    const empty = options.length === 0 && !action && !error;

    // Open, the list stays until it closes: a retry that found nothing would otherwise unmount it
    // under focus
    if (empty && !open) {
      return (
        <h2 className={styles['nav-switcher-heading']}>
          <span
            className={cn(styles['nav-switcher-plain'], styles['nav-switcher-name'])}
            title={label}
          >
            {label}
          </span>
        </h2>
      );
    }

    return (
      <h2 aria-labelledby={labelId} className={styles['nav-switcher-heading']}>
        <Select
          value={value}
          open={open}
          onOpenChange={(next) => {
            if (!next && keepOpen.current) keepOpen.current = false;
            else {
              setOpen(next);
              setAnnouncement('');
            }
          }}
          onValueChange={(next) => {
            if (next === actionValue) actionPending.current = true;
            else if (next === retryValue) {
              // Before the trigger mounts, or inside a form, Radix's hidden native select picks
              // Retry when value matches no option; acting on that while closed refetches in a loop
              if (!open) return;
              keepOpen.current = true;
              // Only an item pick is followed by a close to absorb
              queueMicrotask(() => {
                keepOpen.current = false;
              });
              if (!retrying) onRetry?.();
            } else onValueChange(next);
          }}
        >
          <SelectTrigger
            ref={ref}
            aria-label={`${label}, switch ${noun}`}
            className={styles['nav-switcher']}
            onKeyDown={blockClosedTypeahead}
          >
            <span
              id={labelId}
              className={cn(styles['nav-switcher-label'], styles['nav-switcher-name'])}
              title={label}
            >
              {label}
            </span>
            <ChevronsUpDown className={styles['nav-switcher-icon']} aria-hidden="true" />
          </SelectTrigger>

          {/* Fixed so the list keeps its width as a search hides wider options */}
          <SelectContent
            className={styles['nav-switcher-list']}
            // Runs once the list has closed, so the Enter that picked the action can't reach a
            // dialog it opens
            onCloseAutoFocus={() => {
              if (!actionPending.current) return;
              actionPending.current = false;
              action?.onSelect();
            }}
          >
            <div className={styles['nav-switcher-status']} role="status" aria-live="polite">
              {announcement}
            </div>
            <SelectSearch
              placeholder={`Search ${collection}...`}
              aria-label={`Search ${collection}`}
              aria-describedby={error ? errorId : undefined}
            />
            {error && (
              <SelectItem
                value={retryValue}
                textValue={`Couldn't load ${collection}. ${retrying ? 'Retrying' : 'Retry'}`}
                persistent
                aria-disabled={retrying || undefined}
                className={styles['nav-switcher-retry']}
              >
                <span className={styles['nav-switcher-error']}>
                  <span id={errorId} className={styles['nav-switcher-error-message']}>
                    <TriangleAlert
                      className={styles['nav-switcher-error-icon']}
                      aria-hidden="true"
                    />
                    Couldn&apos;t load {collection}.
                  </span>
                  {retrying ? (
                    <span className={styles['nav-switcher-error-message']}>
                      <Spinner size="xs" variant="neutral" />
                      Retrying...
                    </span>
                  ) : (
                    <span className={buttonVariants({ variant: 'link', size: 'sm' })}>Retry</span>
                  )}
                </span>
              </SelectItem>
            )}
            {empty ? (
              <div className={styles['nav-switcher-empty']}>No {collection} found</div>
            ) : (
              (!error || options.length > 0) && <SelectEmpty>No {collection} found</SelectEmpty>
            )}
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                textValue={[option.label, ...(option.keywords ?? [])].join(' ')}
                onPointerEnter={() => onHighlight?.(option.value)}
                onPointerLeave={onHighlightEnd}
                onFocus={() => onHighlight?.(option.value)}
                onBlur={onHighlightEnd}
              >
                <span className={styles['nav-switcher-option']} title={option.label}>
                  {option.label}
                </span>
              </SelectItem>
            ))}
            {action && (
              <div className={styles['nav-switcher-footer']}>
                <SelectSeparator persistent />
                <SelectItem
                  value={actionValue}
                  textValue={action.label}
                  persistent
                  className={styles['nav-switcher-action']}
                >
                  <span className={buttonVariants({ variant: 'link', size: 'sm' })}>
                    {action.label}
                  </span>
                </SelectItem>
              </div>
            )}
          </SelectContent>
        </Select>
      </h2>
    );
  }
);
NavSwitcherSelect.displayName = 'NavSwitcherSelect';

const NavSwitcher = React.forwardRef<HTMLButtonElement, NavSwitcherProps>((props, ref) =>
  props.loading ? (
    <div
      className={cn(styles['nav-switcher-heading'], styles['nav-switcher-placeholder'])}
      aria-busy="true"
    >
      <Skeleton className={styles['nav-switcher-skeleton']} />
      <span className={styles['nav-switcher-loading-label']}>Loading</span>
    </div>
  ) : (
    <NavSwitcherSelect ref={ref} {...props} />
  )
);
NavSwitcher.displayName = 'NavSwitcher';

export { NavSwitcher };
export type { NavSwitcherAction, NavSwitcherOption, NavSwitcherProps };
