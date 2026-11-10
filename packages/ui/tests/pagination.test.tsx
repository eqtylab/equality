import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Pagination } from '@/components/pagination/pagination';

const isWideOnly = (element: Element) => element.className.includes('wide-only');

describe('Pagination', () => {
  it('keeps only the current page, previous and next for a narrow width', () => {
    render(
      <Pagination
        currentPage={5}
        totalItems={95}
        filteredItems={95}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    const narrow = screen
      .getAllByRole('button')
      .filter((button) => !isWideOnly(button))
      .map((button) => button.getAttribute('aria-label') ?? button.textContent);
    expect(narrow).toEqual(['Previous page', 'Page 5 of 10', 'Next page']);
  });

  it('keeps the page-size select and a short count for a narrow width', () => {
    render(
      <Pagination
        currentPage={5}
        totalItems={95}
        filteredItems={95}
        itemsPerPage={10}
        onPageChange={() => {}}
        onItemsPerPageChange={() => {}}
        type="policies"
      />
    );

    expect(isWideOnly(screen.getByRole('combobox', { name: 'Items per page' }))).toBe(false);
    expect(isWideOnly(screen.getByText('41–50 of 95'))).toBe(false);
    expect(isWideOnly(screen.getByText('of 95 policies'))).toBe(true);
    expect(isWideOnly(screen.getByText('Showing 41 to'))).toBe(true);
  });

  it('keeps only the short count for a narrow width without a page-size select', () => {
    render(
      <Pagination
        currentPage={5}
        totalItems={95}
        filteredItems={95}
        itemsPerPage={10}
        onPageChange={() => {}}
      />
    );

    expect(screen.queryByRole('combobox')).toBeNull();
    expect(isWideOnly(screen.getByText('50'))).toBe(true);
    expect(isWideOnly(screen.getByText('41–50 of 95'))).toBe(false);
  });
});
