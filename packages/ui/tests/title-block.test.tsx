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
  it('puts trailing items before the actions at the end of the block, outside the title row', () => {
    render(
      <TitleBlock
        title="Policies"
        description="Rules every run is checked against"
        trailing={<span>3 active</span>}
        actions={<button type="button">Edit</button>}
      />
    );

    const row = screen.getByRole('heading', { name: 'Policies' }).parentElement;
    const badge = screen.getByText('3 active');
    const button = screen.getByRole('button', { name: 'Edit' });
    expect(row?.contains(badge)).toBe(false);
    expect(row?.contains(button)).toBe(false);
    const end = badge.parentElement?.parentElement;
    expect(end?.contains(button)).toBe(true);
    expect(end?.firstElementChild?.contains(badge)).toBe(true);
  });
});
