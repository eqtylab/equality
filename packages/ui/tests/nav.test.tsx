import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

  it('renders a plain heading when there are no options and no action', () => {
    render(
      <NavSwitcher
        label="Ben Project"
        noun="project"
        collection="projects"
        options={[]}
        value="ben"
        onValueChange={() => {}}
      />
    );
    expect(screen.getByRole('heading', { name: 'Ben Project' })).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('stays a switcher with one option', () => {
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
    expect(screen.getByRole('combobox', { name: 'Ben Project, switch project' })).toBeTruthy();
  });

  it('offers Retry after a failed list and keeps the list open when it is picked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const onValueChange = vi.fn();
    render(
      <NavSwitcher
        label="Ben Project"
        noun="project"
        collection="projects"
        options={[]}
        value="ben"
        onValueChange={onValueChange}
        error
        onRetry={onRetry}
      />
    );
    screen.getByRole('combobox', { name: 'Ben Project, switch project' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    const message = screen.getByText("Couldn't load projects.");
    expect(screen.getByText('Retry')).toBeTruthy();
    expect(screen.queryByText('No projects found')).toBeNull();
    expect(screen.getByPlaceholderText('Search projects...').getAttribute('aria-describedby')).toBe(
      message.id
    );

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('keeps the list open when Retry is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <NavSwitcher
        label="Ben Project"
        noun="project"
        collection="projects"
        options={[]}
        value="ben"
        onValueChange={() => {}}
        error
        onRetry={onRetry}
      />
    );
    await user.click(screen.getByRole('combobox', { name: 'Ben Project, switch project' }));
    await screen.findByRole('listbox');
    await user.click(screen.getByText('Retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('still closes on Escape after a Retry pick that the list never closes for', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <form>
        <NavSwitcher
          label="Ben Project"
          noun="project"
          collection="projects"
          options={[]}
          value="ben"
          onValueChange={() => {}}
          error
          onRetry={onRetry}
        />
      </form>
    );
    screen.getByRole('combobox', { name: 'Ben Project, switch project' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    const select = document.querySelector('select')!;
    fireEvent.change(select, { target: { value: select.options[0]?.value } });
    expect(onRetry).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('reads Retrying, marks Retry unavailable and ignores it while a retry is in flight', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <NavSwitcher
        label="Ben Project"
        noun="project"
        collection="projects"
        options={[]}
        value="ben"
        onValueChange={() => {}}
        error
        retrying
        onRetry={onRetry}
      />
    );
    screen.getByRole('combobox', { name: 'Ben Project, switch project' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    const row = screen.getByText('Retrying...').closest('[role="option"]')!;
    expect(row.getAttribute('aria-disabled')).toBe('true');

    await user.keyboard('{ArrowDown}{Enter}');
    expect(onRetry).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox')).toBeTruthy();
  });

  it('announces a retry and its result to screen readers', async () => {
    const user = userEvent.setup();
    const props = {
      label: 'Ben Project',
      noun: 'project',
      collection: 'projects',
      value: 'ben',
      onValueChange: () => {},
    };
    const { rerender } = render(<NavSwitcher {...props} options={[]} error onRetry={() => {}} />);
    screen.getByRole('combobox', { name: 'Ben Project, switch project' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    const announced = (text: string) => screen.getByText(text, { selector: '[role="status"]' });

    rerender(<NavSwitcher {...props} options={[]} error retrying onRetry={() => {}} />);
    expect(announced('Retrying...')).toBeTruthy();
    rerender(<NavSwitcher {...props} options={[]} error onRetry={() => {}} />);
    expect(announced("Couldn't load projects.")).toBeTruthy();
    rerender(<NavSwitcher {...props} options={OPTIONS} />);
    expect(announced('Loaded projects.')).toBeTruthy();

    await user.keyboard('{ArrowDown}');
    expect(document.activeElement?.getAttribute('role')).toBe('option');
  });

  it('lists the loaded options beside Retry and says when a search matches none', async () => {
    const user = userEvent.setup();
    render(
      <NavSwitcher
        label="Ben Project"
        noun="project"
        collection="projects"
        options={OPTIONS}
        value="ben"
        onValueChange={() => {}}
        error
        onRetry={() => {}}
      />
    );
    screen.getByRole('combobox', { name: 'Ben Project, switch project' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');
    expect(screen.getByText('Retry')).toBeTruthy();
    expect(screen.getByText('Ada Project')).toBeTruthy();

    await user.type(screen.getByPlaceholderText('Search projects...'), 'zzz');
    expect(screen.getByText('No projects found')).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('announces nothing when a list that never failed refetches', async () => {
    const user = userEvent.setup();
    const props = {
      label: 'Ben Project',
      noun: 'project',
      collection: 'projects',
      options: OPTIONS,
      value: 'ben',
      onValueChange: () => {},
      onRetry: () => {},
    };
    const { rerender } = render(<NavSwitcher {...props} error={false} />);
    screen.getByRole('combobox', { name: 'Ben Project, switch project' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');

    rerender(<NavSwitcher {...props} error={false} retrying />);
    rerender(<NavSwitcher {...props} error={false} />);
    expect(screen.queryByText('Loaded projects.')).toBeNull();
  });

  it('keeps the list open when a retry finds nothing, and goes plain once it closes', async () => {
    const user = userEvent.setup();
    const props = {
      label: 'Ben Project',
      noun: 'project',
      collection: 'projects',
      options: [],
      value: 'ben',
      onValueChange: () => {},
    };
    const { rerender } = render(<NavSwitcher {...props} error onRetry={() => {}} />);
    screen.getByRole('combobox', { name: 'Ben Project, switch project' }).focus();
    await user.keyboard('{Enter}');
    await screen.findByRole('listbox');

    rerender(<NavSwitcher {...props} />);
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(screen.getByText('No projects found')).toBeTruthy();
    expect(screen.getByText('No projects found.', { selector: '[role="status"]' })).toBeTruthy();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Ben Project' })).toBeTruthy();

    rerender(<NavSwitcher {...props} options={OPTIONS} />);
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('never retries from a closed list inside a form', () => {
    const onRetry = vi.fn();
    render(
      <form>
        <NavSwitcher
          label="Ben Project"
          noun="project"
          collection="projects"
          options={[]}
          value="ben"
          onValueChange={() => {}}
          error
          onRetry={onRetry}
        />
      </form>
    );
    const select = document.querySelector('select')!;
    fireEvent.change(select, { target: { value: select.options[0]?.value } });
    expect(onRetry).not.toHaveBeenCalled();
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
