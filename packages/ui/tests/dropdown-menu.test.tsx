import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Dialog, DialogContainer, DialogTitle } from '@/components/dialog/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuItem,
  DropdownMenuSearch,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  useDropdownMenuSearchQuery,
} from '@/components/dropdown-menu/dropdown-menu';

type Props = {
  onSelect?: (item: string) => void;
  open?: boolean;
  alwaysVisible?: boolean;
};

function Menu({ onSelect, open, alwaysVisible }: Props) {
  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSearch alwaysVisible={alwaysVisible} placeholder="Search actions..." />
        {['Copy', 'Cut', 'Paste'].map((item) => (
          <DropdownMenuItem key={item} onSelect={() => onSelect?.(item)}>
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MenuWithPersistentItem({ onSelect }: Pick<Props, 'onSelect'>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSearch placeholder="Search actions..." />
        <DropdownMenuEmpty>No actions found</DropdownMenuEmpty>
        <DropdownMenuItem persistent onSelect={() => onSelect?.('Create')}>
          Create
        </DropdownMenuItem>
        <DropdownMenuSeparator persistent data-testid="persistent-separator" />
        {['Copy', 'Cut'].map((item) => (
          <DropdownMenuItem key={item} onSelect={() => onSelect?.(item)}>
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function QueryProbe() {
  const { query, isSearching, matches } = useDropdownMenuSearchQuery();
  return (
    <output data-testid="probe">
      {`${query}|${isSearching}|${matches('Copy')}|${matches('Paste')}`}
    </output>
  );
}

const open = async (user: ReturnType<typeof userEvent.setup>) => {
  screen.getByRole('button', { name: 'Actions' }).focus();
  await user.keyboard('{Enter}');
  return screen.findByRole('menu');
};

describe('DropdownMenu', () => {
  describe('search', () => {
    it('shows and focuses the search input on open by default', async () => {
      const user = userEvent.setup();
      render(<Menu />);
      await open(user);

      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('searchbox')));
    });

    it('reveals the search input on the first keystroke and seeds the query', async () => {
      const user = userEvent.setup();
      render(<Menu alwaysVisible={false} />);
      await open(user);

      expect(screen.queryByRole('searchbox')).toBeNull();
      await user.keyboard('a');

      const search = await screen.findByRole('searchbox');
      expect((search as HTMLInputElement).value).toBe('a');
      await waitFor(() => expect(document.activeElement).toBe(search));
      expect(screen.queryByRole('menuitem', { name: 'Copy' })).toBeNull();
    });

    it('takes focus back when the menu itself is focused before any interaction', async () => {
      const user = userEvent.setup();
      render(<Menu />);
      await open(user);
      const search = screen.getByRole('searchbox');
      await waitFor(() => expect(document.activeElement).toBe(search));

      act(() => screen.getByRole('menu').focus());

      await waitFor(() => expect(document.activeElement).toBe(search));
    });

    it('selects the first match on Enter', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<Menu onSelect={onSelect} />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'pa{Enter}');

      expect(onSelect).toHaveBeenCalledWith('Paste');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });

    it('ignores Enter while the query is empty', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<Menu onSelect={onSelect} />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'p{Backspace}{Enter}');

      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.getByRole('menu')).toBeTruthy();
    });

    it('returns focus to the search input from the first visible item', async () => {
      const user = userEvent.setup();
      render(<Menu />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'c');
      await user.keyboard('{ArrowDown}');
      await waitFor(() =>
        expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Copy' }))
      );

      await user.keyboard('{ArrowUp}');
      await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('searchbox')));
    });

    it('keeps editing the query with Backspace while an item is focused', async () => {
      const user = userEvent.setup();
      render(<Menu />);
      await open(user);
      const search = screen.getByRole('searchbox');

      await user.type(search, 'cu');
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(document.activeElement).not.toBe(search));

      await user.keyboard('{Backspace}');

      expect((search as HTMLInputElement).value).toBe('c');
      await waitFor(() => expect(document.activeElement).toBe(search));
    });

    it('clears the query when a controlled menu is reopened without onOpenChange', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Menu open />);
      await screen.findByRole('menu');

      await user.type(screen.getByRole('searchbox'), 'pa');
      expect(screen.queryByRole('menuitem', { name: 'Copy' })).toBeNull();

      rerender(<Menu open={false} />);
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      rerender(<Menu open />);

      expect(((await screen.findByRole('searchbox')) as HTMLInputElement).value).toBe('');
      expect(screen.getByRole('menuitem', { name: 'Copy' })).toBeTruthy();
    });

    it('focuses the search when opened inside a dialog', async () => {
      const user = userEvent.setup();
      render(
        <Dialog open>
          <DialogContainer aria-describedby={undefined}>
            <DialogTitle>Edit</DialogTitle>
            <Menu />
          </DialogContainer>
        </Dialog>
      );

      await user.click(screen.getByRole('button', { name: 'Actions' }));

      const searchbox = await screen.findByRole('searchbox');
      await waitFor(() => expect(document.activeElement).toBe(searchbox));
    });
  });

  describe('persistent items', () => {
    it('stay visible while searching without counting as a match', async () => {
      const user = userEvent.setup();
      render(<MenuWithPersistentItem />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'zzz');

      expect(screen.getByRole('menuitem', { name: 'Create' })).toBeTruthy();
      expect(screen.queryByRole('menuitem', { name: 'Copy' })).toBeNull();
      expect(screen.getByText('No actions found')).toBeTruthy();
    });

    it('are skipped by Enter, which picks the first match instead', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<MenuWithPersistentItem onSelect={onSelect} />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'cu{Enter}');

      expect(onSelect).toHaveBeenCalledWith('Cut');
      expect(onSelect).not.toHaveBeenCalledWith('Create');
    });

    it('keep a persistent separator while searching', async () => {
      const user = userEvent.setup();
      render(<MenuWithPersistentItem />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'cu');

      expect(screen.getByTestId('persistent-separator')).toBeTruthy();
    });

    it('are left out of the announced result count', async () => {
      const user = userEvent.setup();
      render(<MenuWithPersistentItem />);
      await open(user);

      await user.type(screen.getByRole('searchbox'), 'c');

      expect(screen.getByText('2 results available')).toBeTruthy();
    });
  });

  describe('useDropdownMenuSearchQuery', () => {
    it('exposes the query and matches text the way items do', async () => {
      const user = userEvent.setup();
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSearch placeholder="Search actions..." />
            <QueryProbe />
          </DropdownMenuContent>
        </DropdownMenu>
      );
      await open(user);

      await user.type(screen.getByRole('searchbox'), ' CO ');

      expect(screen.getByTestId('probe').textContent).toBe(' CO |true|true|false');
    });

    it('throws outside a DropdownMenu', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<QueryProbe />)).toThrow(
        'useDropdownMenuSearchQuery must be used within a DropdownMenu'
      );
      vi.restoreAllMocks();
    });
  });
});
