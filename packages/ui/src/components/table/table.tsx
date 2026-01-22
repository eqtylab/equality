import * as React from 'react';
import { VariantProps } from 'class-variance-authority';

import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table/table-components';
import { ELEVATION, generateElevationVariants } from '@/lib/elevations';
import { cn } from '@/lib/utils';

import styles from './table.module.css';

type TableColumn = {
  key: string;
  content: React.ReactNode;
  className?: string;
};

type TableRowData = {
  key: string;
  cells: TableCellData[];
  onClick?: () => void;
  className?: string;
};

type TableCellData = {
  key: string;
  content: React.ReactNode;
  className?: string;
};

interface TableProps extends VariantProps<typeof tableElevationVariants> {
  columns: TableColumn[];
  rows: TableRowData[];
  className?: string;
  border?: boolean;
}

const tableElevationVariants = generateElevationVariants(styles, 'table', ELEVATION.BASE);

const Table = ({
  columns,
  rows,
  className,
  border = false,
  elevation = ELEVATION.BASE,
}: TableProps) => {
  return (
    <div
      className={cn(
        styles['table'],
        border && styles['table-border'],
        tableElevationVariants({ elevation }),
        className
      )}
    >
      <TableContainer elevation={elevation}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.content}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.key}
              className={cn(row.className, row.onClick && styles['table-row-clickable'])}
              onClick={row.onClick}
            >
              {row.cells.map((cell) => (
                <TableCell key={cell.key} className={cell.className}>
                  {cell.content}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};

export { Table };
