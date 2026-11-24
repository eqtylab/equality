import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@/components/table/table-components';

const rows = (props: { striped?: boolean }) =>
  render(
    <TableContainer {...props}>
      <TableBody>
        <TableRow>
          <TableCell>A</TableCell>
        </TableRow>
      </TableBody>
    </TableContainer>
  ).container.firstElementChild!.className;

describe('TableContainer', () => {
  it('draws row lines by default, not stripes', () => {
    expect(rows({})).not.toMatch(/table--striped/);
  });

  it('stripes its rows when asked', () => {
    expect(rows({ striped: true })).toMatch(/table--striped/);
  });
});
