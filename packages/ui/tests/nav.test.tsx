import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NavPanel } from '@/components/nav/nav-panel';
import { NavRail, NavRailItem } from '@/components/nav/nav-rail';
import { NavSwitcher, NavSwitcherPlaceholder } from '@/components/nav/nav-switcher';
import { blockClosedTypeahead } from '@/components/nav/select-typeahead';

const OPTIONS = [
  { value: 'ben', label: 'Ben Project' },
  { value: 'ada', label: 'Ada Project' },
];

describe('Nav shell', () => {
  it('server-renders the rail, panel and switcher placeholder', () => {
    const html = renderToString(
      <>
        <NavRail aria-label="Main">
          <NavRailItem icon={<svg />} label="Projects" href="/projects" current />
        </NavRail>
        <NavPanel
          aria-label="Project"
          header={<NavSwitcherPlaceholder>Loading</NavSwitcherPlaceholder>}
        >
          <p>rows</p>
        </NavPanel>
      </>
    );
    expect(html).toContain('aria-label="Main"');
    expect(html).toContain('href="/projects"');
    expect(html).toContain('Loading');
    expect(html).toContain('data-menu-scroller');
  });

  it('names the panel landmark and shows title as a heading', () => {
    render(<NavPanel aria-label="Settings" title="Organisation settings" />);
    expect(screen.getByRole('navigation', { name: 'Settings' })).toBeTruthy();
    const heading = screen.getByRole('heading', { name: 'Organisation settings' });
    expect(heading.getAttribute('title')).toBe('Organisation settings');
  });

  it('marks the current rail item and names it by label', () => {
    render(
      <NavRail aria-label="Main">
        <NavRailItem icon={<svg />} label="Projects" href="/projects" current />
        <NavRailItem icon={<svg />} label="Agents" href="/agents" />
      </NavRail>
    );
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Projects' }).getAttribute('aria-current')).toBe(
      'page'
    );
    expect(screen.getByRole('link', { name: 'Agents' }).hasAttribute('aria-current')).toBe(false);
  });

  it('renders the rail item as its child with asChild', () => {
    render(
      <NavRail aria-label="Main">
        <NavRailItem icon={<svg />} label="Projects" asChild>
          <a href="/projects" data-router-link="" />
        </NavRailItem>
      </NavRail>
    );
    expect(screen.getByRole('link', { name: 'Projects' }).hasAttribute('data-router-link')).toBe(
      true
    );
  });

  it('marks its scroller with data-menu-scroller', () => {
    render(
      <NavPanel aria-label="Project">
        <p>rows</p>
      </NavPanel>
    );
    const scroller = screen.getByText('rows').parentElement!;
    expect(scroller.hasAttribute('data-menu-scroller')).toBe(true);
    expect(screen.getByRole('navigation').contains(scroller)).toBe(true);
  });

  it('renders a plain heading when there is one option and no action', () => {
    render(
      <NavSwitcher
        label="Ben Project"
        noun="project"
        collection="projects"
        options={[OPTIONS[0]]}
        value="ben"
        onValueChange={() => {}}
      />
    );
    expect(screen.getByRole('heading', { name: 'Ben Project' })).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('names the switcher trigger by the label and what it does', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <NavSwitcher
        ref={ref}
        label="Ben Project"
        noun="project"
        collection="projects"
        options={OPTIONS}
        value="ben"
        onValueChange={() => {}}
      />
    );
    const trigger = screen.getByRole('combobox', { name: 'Ben Project, switch project' });
    expect(ref.current).toBe(trigger);
    expect(screen.getByRole('heading', { name: 'Ben Project' })).toBeTruthy();
  });

  it('blockClosedTypeahead prevents letters but not Space or shortcuts', () => {
    const onKeyDown = vi.fn(blockClosedTypeahead);
    render(
      <button type="button" onKeyDown={onKeyDown}>
        trigger
      </button>
    );
    const button = screen.getByRole('button');
    const press = (init: KeyboardEventInit) => {
      fireEvent.keyDown(button, init);
      return (onKeyDown.mock.lastCall![0] as React.KeyboardEvent).defaultPrevented;
    };
    expect(press({ key: 'a' })).toBe(true);
    expect(press({ key: ' ' })).toBe(false);
    expect(press({ key: 'Enter' })).toBe(false);
    expect(press({ key: 'a', ctrlKey: true })).toBe(false);
    expect(press({ key: 'a', metaKey: true })).toBe(false);
    expect(press({ key: 'a', altKey: true })).toBe(false);
  });
});
