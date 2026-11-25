import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { Button } from '@/components/button/button';
import { IconButton } from '@/components/icon-button/icon-button';
import { MotionCollapsibleContent } from '@/components/motion-collapsible/motion-collapsible';
import {
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@/components/table/table-components';
import styles from '@/components/table/table-components.module.css';

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
});
