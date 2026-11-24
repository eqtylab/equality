import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/dropdown-menu/dropdown-menu';
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/table/table-components';

const NAMES = ['Alice', 'Bob', 'Charlie'];

function ClickableTable({
  names = NAMES,
  onOpen = () => {},
  onMenuSelect = () => {},
  onCopy = () => {},
  actions = true,
}: {
  names?: string[];
  actions?: boolean;
  onOpen?: (name: string) => void;
  onMenuSelect?: (name: string) => void;
  onCopy?: (name: string) => void;
}) {
  return (
    <>
      <button>Before</button>
      <TableContainer columns="1fr auto">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {names.map((name) => (
            <TableRow key={name} clickable onClick={() => onOpen(name)} data-testid={name}>
              <TableCell>{name}</TableCell>
              <TableCell>
                {actions && <button onClick={() => onCopy(name)}>{`Copy ${name}`}</button>}
                {actions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>{`${name} actions`}</DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => onMenuSelect(name)}>
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
      <button>After</button>
    </>
  );
}

describe('clickable TableRow', () => {
  it('puts only the first clickable row in the tab order', async () => {
    const user = userEvent.setup();
    render(<ClickableTable />);

    expect(screen.getByTestId('Alice').getAttribute('tabindex')).toBe('0');
    expect(screen.getByTestId('Bob').getAttribute('tabindex')).toBe('-1');
    expect(screen.getByTestId('Charlie').getAttribute('tabindex')).toBe('-1');

    screen.getByText('Before').focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId('Alice'));
  });

  it('opens the focused row on Enter', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ClickableTable onOpen={onOpen} />);

    screen.getByTestId('Bob').focus();
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('Bob');
  });

  it('moves focus between rows with the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    render(<ClickableTable />);

    screen.getByTestId('Alice').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByTestId('Bob'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByTestId('Charlie'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByTestId('Charlie'));
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(screen.getByTestId('Bob'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(screen.getByTestId('Alice'));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByTestId('Charlie'));
  });

  it('keeps the tab stop on the last focused row, so one Tab leaves the table', async () => {
    const user = userEvent.setup();
    render(<ClickableTable actions={false} />);

    screen.getByTestId('Alice').focus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('Bob').getAttribute('tabindex')).toBe('0');
    expect(screen.getByTestId('Alice').getAttribute('tabindex')).toBe('-1');

    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('After'));

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByTestId('Bob'));
  });

  it('moves the tab stop to the first row when the focused row is removed', () => {
    const { rerender } = render(<ClickableTable />);

    act(() => screen.getByTestId('Charlie').focus());
    expect(screen.getByTestId('Charlie').getAttribute('tabindex')).toBe('0');

    rerender(<ClickableTable names={['Alice', 'Bob']} />);
    expect(screen.getByTestId('Alice').getAttribute('tabindex')).toBe('0');
  });

  it("leaves a button's keys to the button", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onCopy = vi.fn();
    render(<ClickableTable onOpen={onOpen} onCopy={onCopy} />);

    screen.getByText('Copy Alice').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByText('Copy Alice'));
    await user.keyboard('{Enter}');
    expect(onCopy).toHaveBeenCalledExactlyOnceWith('Alice');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("doesn't open or move rows from a menu opened inside the row", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onMenuSelect = vi.fn();
    render(<ClickableTable onOpen={onOpen} onMenuSelect={onMenuSelect} />);

    screen.getByText('Alice actions').focus();
    await user.keyboard('{Enter}');
    const rename = await screen.findByRole('menuitem', { name: 'Rename' });
    expect(document.activeElement).toBe(rename);

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Delete' }));
    await user.keyboard('{ArrowUp}{Enter}');

    expect(onMenuSelect).toHaveBeenCalledExactlyOnceWith('Alice');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("doesn't open the row when a menu item inside it is clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ClickableTable onOpen={onOpen} />);

    await user.click(screen.getByText('Alice actions'));
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('opens on click', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ClickableTable onOpen={onOpen} />);

    await user.click(screen.getByText('Charlie'));
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('Charlie');
  });

  it("doesn't make a row focusable without onClick", () => {
    function Selectable() {
      const [selected, setSelected] = useState(false);
      return (
        <TableContainer>
          <TableBody>
            <TableRow clickable data-testid="plain">
              <TableCell>Plain</TableCell>
            </TableRow>
            <TableRow data-testid="unstyled" onClick={() => setSelected(!selected)}>
              <TableCell>Unstyled</TableCell>
            </TableRow>
          </TableBody>
        </TableContainer>
      );
    }
    render(<Selectable />);

    expect(screen.getByTestId('plain').hasAttribute('tabindex')).toBe(false);
    expect(screen.getByTestId('unstyled').hasAttribute('tabindex')).toBe(false);
  });
});
