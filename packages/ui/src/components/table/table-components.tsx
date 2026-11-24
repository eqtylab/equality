import * as React from 'react';
import { VariantProps } from 'class-variance-authority';

import styles from '@/components/table/table-components.module.css';
import { ELEVATION, generateElevationVariants } from '@/lib/elevations';
import { useIsomorphicLayoutEffect } from '@/lib/use-isomorphic-layout-effect';
import { cn } from '@/lib/utils';

const tableElevationVariants = generateElevationVariants(styles, 'table', ELEVATION.RAISED);

const TableContainer = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> &
    VariantProps<typeof tableElevationVariants> & {
      border?: boolean;
      columns?: string;
    }
>(({ className, style, elevation = ELEVATION.RAISED, border, columns, ...props }, ref) => (
  <div
    className={cn(
      styles['table'],
      tableElevationVariants({ elevation }),
      border && styles['table-border'],
      className
    )}
    style={columns ? ({ ...style, '--table-columns': columns } as React.CSSProperties) : style}
  >
    <table ref={ref} className={styles['table-inner']} {...props} />
  </div>
));
TableContainer.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & {
    sticky?: false | 'container' | 'page';
  }
>(({ className, sticky = false, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      styles['table-header'],
      sticky === 'container' && styles['table-header--sticky-container'],
      sticky === 'page' && styles['table-header--sticky-page'],
      className
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

type RowFocusContextValue = {
  activeRow: HTMLTableRowElement | null;
  setActiveRow: (row: HTMLTableRowElement) => void;
  rowsChanged: () => void;
};

const RowFocusContext = React.createContext<RowFocusContextValue | null>(null);

const FOCUSABLE_ROW = 'tr[data-table-row-focusable]';

const focusableRows = (body: HTMLTableSectionElement) =>
  Array.from(body.querySelectorAll<HTMLTableRowElement>(FOCUSABLE_ROW)).filter(
    (row) => row.parentElement === body
  );

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => {
  const bodyRef = React.useRef<HTMLTableSectionElement | null>(null);
  const [activeRow, setActiveRow] = React.useState<HTMLTableRowElement | null>(null);
  const [, rowsChanged] = React.useReducer((count: number) => count + 1, 0);

  const setRefs = React.useCallback(
    (node: HTMLTableSectionElement | null) => {
      bodyRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  // Without a row holding tabIndex 0, Tab skips the table entirely
  useIsomorphicLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const rows = focusableRows(body);
    if (activeRow && rows.includes(activeRow)) return;
    const next = rows[0] ?? null;
    if (next !== activeRow) setActiveRow(next);
  });

  const context = React.useMemo(() => ({ activeRow, setActiveRow, rowsChanged }), [activeRow]);

  return (
    <RowFocusContext.Provider value={context}>
      <tbody ref={setRefs} className={cn(styles['table-body'], className)} {...props} />
    </RowFocusContext.Provider>
  );
});
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn(styles['table-footer'], className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

const ROW_KEYS = ['ArrowDown', 'ArrowUp', 'Home', 'End'];

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    /** Applies hover and pointer styles. With `onClick`, also makes the row reachable and openable from the keyboard. */
    clickable?: boolean;
    /** URL the row links to, rendered as a full-row link. */
    href?: string;
    /** Accessible name for the row's link, announced by screen readers. */
    hrefLabel?: string;
  }
>(
  (
    {
      className,
      clickable,
      href,
      hrefLabel = 'View details',
      children,
      onClick,
      onKeyDown,
      onFocus,
      tabIndex,
      ...props
    },
    ref
  ) => {
    const isClickable = clickable || !!href;
    const isFocusable = !!clickable && !!onClick && !href;
    const rowFocus = React.useContext(RowFocusContext);
    const [row, setRow] = React.useState<HTMLTableRowElement | null>(null);
    const rowsChanged = rowFocus?.rowsChanged;

    useIsomorphicLayoutEffect(() => {
      if (!isFocusable || !rowsChanged) return;
      rowsChanged();
      return rowsChanged;
    }, [isFocusable, rowsChanged]);

    const setRefs = React.useCallback(
      (node: HTMLTableRowElement | null) => {
        setRow(node);
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
      const target = e.target as HTMLElement;
      // Clicks inside a portal, such as a row's menu, bubble here through React but aren't in the row
      if (!e.currentTarget.contains(target)) return;
      if (target.closest('button, a:not([data-table-row-link])')) return;
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented || e.target !== e.currentTarget) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.click();
        return;
      }

      if (!ROW_KEYS.includes(e.key)) return;
      const body = e.currentTarget.parentElement;
      if (!(body instanceof HTMLTableSectionElement)) return;
      const rows = focusableRows(body);
      const index = rows.indexOf(e.currentTarget);
      const next =
        e.key === 'ArrowDown'
          ? rows[index + 1]
          : e.key === 'ArrowUp'
            ? rows[index - 1]
            : e.key === 'Home'
              ? rows[0]
              : rows[rows.length - 1];
      e.preventDefault();
      next?.focus();
    };

    const handleFocus = (e: React.FocusEvent<HTMLTableRowElement>) => {
      onFocus?.(e);
      if (e.currentTarget.contains(e.target)) rowFocus?.setActiveRow(e.currentTarget);
    };

    const rovingTabIndex = !rowFocus || (row && rowFocus.activeRow === row) ? 0 : -1;

    return (
      <tr
        ref={setRefs}
        className={cn(
          styles['table-row'],
          isClickable && styles['table-row--clickable'],
          href && styles['table-row--linked'],
          className
        )}
        onClick={onClick ? handleClick : undefined}
        onKeyDown={isFocusable ? handleKeyDown : onKeyDown}
        onFocus={isFocusable ? handleFocus : onFocus}
        tabIndex={tabIndex ?? (isFocusable ? rovingTabIndex : undefined)}
        data-table-row-focusable={isFocusable ? '' : undefined}
        {...props}
      >
        {href && (
          <a href={href} className={styles['table-row-link']} data-table-row-link>
            <span className={styles['table-row-link-label']}>{hrefLabel}</span>
          </a>
        )}
        {children}
      </tr>
    );
  }
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn(styles['table-head'], className)} {...props} />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn(styles['table-cell'], className)} {...props} />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn(styles['table-caption'], className)} {...props} />
));
TableCaption.displayName = 'TableCaption';

export {
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
