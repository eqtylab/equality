import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';

import { buttonVariants } from '@/components/button/button';
import styles from '@/components/nav/nav.module.css';
import { blockClosedTypeahead } from '@/components/nav/select-typeahead';
import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectItem,
  SelectSearch,
  SelectSeparator,
  SelectTrigger,
} from '@/components/select/select';
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

interface NavSwitcherProps {
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
  /** Hover or focus on an option, for a caller that warms its destination */
  onHighlight?: (value: string) => void;
  /** Hover or focus leaves an option */
  onHighlightEnd?: () => void;
  /** Pinned to the list's foot as a link and kept through a search, such as creating a new item */
  action?: NavSwitcherAction;
}

// Holds the switcher's height in NavPanel's header while the current item loads
const NavSwitcherPlaceholder = ({ children }: { children: React.ReactNode }) => (
  <div className={cn(styles['switcher-heading'], styles['switcher-placeholder'])}>{children}</div>
);

// Goes in NavPanel's header. The heading is named by the label alone; the trigger's name starts
// with it and says what the control does (WCAG 2.5.3)
const NavSwitcher = React.forwardRef<HTMLButtonElement, NavSwitcherProps>(
  (
    { label, noun, collection, options, value, onValueChange, onHighlight, onHighlightEnd, action },
    ref
  ) => {
    const labelId = React.useId();
    const actionValue = React.useId();
    const actionPending = React.useRef(false);

    if (options.length <= 1 && !action) {
      return (
        <h2 className={styles['switcher-heading']}>
          <span className={cn(styles['switcher-plain'], styles['switcher-name'])} title={label}>
            {label}
          </span>
        </h2>
      );
    }

    return (
      <h2 aria-labelledby={labelId} className={styles['switcher-heading']}>
        <Select
          value={value}
          onValueChange={(next) => {
            if (next === actionValue) actionPending.current = true;
            else onValueChange(next);
          }}
        >
          <SelectTrigger
            ref={ref}
            aria-label={`${label}, switch ${noun}`}
            className={styles.switcher}
            onKeyDown={blockClosedTypeahead}
          >
            <span
              id={labelId}
              className={cn(styles['switcher-label'], styles['switcher-name'])}
              title={label}
            >
              {label}
            </span>
            <ChevronsUpDown className={styles['switcher-icon']} aria-hidden="true" />
          </SelectTrigger>

          {/* Fixed so the list keeps its width as a search hides wider options */}
          <SelectContent
            className={styles['switcher-list']}
            // Runs once the list has closed, so the Enter that picked the action can't reach a
            // dialog it opens
            onCloseAutoFocus={() => {
              if (!actionPending.current) return;
              actionPending.current = false;
              action?.onSelect();
            }}
          >
            <SelectSearch
              placeholder={`Search ${collection}...`}
              aria-label={`Search ${collection}`}
            />
            <SelectEmpty>No {collection} found</SelectEmpty>
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
                <span className={styles['switcher-option']} title={option.label}>
                  {option.label}
                </span>
              </SelectItem>
            ))}
            {action && (
              <div className={styles['switcher-footer']}>
                <SelectSeparator persistent />
                <SelectItem
                  value={actionValue}
                  textValue={action.label}
                  persistent
                  className={styles['switcher-action']}
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
NavSwitcher.displayName = 'NavSwitcher';

export { NavSwitcher, NavSwitcherPlaceholder };
export type { NavSwitcherAction, NavSwitcherOption, NavSwitcherProps };
