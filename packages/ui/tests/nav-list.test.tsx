import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Badge } from '@/components/badge/badge';
import { NavDrillContext } from '@/components/nav-list/nav-drill-context';
import {
  NavList,
  NavListGroup,
  NavListItem,
  NavListSeparator,
} from '@/components/nav-list/nav-list';

function withDrill(ui: React.ReactNode, requestDrill = vi.fn(), leaving = false) {
  return {
    requestDrill,
    ...render(
      <NavDrillContext.Provider value={{ requestDrill, leaving }}>{ui}</NavDrillContext.Provider>
    ),
  };
}

describe('NavList rows', () => {
  it('server-renders every row part', () => {
    const html = renderToString(
      <NavList>
        <NavListGroup label="Pages">
          <NavListItem label="Home" href="/" prefix={<svg />} suffix={<Badge>3</Badge>} current />
          <NavListItem label="Policies" drill="policies" />
        </NavListGroup>
        <NavListSeparator />
      </NavList>
    );
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('data-drill="policies"');
    expect(html).toContain('<hr');
  });

  it('renders a link with href, the child with asChild, and a button otherwise', () => {
    render(
      <NavList>
        <NavListGroup>
          <NavListItem label="Home" href="/home" />
          <NavListItem label="Docs" asChild>
            <a href="/docs" data-router-link="" />
          </NavListItem>
          <NavListItem label="Settings" />
        </NavListGroup>
      </NavList>
    );
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/home');
    const docs = screen.getByRole('link', { name: 'Docs' });
    expect(docs.hasAttribute('data-router-link')).toBe(true);
    expect(docs.getAttribute('data-slot')).toBe('nav-list-item');
    const settings = screen.getByRole('button', { name: 'Settings' });
    expect(settings.getAttribute('type')).toBe('button');
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('marks the current row with aria-current="page" and no other', () => {
    render(
      <NavList>
        <NavListGroup>
          <NavListItem label="Home" href="/" />
          <NavListItem label="Docs" href="/docs" current />
        </NavListGroup>
      </NavList>
    );
    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Home' }).hasAttribute('aria-current')).toBe(false);
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('reads the suffix out and hides the drill caret', () => {
    render(
      <NavList>
        <NavListGroup>
          <NavListItem
            label="Policies"
            prefix={<svg data-testid="prefix" />}
            suffix={<Badge>3</Badge>}
            drill="p"
          />
        </NavListGroup>
      </NavList>
    );
    const row = screen.getByRole('button', { name: /^Policies\s*3$/ });
    expect(row).toBeTruthy();
    const caret = row.querySelector('.lucide-chevron-right')!;
    expect(caret.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByTestId('prefix').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('3').closest('[aria-hidden="true"]')).toBeNull();
  });

  it('names a list by its group label', () => {
    render(
      <NavList>
        <NavListGroup label="Applied Policies">
          <NavListItem label="AI Baseline" />
        </NavListGroup>
        <NavListGroup>
          <NavListItem label="Settings" />
        </NavListGroup>
      </NavList>
    );
    const [labelled, unlabelled] = screen.getAllByRole('list');
    const id = labelled.getAttribute('aria-labelledby')!;
    expect(document.getElementById(id)?.textContent).toBe('Applied Policies');
    expect(screen.getByRole('list', { name: 'Applied Policies' })).toBe(labelled);
    expect(unlabelled.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('takes no size', () => {
    // @ts-expect-error NavList has one row size
    const { container } = render(<NavList size="sm" />);
    expect(container.firstElementChild!.hasAttribute('data-size')).toBe(false);
  });

  it('wraps a nested group in its own list item and marks it nested', () => {
    render(
      <NavList>
        <NavListGroup label="Docs">
          <NavListItem label="Introduction" href="/" />
          <NavListGroup label="Components">
            <NavListItem label="Button" href="/button" />
          </NavListGroup>
        </NavListGroup>
      </NavList>
    );
    const outer = screen.getByRole('list', { name: 'Docs' });
    const inner = screen.getByRole('list', { name: 'Components' });
    expect(outer.getAttribute('data-depth')).toBe('0');
    expect(inner.getAttribute('data-depth')).toBe('1');
    expect([...outer.children].every((child) => child.tagName === 'LI')).toBe(true);
    expect(inner.closest('li')?.parentElement).toBe(outer);
  });

  it('puts a separator inside a group in its own list item', () => {
    render(
      <NavList>
        <NavListGroup label="Pages">
          <NavListItem label="Home" href="/" />
          <NavListSeparator />
          <NavListItem label="Settings" href="/settings" />
        </NavListGroup>
      </NavList>
    );
    const list = screen.getByRole('list', { name: 'Pages' });
    expect([...list.children].every((child) => child.tagName === 'LI')).toBe(true);
    expect(screen.getByRole('separator').tagName).toBe('LI');
  });

  it('drill-without-nav-drill: renders › and still runs onClick', () => {
    const onClick = vi.fn();
    render(
      <NavList>
        <NavListGroup>
          <NavListItem label="Policies" drill="p" onClick={onClick} />
        </NavListGroup>
      </NavList>
    );
    const row = screen.getByRole('button', { name: 'Policies' });
    expect(row.querySelector('.lucide-chevron-right')).not.toBeNull();
    fireEvent.click(row);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('requests a drill on a plain click', () => {
    const { requestDrill } = withDrill(
      <NavListGroup>
        <NavListItem label="Policies" drill="p" />
      </NavListGroup>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Policies' }));
    expect(requestDrill).toHaveBeenCalledWith('p');
  });

  it('requests-drill-after-child-prevents-default', () => {
    const { requestDrill } = withDrill(
      <NavListGroup>
        <NavListItem label="Policies" asChild drill="p">
          <a href="/p" onClick={(e) => e.preventDefault()} />
        </NavListItem>
      </NavListGroup>
    );
    fireEvent.click(screen.getByRole('link', { name: 'Policies' }));
    expect(requestDrill).toHaveBeenCalledWith('p');
  });

  it('makes no request on a ctrl, meta, shift, alt or middle click', () => {
    const { requestDrill } = withDrill(
      <NavListGroup>
        <NavListItem label="Policies" href="/p" drill="p" />
      </NavListGroup>
    );
    const row = screen.getByRole('link', { name: 'Policies' });
    fireEvent.click(row, { ctrlKey: true });
    fireEvent.click(row, { metaKey: true });
    fireEvent.click(row, { shiftKey: true });
    fireEvent.click(row, { altKey: true });
    fireEvent.click(row, { button: 1 });
    expect(requestDrill).not.toHaveBeenCalled();
  });

  it('marks the current row with data-current inside a leaving level', () => {
    withDrill(
      <NavListGroup>
        <NavListItem label="Docs" href="/docs" current />
      </NavListGroup>,
      vi.fn(),
      true
    );
    const row = screen.getByRole('link', { name: 'Docs' });
    expect(row.hasAttribute('aria-current')).toBe(false);
    expect(row.getAttribute('data-current')).toBe('page');
  });

  it('truncates a long label and keeps the full text in title', () => {
    const long = 'A very long policy name that will not fit in two hundred pixels';
    render(
      <NavList>
        <NavListGroup>
          <NavListItem label={long} href="/p" />
        </NavListGroup>
      </NavList>
    );
    const label = screen.getByText(long);
    expect(label.getAttribute('title')).toBe(long);
    expect(label.className).toMatch(/nav-list-item-label/);
  });
});
