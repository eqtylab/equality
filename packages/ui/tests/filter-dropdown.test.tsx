import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FilterDropdown } from '@/components/filter-dropdown/filter-dropdown';

const OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

function renderFilterDropdown({
  searchable = true,
  selectedFilters = [] as string[],
  onToggleFilter = vi.fn(),
  onClearAll = vi.fn(),
} = {}) {
  render(
    <FilterDropdown
      label="Status"
      options={OPTIONS}
      selectedFilters={selectedFilters}
      onToggleFilter={onToggleFilter}
      onClearAll={onClearAll}
      searchable={searchable}
    />
  );
  return { onToggleFilter, onClearAll };
}

function StatefulFilterDropdown({ searchable }: { searchable: boolean }) {
  const [selected, setSelected] = React.useState(['open']);
  return (
    <FilterDropdown
      label="Status"
      options={OPTIONS}
      selectedFilters={selected}
      onToggleFilter={(value) =>
        setSelected((prev) =>
          prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        )
      }
      onClearAll={() => setSelected([])}
      searchable={searchable}
    />
  );
}

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  screen.getByRole('button', { name: /Status/ }).focus();
  await user.keyboard('{Enter}');
  await screen.findByRole('menu');
};

describe('FilterDropdown', () => {
  describe('header', () => {
    it('shows the Filters header when not searchable', async () => {
      const user = userEvent.setup();
      renderFilterDropdown({ searchable: false });
      await openMenu(user);

      expect(screen.getByText('Filters')).toBeTruthy();
    });

    it('drops the header when searchable and names the search box after the label', async () => {
      const user = userEvent.setup();
      renderFilterDropdown();
      await openMenu(user);

      expect(screen.queryByText('Filters')).toBeNull();
      expect(screen.getByRole('searchbox', { name: 'Status' })).toBeTruthy();
    });
  });

  describe('clear all', () => {
    it('is only offered while something is selected', async () => {
      const user = userEvent.setup();
      renderFilterDropdown();
      await openMenu(user);

      expect(screen.queryByRole('menuitem', { name: 'Clear all' })).toBeNull();
    });

    it('is the last menu item, so keyboard users reach it with ArrowUp from search', async () => {
      const user = userEvent.setup();
      const { onClearAll } = renderFilterDropdown({ selectedFilters: ['open'] });
      await openMenu(user);

      await user.keyboard('{ArrowUp}');
      const clearAll = screen.getByRole('menuitem', { name: 'Clear all' });
      await waitFor(() => expect(document.activeElement).toBe(clearAll));

      await user.keyboard('{Enter}');
      expect(onClearAll).toHaveBeenCalledOnce();
    });

    it('sits in the Filters header when not searchable, as the first keyboard stop', async () => {
      const user = userEvent.setup();
      const { onClearAll } = renderFilterDropdown({ searchable: false, selectedFilters: ['open'] });
      await openMenu(user);

      const clearAll = screen.getByRole('menuitem', { name: 'Clear all' });
      expect(screen.getByText('Filters').contains(clearAll)).toBe(true);
      await waitFor(() => expect(document.activeElement).toBe(clearAll));

      await user.keyboard('{Enter}');
      expect(onClearAll).toHaveBeenCalledOnce();
    });

    it('keeps the menu open and hands focus to the search box once it clears', async () => {
      const user = userEvent.setup();
      render(<StatefulFilterDropdown searchable />);
      await openMenu(user);

      await user.click(screen.getByRole('menuitem', { name: 'Clear all' }));

      expect(screen.queryByRole('menuitem', { name: 'Clear all' })).toBeNull();
      expect(screen.getByRole('menu')).toBeTruthy();
      expect(document.activeElement).toBe(screen.getByRole('searchbox', { name: 'Status' }));
    });

    it('keeps the menu open and focuses the menu once it clears when not searchable', async () => {
      const user = userEvent.setup();
      render(<StatefulFilterDropdown searchable={false} />);
      await openMenu(user);

      await user.click(screen.getByRole('menuitem', { name: 'Clear all' }));

      expect(screen.queryByRole('menuitem', { name: 'Clear all' })).toBeNull();
      expect(document.activeElement).toBe(screen.getByRole('menu'));
    });

    it('stays out of search results, so Enter toggles the match instead', async () => {
      const user = userEvent.setup();
      const { onToggleFilter, onClearAll } = renderFilterDropdown({ selectedFilters: ['open'] });
      await openMenu(user);

      await user.keyboard('cl');
      expect(screen.queryByRole('menuitem', { name: 'Clear all' })).toBeNull();

      await user.keyboard('{Enter}');
      expect(onToggleFilter).toHaveBeenCalledWith('closed');
      expect(onClearAll).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('shows and focuses the search input when the menu opens', async () => {
      const user = userEvent.setup();
      renderFilterDropdown();
      await openMenu(user);

      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('searchbox')));
    });

    it('toggles the first match on Enter and keeps the menu open', async () => {
      const user = userEvent.setup();
      const { onToggleFilter } = renderFilterDropdown();
      await openMenu(user);

      await user.keyboard('arch');
      await user.keyboard('{Enter}');

      expect(onToggleFilter).toHaveBeenCalledWith('archived');
      expect(screen.getByRole('menu')).toBeTruthy();
    });

    it('does not toggle anything when Enter is pressed on an emptied query', async () => {
      const user = userEvent.setup();
      const { onToggleFilter } = renderFilterDropdown();
      await openMenu(user);

      await user.keyboard('a{Backspace}{Enter}');

      expect(onToggleFilter).not.toHaveBeenCalled();
    });
  });
});
