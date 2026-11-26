import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  TitleBlock,
  TitleBlockMark,
  TitleBlockSkeleton,
} from '@/components/title-block/title-block';

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

  it('draws a round mark when asked, and a square one by default', () => {
    const { container } = render(
      <>
        <TitleBlockMark icon="Shield" shape="round" />
        <TitleBlockMark icon="Shield" />
      </>
    );

    const [round, square] = [...container.children];
    expect(round.className).toMatch(/mark-round/);
    expect(square.className).not.toMatch(/mark-round/);
  });

  it('passes its ref and HTML attributes to the tile', () => {
    const ref = React.createRef<HTMLSpanElement>();
    const { container } = render(<TitleBlockMark ref={ref} icon="Shield" data-testid="tile" />);

    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current?.getAttribute('data-testid')).toBe('tile');
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
    expect(row?.closest('[data-slot="title-block"]')).not.toBeNull();
    const badge = screen.getByText('3 active');
    const button = screen.getByRole('button', { name: 'Edit' });
    expect(row?.contains(badge)).toBe(false);
    expect(row?.contains(button)).toBe(false);
    const end = badge.parentElement?.parentElement;
    expect(end?.contains(button)).toBe(true);
    expect(end?.firstElementChild?.contains(badge)).toBe(true);
  });

  it('leaves out the title row when there is no title', () => {
    const { container } = render(<TitleBlock trailing={<span>3 active</span>} />);

    expect(screen.queryByRole('heading')).toBeNull();
    expect(container.querySelector('[class*="line"]')).toBeNull();
    expect(screen.getByText('3 active')).toBeTruthy();
  });
});

describe('TitleBlockSkeleton', () => {
  const bars = (container: HTMLElement) => container.querySelectorAll('[class*="placeholder-bar"]');

  it('draws a bar for the title, and one for the description only when it has a width', () => {
    const { container, rerender } = render(<TitleBlockSkeleton titleWidth="w-40" />);
    expect(bars(container)).toHaveLength(1);
    expect(bars(container)[0].className).toMatch(/w-40/);

    rerender(<TitleBlockSkeleton titleWidth="w-40" descriptionWidth="w-64" />);
    expect(bars(container)).toHaveLength(2);
  });

  it('draws the mark it stands in for: square, round or none', () => {
    const markOf = (mark?: 'square' | 'round' | false) =>
      render(<TitleBlockSkeleton titleWidth="w-40" mark={mark} />).container.querySelector(
        '[class*="mark-slot"]'
      )?.firstElementChild;

    expect(markOf()?.className).not.toMatch(/mark-round/);
    expect(markOf('round')?.className).toMatch(/mark-round/);
    expect(markOf(false)).toBeUndefined();
  });

  it('passes its ref and HTML attributes to the root', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(
      <TitleBlockSkeleton ref={ref} titleWidth="w-40" aria-busy="true" />
    );

    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current?.getAttribute('aria-busy')).toBe('true');
  });
});
