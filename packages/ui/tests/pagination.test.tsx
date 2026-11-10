import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Pagination } from '@/components/pagination/pagination';

const defaults = {
  currentPage: 5,
  totalItems: 95,
  filteredItems: 95,
  itemsPerPage: 10,
  onPageChange: () => {},
};

const isWideOnly = (element: Element) => element.className.includes('wide-only');

const info = () => within(screen.getByRole('navigation').previousElementSibling as HTMLElement);

const narrowButtons = () =>
  screen
    .getAllByRole('button')
    .filter((button) => !isWideOnly(button))
    .map((button) => button.getAttribute('aria-label') ?? button.textContent);

describe('Pagination', () => {
  it('keeps only the current page, previous and next for a narrow width', () => {
    render(<Pagination {...defaults} />);

    expect(narrowButtons()).toEqual(['Previous page', 'Page 5 of 10', 'Next page']);
  });

  it('keeps the page-size select and a short count for a narrow width', () => {
    render(<Pagination {...defaults} onItemsPerPageChange={() => {}} type="policies" />);

    expect(isWideOnly(screen.getByRole('combobox', { name: 'Items per page' }))).toBe(false);
    expect(isWideOnly(info().getByText('41–50 of 95').parentElement!)).toBe(false);
    expect(isWideOnly(info().getByText('of 95 policies'))).toBe(true);
    expect(isWideOnly(info().getByText('Showing 41 to'))).toBe(true);
  });

  it('keeps only the short count for a narrow width without a page-size select', () => {
    render(<Pagination {...defaults} />);

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(isWideOnly(info().getByText('50'))).toBe(true);
    expect(isWideOnly(info().getByText('41–50 of 95').parentElement!)).toBe(false);
  });

  it('speaks the short count with "to", as the en dash reads differently across screen readers', () => {
    render(<Pagination {...defaults} />);

    expect(info().getByText('41–50 of 95').getAttribute('aria-hidden')).toBe('true');
    expect(info().getByText('41 to 50 of 95')).toBeTruthy();
  });

  it('shows a page past the end as the last page', () => {
    render(<Pagination {...defaults} currentPage={12} />);

    expect(screen.getByRole('button', { name: 'Page 10 of 10' }).getAttribute('aria-current')).toBe(
      'page'
    );
    expect(info().getByText('91–95 of 95')).toBeTruthy();
    expect(narrowButtons()).toEqual(['Previous page', 'Page 10 of 10', 'Next page']);
  });
});
