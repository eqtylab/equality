import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { Button } from '@/components/button/button';
import { EmptyTableState } from '@/components/empty-table-state/empty-table-state';
import { IconButton } from '@/components/icon-button/icon-button';
import { MotionCollapsibleContent } from '@/components/motion-collapsible/motion-collapsible';
import { Pagination } from '@/components/pagination/pagination';
import {
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableRowAction,
} from '@/components/table/table-components';
import styles from '@/components/table/table-components.module.css';
import { TruncatedDescription } from '@/components/truncated-description/truncated-description';

import { compileCss } from './compile-css';

let pull: string;

// The compiled pull rule, with its class names hashed the way the rendered table's are
beforeAll(async () => {
  const css = await compileCss('src/components/table/table-components.module.css');
  const end = css.indexOf('{', css.indexOf(':is(.table-cell, .table-head)\n  :is('));
  pull = css
    .slice(css.lastIndexOf('}', end) + 1, end)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\.(table-cell|table-head)\b/g, (_, name: string) => `.${styles[name]}`)
    .trim();
}, 30_000);

const table = (cell: React.ReactNode) => (
  <TableContainer columns="1fr">
    <TableBody>
      <TableRow>
        <TableCell>{cell}</TableCell>
      </TableRow>
    </TableBody>
  </TableContainer>
);

describe('the button pull in a table cell', () => {
  it('reaches a row action in a table inside a collapsible', () => {
    render(
      <MotionCollapsibleContent isOpen>
        {table(<IconButton name="Ellipsis" label="Row actions" />)}
      </MotionCollapsibleContent>
    );

    expect(screen.getByRole('button', { name: 'Row actions' }).matches(pull)).toBe(true);
  });

  it('reaches a row action in a table inside a collapsible inside another table', () => {
    render(
      table(
        <MotionCollapsibleContent isOpen>
          {table(<IconButton name="Ellipsis" label="Detail actions" />)}
        </MotionCollapsibleContent>
      )
    );

    expect(screen.getByRole('button', { name: 'Detail actions' }).matches(pull)).toBe(true);
  });

  it('leaves the buttons of a collapsible inside the cell where they sit', () => {
    render(
      table(
        <MotionCollapsibleContent isOpen>
          <Button>Approve</Button>
        </MotionCollapsibleContent>
      )
    );

    expect(screen.getByRole('button', { name: 'Approve' }).matches(pull)).toBe(false);
  });

  const inCollapsible = (cell: React.ReactNode) =>
    render(<MotionCollapsibleContent isOpen>{table(cell)}</MotionCollapsibleContent>);

  it("leaves an empty state's clear button where it sits, in a table inside a collapsible", () => {
    inCollapsible(
      <EmptyTableState icon="Search" title="No matches" showClearButton onClear={() => {}} />
    );

    for (const button of screen.getAllByRole('button')) expect(button.matches(pull)).toBe(false);
  });

  it("leaves a long description's toggle where it sits, in a table inside a collapsible", () => {
    inCollapsible(<TruncatedDescription description={'A long description. '.repeat(20)} />);

    for (const button of screen.getAllByRole('button')) expect(button.matches(pull)).toBe(false);
  });

  it("leaves pagination's buttons where they sit, in a table inside a collapsible", () => {
    inCollapsible(
      <Pagination
        currentPage={1}
        totalItems={50}
        filteredItems={50}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) expect(button.matches(pull)).toBe(false);
  });

  it("leaves a row's TableRowAction button where its text sits, as its link would be", () => {
    render(
      <TableContainer columns="1fr">
        <TableBody>
          <TableRow onClick={() => {}}>
            <TableCell>
              <TableRowAction>Alice Cooper</TableRowAction>
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );

    expect(screen.getByRole('button', { name: 'Alice Cooper' }).matches(pull)).toBe(false);
  });
});
