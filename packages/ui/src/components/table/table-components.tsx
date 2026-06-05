import * as React from 'react';
import { VariantProps } from 'class-variance-authority';

import styles from '@/components/table/table-components.module.css';
import { ELEVATION, generateElevationVariants } from '@/lib/elevations';
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

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(styles['table-body'], className)} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn(styles['table-footer'], className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    clickable?: boolean;
    href?: string;
    hrefLabel?: string;
  }
>(
  (
    { className, clickable, href, hrefLabel = 'View details', children, onClick, ...props },
    ref
  ) => {
    const isClickable = clickable || !!href;

    const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
      // Don't trigger row click if an interactive element was clicked
      const target = e.target as HTMLElement;
      if (target.closest('button, a:not([data-table-row-link])')) {
        return;
      }
      onClick?.(e);
    };

    return (
      <tr
        ref={ref}
        className={cn(
          styles['table-row'],
          isClickable && styles['table-row--clickable'],
          href && styles['table-row--linked'],
          className
        )}
        onClick={onClick ? handleClick : undefined}
        {...props}
      >
        {href && (
          <a href={href} className={styles['table-row-link']} data-table-row-link>
            <span className="sr-only">{hrefLabel}</span>
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
