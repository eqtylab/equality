import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSearch,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/select/select';

const REGIONS = [
  { label: 'Americas', countries: ['Brazil', 'Canada'] },
  { label: 'Asia Pacific', countries: ['Japan', 'New Zealand'] },
];

type Props = Partial<React.ComponentProps<typeof Select>> & { alwaysVisible?: boolean };

function CountrySelect({ alwaysVisible, ...props }: Props) {
  return (
    <Select {...props}>
      <SelectTrigger aria-label="Country">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        <SelectSearch alwaysVisible={alwaysVisible} placeholder="Search countries..." />
        {REGIONS.map((region, index) => (
          <React.Fragment key={region.label}>
            {index > 0 && <SelectSeparator data-testid="separator" />}
            <SelectGroup data-testid={`group-${region.label}`}>
              <SelectLabel>{region.label}</SelectLabel>
              {region.countries.map((country) => (
                <SelectItem key={country} value={country.toLowerCase()}>
                  {country}
                </SelectItem>
              ))}
            </SelectGroup>
          </React.Fragment>
        ))}
        <SelectEmpty>No countries found</SelectEmpty>
      </SelectContent>
    </Select>
  );
}

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  screen.getByRole('combobox', { name: 'Country' }).focus();
  await user.keyboard('{Enter}');
  return screen.findByRole('listbox');
};

const option = (name: string) => {
  const match = screen
    .getAllByRole('option', { hidden: true })
    .find((element) => element.textContent === name);
  if (!match) throw new Error(`No option named ${name}`);
  return match;
};

describe('Select', () => {
  describe('search', () => {
    it('shows and focuses the search input on open by default', async () => {
      const user = userEvent.setup();
      render(<CountrySelect />);
      await open(user);

      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('searchbox')));
    });

    it('hides non-matching options, their empty groups, labels and separators', async () => {
      const user = userEvent.setup();
      render(<CountrySelect />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'jap');

      expect(option('Japan').hidden).toBe(false);
      expect(option('Brazil').hidden).toBe(true);
      expect(screen.getByTestId('group-Americas').hidden).toBe(true);
      expect(screen.getByTestId('group-Asia Pacific').hidden).toBe(false);
      expect(screen.queryByTestId('separator')).toBeNull();
      expect(screen.getByText('1 result available')).toBeTruthy();
    });

    it('keeps group labels in the DOM so aria-labelledby still resolves', async () => {
      const user = userEvent.setup();
      render(<CountrySelect />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'jap');

      const group = screen.getByTestId('group-Asia Pacific');
      const label = document.getElementById(group.getAttribute('aria-labelledby') ?? '');
      expect(label?.textContent).toBe('Asia Pacific');
      expect(label?.hidden).toBe(true);
    });

    it('shows SelectEmpty only when nothing matches', async () => {
      const user = userEvent.setup();
      render(<CountrySelect />);
      await open(user);

      expect(screen.queryByText('No countries found')).toBeNull();
      await user.type(screen.getByRole('searchbox'), 'zzz');
      expect(screen.getByText('No countries found')).toBeTruthy();
    });

    it('selects the first match on Enter', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<CountrySelect onValueChange={onValueChange} />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'new{Enter}');

      expect(onValueChange).toHaveBeenCalledWith('new zealand');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    });

    it('ignores Enter while the query is empty', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<CountrySelect onValueChange={onValueChange} />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'b{Backspace}{Enter}');

      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole('listbox')).toBeTruthy();
    });

    it('reveals the search input on the first keystroke and seeds the query', async () => {
      const user = userEvent.setup();
      render(<CountrySelect alwaysVisible={false} />);
      await open(user);

      expect(screen.queryByRole('searchbox')).toBeNull();
      await user.keyboard('c');

      const search = await screen.findByRole('searchbox');
      expect((search as HTMLInputElement).value).toBe('c');
    });

    it('returns focus to the search input from the first visible option', async () => {
      const user = userEvent.setup();
      render(<CountrySelect />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'a');
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).toBe(option('Brazil')));

      await user.keyboard('{ArrowUp}');
      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('searchbox')));
    });

    it('keeps the chosen value in the trigger while a query hides its option', async () => {
      const user = userEvent.setup();
      render(<CountrySelect defaultValue="canada" />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'jap');

      expect(option('Canada').hidden).toBe(true);
      const trigger = screen.getByRole('combobox', { name: 'Country', hidden: true });
      expect(trigger.textContent).toContain('Canada');
    });

    it('clears the query when a controlled select is reopened without onOpenChange', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<CountrySelect open />);
      await screen.findByRole('listbox');

      await user.type(screen.getByRole('searchbox'), 'jap');
      rerender(<CountrySelect open={false} />);
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());

      rerender(<CountrySelect open />);
      await screen.findByRole('listbox');
      expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
      expect(option('Brazil').hidden).toBe(false);
    });

    it('lets consumer props through without overriding managed attributes', async () => {
      const user = userEvent.setup();
      render(
        <Select>
          <SelectTrigger aria-label="Country">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectSearch
              alwaysVisible
              role="textbox"
              data-select-search="nope"
              name="country-search"
            />
            <SelectItem value="japan" hidden={false}>
              Japan
            </SelectItem>
            <SelectItem value="canada">Canada</SelectItem>
          </SelectContent>
        </Select>
      );
      await open(user);

      const search = screen.getByRole('searchbox');
      expect(search.getAttribute('name')).toBe('country-search');
      expect(search.getAttribute('data-select-search')).toBe('');

      await user.type(search, 'can');
      expect(option('Japan').hidden).toBe(true);
    });
  });
});
