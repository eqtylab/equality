import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TitleBlock, TitleBlockMark } from '@/components/title-block/title-block';

describe('TitleBlockMark', () => {
  it('takes its size from the TitleBlock it sits in', () => {
    const { container } = render(
      <TitleBlock size="lg" title="Policies" mark={<TitleBlockMark icon="Shield" />} />
    );

    const mark = container.querySelector('[aria-hidden="true"]');
    expect(mark?.className).toMatch(/mark-lg/);
    expect(mark?.className).not.toMatch(/mark-md/);
  });

  it('falls back to md outside a TitleBlock', () => {
    const { container } = render(<TitleBlockMark icon="Shield" />);

    const mark = container.firstElementChild;
    expect(mark?.getAttribute('aria-hidden')).toBe('true');
    expect(mark?.className).toMatch(/mark-md/);
  });
});

describe('TitleBlock', () => {
  it('puts trailing items in the title row and actions outside it', () => {
    render(
      <TitleBlock
        title="Policies"
        description="Rules every run is checked against"
        trailing={<span>3 active</span>}
        actions={<button type="button">Edit</button>}
      />
    );

    const row = screen.getByRole('heading', { name: 'Policies' }).parentElement;
    expect(row?.contains(screen.getByText('3 active'))).toBe(true);
    expect(row?.contains(screen.getByText('Rules every run is checked against'))).toBe(false);
    expect(row?.contains(screen.getByRole('button', { name: 'Edit' }))).toBe(false);
  });
});
