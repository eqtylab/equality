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

  it('writes the range with both ends, the page size as its own control after it', () => {
    render(<Pagination {...defaults} onItemsPerPageChange={() => {}} type="policies" />);

    const count = info().getByText('41–50 of 95');
    const select = screen.getByRole('combobox', { name: 'Items per page' });
    expect(count.compareDocumentPosition(select) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(info().queryByText(/Showing/)).toBeNull();
    expect(isWideOnly(info().getByText('policies'))).toBe(true);
  });

  it('speaks the count with "to" and the noun, as the en dash reads differently across screen readers', () => {
    render(<Pagination {...defaults} type="policies" />);

    expect(info().getByText('41–50 of 95').getAttribute('aria-hidden')).toBe('true');
    expect(info().getByText('41 to 50 of 95 policies')).toBeTruthy();
  });

  it('labels the page-size select "per page" for sighted users only', () => {
    render(<Pagination {...defaults} onItemsPerPageChange={() => {}} />);

    const label = info().getByText('per page');
    expect(label.className).toContain('page-size-label--short');
    expect(label.getAttribute('aria-hidden')).toBe('true');
  });

  it('needs more room for "per page" beside a three-digit count', () => {
    render(
      <Pagination
        {...defaults}
        totalItems={146}
        filteredItems={146}
        onItemsPerPageChange={() => {}}
      />
    );

    expect(info().getByText('per page').className).toContain('page-size-label--medium');
  });

  it('keeps "per page" to the wide layout beside a four-digit count, as it never fits narrow', () => {
    render(
      <Pagination
        {...defaults}
        totalItems={1450}
        filteredItems={1450}
        onItemsPerPageChange={() => {}}
      />
    );

    expect(info().getByText('per page').className).not.toMatch(/page-size-label--/);
  });

  it('shows only the count without a page-size select', () => {
    render(<Pagination {...defaults} />);

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(info().queryByText('per page')).toBeNull();
    expect(info().getByText('41–50 of 95')).toBeTruthy();
  });

  it('hides the count and the page-size select without info', () => {
    render(<Pagination {...defaults} onItemsPerPageChange={() => {}} showInfo={false} />);

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(info().queryByText('41–50 of 95')).toBeNull();
  });

  it('shows a page past the end as the last page', () => {
    render(<Pagination {...defaults} currentPage={12} />);

    expect(screen.getByRole('button', { name: 'Page 10 of 10' }).getAttribute('aria-current')).toBe(
      'page'
    );
    expect(info().getByText('91–95 of 95')).toBeTruthy();
    expect(narrowButtons()).toEqual(['Previous page', 'Page 10 of 10', 'Next page']);
  });

  it('shows a page below 1 as the first page', () => {
    render(<Pagination {...defaults} currentPage={0} />);

    expect(screen.getByRole('button', { name: 'Page 1 of 10' }).getAttribute('aria-current')).toBe(
      'page'
    );
    expect(info().getByText('1–10 of 95')).toBeTruthy();
    expect(narrowButtons()).toEqual(['Previous page', 'Page 1 of 10', 'Next page']);
  });
});
