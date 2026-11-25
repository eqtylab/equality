import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@/components/table/table-components';

const rows = (props: { density?: 'regular' | 'comfortable' }) =>
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
  it('keeps regular rows by default', () => {
    expect(rows({})).not.toMatch(/table--comfortable/);
  });

  it('makes its rows comfortable when asked', () => {
    expect(rows({ density: 'comfortable' })).toMatch(/table--comfortable/);
  });
});
