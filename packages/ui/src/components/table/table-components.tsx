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
  React.HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }
>(({ className, sticky, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(styles['table-header'], sticky && styles['table-header--sticky'], className)}
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
  React.HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean }
>(({ className, clickable, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(styles['table-row'], clickable && styles['table-row--clickable'], className)}
    {...props}
  />
));
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
>(({ className, colSpan, style, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(styles['table-cell'], className)}
    style={colSpan ? { gridColumn: `span ${colSpan}`, ...style } : style}
    {...props}
  />
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
