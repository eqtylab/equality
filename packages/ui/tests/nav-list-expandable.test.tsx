import { createContext, memo, StrictMode, useContext } from 'react';
import { renderToString } from 'react-dom/server';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Badge } from '@/components/badge/badge';
import {
  NavList,
  NavListExpandable,
  NavListExpandableContent,
  NavListExpandableTrigger,
  NavListGroup,
  NavListItem,
} from '@/components/nav-list/nav-list';

function Sidebar({ open }: { open?: boolean }) {
  return (
    <NavList>
      <NavListGroup>
        <NavListExpandable defaultOpen={open}>
          <NavListExpandableTrigger label="Components" prefix={<svg />} />
          <NavListExpandableContent>
            <NavListItem label="Button" href="/components/button" />
            <NavListExpandable>
              <NavListExpandableTrigger label="Forms" />
              <NavListExpandableContent>
                <NavListItem label="Input" href="/components/forms/input" current />
              </NavListExpandableContent>
            </NavListExpandable>
          </NavListExpandableContent>
        </NavListExpandable>
      </NavListGroup>
    </NavList>
  );
}

describe('NavListExpandable', () => {
  it('keeps a closed group’s links in the server HTML', () => {
    const html = renderToString(<Sidebar />);
    expect(html).toContain('href="/components/button"');
    expect(html).toContain('href="/components/forms/input"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(' hidden');
  });

  it('renders a group that starts open as open from the server', () => {
    const html = renderToString(<Sidebar open />);
    expect(html).toMatch(/<li[^>]*data-state="open"/);
    expect(html).toContain('aria-expanded="true"');
  });

  it('names the content it controls and toggles it', async () => {
    const onOpenChange = vi.fn();
    render(
      <NavList>
        <NavListGroup>
          <NavListExpandable onOpenChange={onOpenChange}>
            <NavListExpandableTrigger label="Components" />
            <NavListExpandableContent>
              <NavListItem label="Button" href="#button" />
            </NavListExpandableContent>
          </NavListExpandable>
        </NavListGroup>
      </NavList>
    );
    const trigger = screen.getByRole('button', { name: 'Components' });
    const content = document.getElementById(trigger.getAttribute('aria-controls') ?? '');
    expect(content?.contains(screen.getByRole('link', { name: 'Button' }))).toBe(true);

    await userEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.closest('li')?.dataset.state).toBe('open');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('reads a status in the header’s suffix out with its label', () => {
    render(
      <NavList>
        <NavListGroup>
          <NavListExpandable>
            <NavListExpandableTrigger label="Forms" prefix={<svg />} suffix={<Badge>Beta</Badge>} />
            <NavListExpandableContent>
              <NavListItem label="Input" href="#input" />
            </NavListExpandableContent>
          </NavListExpandable>
        </NavListGroup>
      </NavList>
    );
    expect(screen.getByRole('button', { name: /^Forms\s*Beta$/ })).toBeTruthy();
  });

  it('nests each group’s rows one level deeper', () => {
    const { container } = render(<Sidebar open />);
    const depths = [...container.querySelectorAll('ul')].map((list) => list.dataset.depth);
    expect(depths).toEqual(['0', '1', '2']);
  });
});

function RoutedSidebar({ current }: { current: string }) {
  const row = (id: string) => ({ href: `/${id}`, current: current === id });
  return (
    <NavList>
      <NavListGroup>
        <NavListItem label="Home" {...row('home')} />
        <NavListExpandable>
          <NavListExpandableTrigger label="Components" />
          <NavListExpandableContent>
            <NavListItem label="Button" {...row('button')} />
            <NavListExpandable>
              <NavListExpandableTrigger label="Forms" />
              <NavListExpandableContent>
                <NavListItem label="Input" {...row('input')} />
              </NavListExpandableContent>
            </NavListExpandable>
          </NavListExpandableContent>
        </NavListExpandable>
      </NavListGroup>
    </NavList>
  );
}

const expanded = (name: string) =>
  screen.getByRole('button', { name }).getAttribute('aria-expanded');

describe('NavListExpandable when the current page changes without a reload', () => {
  it('opens every folder around the new current page', () => {
    const { rerender } = render(<RoutedSidebar current="home" />);
    expect(expanded('Components')).toBe('false');

    rerender(<RoutedSidebar current="input" />);
    expect(expanded('Components')).toBe('true');
    expect(expanded('Forms')).toBe('true');
  });

  it('stays open when the current page leaves it', () => {
    const { rerender } = render(<RoutedSidebar current="button" />);
    rerender(<RoutedSidebar current="home" />);
    expect(expanded('Components')).toBe('true');
  });

  it('stays closed after the reader closes it, until the next page inside it', async () => {
    const { rerender } = render(<RoutedSidebar current="button" />);
    await userEvent.click(screen.getByRole('button', { name: 'Components' }));
    expect(expanded('Components')).toBe('false');

    rerender(<RoutedSidebar current="button" />);
    expect(expanded('Components')).toBe('false');

    rerender(<RoutedSidebar current="input" />);
    expect(expanded('Components')).toBe('true');
  });

  it('reopens when the reader leaves and comes back to the same page', async () => {
    const { rerender } = render(<RoutedSidebar current="button" />);
    await userEvent.click(screen.getByRole('button', { name: 'Components' }));
    rerender(<RoutedSidebar current="home" />);
    rerender(<RoutedSidebar current="button" />);
    expect(expanded('Components')).toBe('true');
  });

  it('stays closed when its rows remount on the same page', async () => {
    const Keyed = ({ version }: { version: number }) => (
      <NavList>
        <NavListGroup>
          <NavListExpandable defaultOpen>
            <NavListExpandableTrigger label="Components" />
            <NavListExpandableContent>
              <NavListItem key={version} label="Button" href="/button" current />
            </NavListExpandableContent>
          </NavListExpandable>
        </NavListGroup>
      </NavList>
    );
    const { rerender } = render(<Keyed version={1} />);
    await userEvent.click(screen.getByRole('button', { name: 'Components' }));
    rerender(<Keyed version={2} />);
    expect(expanded('Components')).toBe('false');
  });

  it('opens without its transition while it mounts, and keeps it for later opens', async () => {
    const { rerender } = render(<RoutedSidebar current="input" />);
    const folder = screen.getByRole('button', { name: 'Components' }).closest('li');
    expect(folder?.hasAttribute('data-instant')).toBe(true);

    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    expect(folder?.hasAttribute('data-instant')).toBe(false);

    await userEvent.click(screen.getByRole('button', { name: 'Components' }));
    rerender(<RoutedSidebar current="button" />);
    expect(expanded('Components')).toBe('true');
    expect(folder?.hasAttribute('data-instant')).toBe(false);
  });

  it('asks a controlled folder to open once, however many rows ask', () => {
    const onOpenChange = vi.fn();
    render(
      <StrictMode>
        <NavList>
          <NavListGroup>
            <NavListExpandable open={false} onOpenChange={onOpenChange}>
              <NavListExpandableTrigger label="Components" />
              <NavListExpandableContent>
                <NavListItem label="Button" href="/button" current />
                <NavListItem label="Input" href="/input" current />
              </NavListExpandableContent>
            </NavListExpandable>
          </NavListGroup>
        </NavList>
      </StrictMode>
    );
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('asks again on the next page when a controlled folder refused without re-rendering', async () => {
    const onOpenChange = vi.fn();
    const CurrentPage = createContext('');
    const Row = ({ id }: { id: string }) => (
      <NavListItem label={id} href={`/${id}`} current={useContext(CurrentPage) === id} />
    );
    const Folder = memo(() => (
      <NavListExpandable open={false} onOpenChange={onOpenChange}>
        <NavListExpandableTrigger label="Components" />
        <NavListExpandableContent>
          <Row id="button" />
          <Row id="input" />
        </NavListExpandableContent>
      </NavListExpandable>
    ));
    const Sidebar = ({ current }: { current: string }) => (
      <CurrentPage.Provider value={current}>
        <NavList>
          <NavListGroup>
            <Folder />
          </NavListGroup>
        </NavList>
      </CurrentPage.Provider>
    );
    const { rerender } = render(<Sidebar current="home" />);
    await act(() => new Promise((resolve) => requestAnimationFrame(resolve)));
    rerender(<Sidebar current="button" />);
    rerender(<Sidebar current="input" />);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it('asks a controlled folder to open instead of opening it', () => {
    const onOpenChange = vi.fn();
    const Controlled = ({ current }: { current: boolean }) => (
      <NavList>
        <NavListGroup>
          <NavListExpandable open={false} onOpenChange={onOpenChange}>
            <NavListExpandableTrigger label="Components" />
            <NavListExpandableContent>
              <NavListItem label="Button" href="/button" current={current} />
            </NavListExpandableContent>
          </NavListExpandable>
        </NavListGroup>
      </NavList>
    );
    const { rerender } = render(<Controlled current={false} />);
    rerender(<Controlled current />);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(expanded('Components')).toBe('false');

    rerender(<Controlled current={false} />);
    rerender(<Controlled current />);
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });
});
