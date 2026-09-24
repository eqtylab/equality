import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSearch,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';

function Menu({ onSelect, open }: { onSelect?: (item: string) => void; open?: boolean }) {
  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSearch alwaysVisible placeholder="Search actions..." />
        {['Copy', 'Cut', 'Paste'].map((item) => (
          <DropdownMenuItem key={item} onSelect={() => onSelect?.(item)}>
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  describe('search', () => {
    it('selects the first match on Enter', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<Menu onSelect={onSelect} />);

      screen.getByRole('button', { name: 'Actions' }).focus();
      await user.keyboard('{Enter}');
      await user.type(await screen.findByRole('searchbox'), 'pa{Enter}');

      expect(onSelect).toHaveBeenCalledWith('Paste');
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    });

    it('ignores Enter while the query is empty', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<Menu onSelect={onSelect} />);

      screen.getByRole('button', { name: 'Actions' }).focus();
      await user.keyboard('{Enter}');
      await user.type(await screen.findByRole('searchbox'), 'p{Backspace}{Enter}');

      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.getByRole('menu')).toBeTruthy();
    });

    it('clears the query when a controlled menu is reopened without onOpenChange', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Menu open />);

      await user.type(await screen.findByRole('searchbox'), 'pa');
      expect(screen.queryByRole('menuitem', { name: 'Copy' })).toBeNull();

      rerender(<Menu open={false} />);
      await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
      rerender(<Menu open />);

      expect(((await screen.findByRole('searchbox')) as HTMLInputElement).value).toBe('');
      expect(screen.getByRole('menuitem', { name: 'Copy' })).toBeTruthy();
    });
  });
});
