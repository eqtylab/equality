import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Checkbox } from '@/components/checkbox/checkbox';
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
  TableRowAction,
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

describe('clicks on controls inside a clickable TableRow', () => {
  function ControlsRow({ onOpen }: { onOpen: () => void }) {
    return (
      <TableContainer>
        <TableBody>
          <TableRow clickable onClick={onOpen}>
            <TableCell>
              <label>
                Include
                <input type="checkbox" />
              </label>
            </TableCell>
            <TableCell>
              <select aria-label="Role">
                <option>Admin</option>
                <option>User</option>
              </select>
            </TableCell>
            <TableCell>
              <div role="switch" aria-checked="false" aria-label="Enabled" tabIndex={0} />
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );
  }

  it("don't open the row", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ControlsRow onOpen={onOpen} />);

    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByText('Include'));
    await user.selectOptions(screen.getByRole('combobox'), 'User');
    await user.click(screen.getByRole('switch'));
    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe('TableRow with href and onClick', () => {
  function LinkedRow({ onOpen }: { onOpen: (event: React.MouseEvent) => void }) {
    return (
      <TableContainer>
        <TableBody>
          <TableRow clickable href="/agents/alice" onClick={onOpen}>
            <TableCell>
              <TableRowAction>Alice</TableRowAction>
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );
  }

  it('runs onClick in place of following the link on a plain click', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn((event: React.MouseEvent) => event.defaultPrevented);
    render(<LinkedRow onOpen={onOpen} />);

    await user.click(screen.getByRole('link', { name: 'Alice' }));
    expect(onOpen).toHaveReturnedWith(true);
  });

  it('leaves a modified click to the browser, so it opens a new tab', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<LinkedRow onOpen={onOpen} />);
    const link = screen.getByRole('link', { name: 'Alice' });
    let prevented: boolean | undefined;
    link.addEventListener('click', (event) => {
      queueMicrotask(() => (prevented = event.defaultPrevented));
    });

    await user.keyboard('{Meta>}');
    await user.click(link);
    await user.keyboard('{/Meta}');
    expect(onOpen).not.toHaveBeenCalled();
    expect(prevented).toBe(false);
  });

  it('opens on Enter', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<LinkedRow onOpen={onOpen} />);

    act(() => screen.getByRole('link', { name: 'Alice' }).focus());
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledOnce();
  });
});

describe('TableRowAction', () => {
  function ActionTable({
    href,
    onOpen = () => {},
  }: {
    href?: (name: string) => string;
    onOpen?: (name: string) => void;
  }) {
    return (
      <>
        <button>Before</button>
        <TableContainer>
          <TableBody>
            {NAMES.map((name) => (
              <TableRow
                key={name}
                clickable
                href={href?.(name)}
                onClick={() => onOpen(name)}
                data-testid={name}
              >
                <TableCell>
                  <TableRowAction>{name}</TableRowAction>
                </TableCell>
                <TableCell>
                  <button>{`Copy ${name}`}</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </>
    );
  }

  it("is the row's link when the row has an href, named by its own text", () => {
    render(<ActionTable href={(name) => `/people/${name}`} />);

    const link = screen.getByRole('link', { name: 'Alice' });
    expect(link.getAttribute('href')).toBe('/people/Alice');
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('is a button when the row has only onClick, and opens the row on Enter and Space', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ActionTable onOpen={onOpen} />);

    act(() => screen.getByRole('button', { name: 'Alice' }).focus());
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenNthCalledWith(1, 'Alice');
  });

  it("takes the row's tab stop and moves between rows with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<ActionTable href={(name) => `/people/${name}`} />);

    expect(screen.getByTestId('Alice').hasAttribute('tabindex')).toBe(false);
    expect(screen.getByRole('link', { name: 'Alice' }).getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('link', { name: 'Bob' }).getAttribute('tabindex')).toBe('-1');

    screen.getByText('Before').focus();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Alice' }));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Bob' }));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByRole('link', { name: 'Charlie' }));
  });

  it('styles the row as clickable without the clickable prop', () => {
    render(
      <TableContainer>
        <TableBody>
          <TableRow onClick={() => {}} data-testid="row">
            <TableCell>
              <TableRowAction>Alice</TableRowAction>
            </TableCell>
          </TableRow>
        </TableBody>
      </TableContainer>
    );

    expect(screen.getByTestId('row').className).toMatch(/table-row--clickable/);
  });

  it('opens the row when clicked', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ActionTable onOpen={onOpen} />);

    await user.click(screen.getByRole('button', { name: 'Bob' }));
    await user.click(screen.getByRole('button', { name: 'Copy Bob' }));
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('Bob');
  });
});

describe('a TableRow with an href and no TableRowAction', () => {
  it('puts only one row link in the tab order', () => {
    render(
      <TableContainer>
        <TableBody>
          {NAMES.map((name) => (
            <TableRow key={name} href={`/people/${name}`} hrefLabel={`Open ${name}`}>
              <TableCell>{name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    );

    expect(screen.getByRole('link', { name: 'Open Alice' }).getAttribute('tabindex')).toBe('0');
    expect(screen.getByRole('link', { name: 'Open Bob' }).getAttribute('tabindex')).toBe('-1');
  });
});

describe('a TableRow with a selection checkbox', () => {
  it('stays reachable from the keyboard when it opens on click', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <TableContainer>
        <TableBody>
          {NAMES.map((name) => (
            <TableRow key={name} clickable onClick={() => onOpen(name)} data-testid={name}>
              <TableCell>
                <Checkbox aria-label={`Select ${name}`} />
              </TableCell>
              <TableCell>{name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    );

    expect(screen.getByTestId('Alice').getAttribute('tabindex')).toBe('0');
    act(() => screen.getByTestId('Alice').focus());
    await user.keyboard('{Enter}');
    expect(onOpen).toHaveBeenCalledExactlyOnceWith('Alice');

    await user.click(screen.getByRole('checkbox', { name: 'Select Bob' }));
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
