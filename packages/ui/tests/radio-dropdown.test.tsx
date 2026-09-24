import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RadioDropdown } from '@/components/radio-dropdown/radio-dropdown';

const OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

function renderRadioDropdown(onSelect = vi.fn(), searchable = true) {
  render(
    <RadioDropdown
      label="Status"
      options={OPTIONS}
      selectedValue=""
      onSelect={onSelect}
      searchable={searchable}
    />
  );
  return onSelect;
}

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  screen.getByRole('button', { name: 'Status' }).focus();
  await user.keyboard('{Enter}');
  await screen.findByRole('menu');
};

describe('RadioDropdown', () => {
  describe('header', () => {
    it('shows the label as a header when not searchable', async () => {
      const user = userEvent.setup();
      renderRadioDropdown(vi.fn(), false);
      await openMenu(user);

      expect(screen.getAllByText('Status')).toHaveLength(2);
    });

    it('drops the header when searchable and names the search box after the label', async () => {
      const user = userEvent.setup();
      renderRadioDropdown();
      await openMenu(user);

      expect(screen.getAllByText('Status')).toHaveLength(1);
      expect(screen.getByRole('searchbox', { name: 'Status' })).toBeTruthy();
    });
  });

  describe('search', () => {
    it('shows and focuses the search input when the menu opens', async () => {
      const user = userEvent.setup();
      renderRadioDropdown();
      await openMenu(user);

      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('searchbox')));
    });

    it('chooses the first match on Enter', async () => {
      const user = userEvent.setup();
      const onSelect = renderRadioDropdown();
      await openMenu(user);

      await user.keyboard('clo');
      await user.keyboard('{Enter}');

      expect(onSelect).toHaveBeenCalledWith('closed');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });
  });
});
