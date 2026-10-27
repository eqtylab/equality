import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NavPanel } from '@/components/nav/nav-panel';
import { NavRail, NavRailItem } from '@/components/nav/nav-rail';
import { NavSwitcher } from '@/components/nav/nav-switcher';

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
        <NavPanel aria-label="Project" header={<NavSwitcher loading />}>
          <p>rows</p>
        </NavPanel>
      </>
    );
    expect(html).toContain('aria-label="Main"');
    expect(html).toContain('href="/projects"');
    expect(html).toMatch(/skeleton/);
    expect(html).toContain('data-nav-scroller');
  });

  it('marks the loading switcher busy and says so to screen readers', () => {
    const { container } = render(<NavSwitcher loading />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.getByText('Loading')).toBeTruthy();
  });

  it('names the panel landmark and draws no heading of its own', () => {
    // @ts-expect-error NavPanel takes no title; a heading goes in header
    render(<NavPanel aria-label="Settings" title="Organisation settings" />);
    expect(screen.getByRole('navigation', { name: 'Settings' })).toBeTruthy();
    expect(screen.queryByRole('heading')).toBeNull();
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

  it('requires href unless the rail item is asChild', () => {
    // @ts-expect-error without href the <a> takes no focus and is not a link
    const item = <NavRailItem icon={<svg />} label="Projects" />;
    expect(item).toBeTruthy();
  });

  it('marks its scroller with data-nav-scroller', () => {
    render(
      <NavPanel aria-label="Project">
        <p>rows</p>
      </NavPanel>
    );
    const scroller = screen.getByText('rows').parentElement!;
    expect(scroller.hasAttribute('data-nav-scroller')).toBe(true);
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
});
