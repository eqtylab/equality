import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DocsNavList } from '../src/runtime/chrome/DocsNavList.tsx';
import type { NavNode } from '../src/types.ts';

const nodes: NavNode[] = [
  { kind: 'page', name: 'index', label: 'Introduction', href: '/', icon: 'House' },
  {
    kind: 'group',
    name: 'components',
    label: 'Components',
    open: true,
    children: [
      {
        kind: 'page',
        name: 'button',
        label: 'Button',
        href: '/components/button',
        icon: 'MousePointerClick',
        current: true,
        badge: { text: 'New', variant: 'primary' },
      },
      {
        kind: 'group',
        name: 'forms',
        label: 'Forms',
        icon: 'Layers',
        open: true,
        children: [
          {
            kind: 'page',
            name: 'input',
            label: 'Input',
            href: '/components/forms/input',
            icon: 'TextCursorInput',
          },
        ],
      },
    ],
  },
  {
    kind: 'group',
    name: 'guides',
    label: 'Guides',
    icon: 'BookOpen',
    open: false,
    children: [{ kind: 'page', name: 'theming', label: 'Theming', href: '/guides/theming' }],
  },
  {
    kind: 'link',
    name: 'github',
    label: 'GitHub',
    href: 'https://github.com/eqtylab/equality',
    external: true,
    attrs: { 'data-analytics': 'github' },
  },
];

const html = renderToString(<DocsNavList nodes={nodes} />);

function rowHtml(label: string): string {
  const end = html.indexOf(`>${label}</span>`);
  const start = html.lastIndexOf('<li', end);
  return html.slice(start, html.indexOf('</li>', end));
}

function triggerHtml(label: string): string {
  const end = html.indexOf(`>${label}</span>`);
  return html.slice(html.lastIndexOf('<button', end), html.indexOf('</button>', end));
}

describe('DocsNavList', () => {
  it('renders the docs tree on NavList parts', () => {
    expect(html).toMatch(
      /<a[^>]*aria-current="page"[^>]*href="\/components\/button"|<a[^>]*href="\/components\/button"[^>]*aria-current="page"/
    );
    expect(html).toContain('data-analytics="github"');
  });

  it('makes every folder a group that opens and closes, as far down as it goes', () => {
    expect(triggerHtml('Components')).toContain('aria-expanded="true"');
    expect(triggerHtml('Forms')).toContain('aria-expanded="true"');
    expect(triggerHtml('Guides')).toContain('aria-expanded="false"');
    expect(html).toContain('data-depth="2"');
  });

  it('keeps a closed group’s links in the HTML', () => {
    expect(html).toContain('href="/guides/theming"');
  });

  it('puts icons on top-level rows and groups only', () => {
    expect(rowHtml('Introduction')).toContain('<svg');
    expect(triggerHtml('Guides')).toContain('nav-list-item-prefix');
    expect(triggerHtml('Forms')).not.toContain('nav-list-item-prefix');
    expect(rowHtml('Button')).not.toContain('<svg');
    expect(rowHtml('Input')).not.toContain('<svg');
  });

  it('reads the badge out', () => {
    expect(rowHtml('Button')).toContain('New');
    expect(html).not.toMatch(/<span[^>]*aria-hidden="true"[^>]*>(?:(?!<\/span>)[\s\S])*New/);
  });

  it('passes only data-, aria- and id attributes from config to a link', () => {
    const link = renderToString(
      <DocsNavList
        nodes={[
          {
            kind: 'link',
            name: 'status',
            label: 'Status',
            href: 'https://status.example.com',
            attrs: {
              style: 'color:red',
              class: 'loud',
              'data-track': 'status',
              'data-off': false,
              id: 'status',
            },
          },
        ]}
      />
    );
    expect(link).toContain('data-track="status"');
    expect(link).toContain('id="status"');
    expect(link).not.toContain('data-off');
    expect(link).not.toContain('loud');
    expect(link).not.toContain('color:red');
  });

  it('marks an external link once, for sight and for screen readers', () => {
    const row = rowHtml('GitHub');
    expect(row.match(/<svg/g)).toHaveLength(1);
    expect(row).toContain('(opens in a new tab)');
    expect(row).toContain('rel="noopener noreferrer"');
  });
});
