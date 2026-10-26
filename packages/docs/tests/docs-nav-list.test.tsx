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

describe('DocsNavList', () => {
  it('renders the docs tree on NavList parts', () => {
    expect(html).toMatch(
      /<a[^>]*aria-current="page"[^>]*href="\/components\/button"|<a[^>]*href="\/components\/button"[^>]*aria-current="page"/
    );
    expect(html).toContain('data-depth="1"');
    expect(html).toMatch(/target="_blank"[^>]*rel="noopener noreferrer"/);
    expect(html).toContain('data-analytics="github"');
  });

  it('labels a group with its name', () => {
    expect(html).toMatch(/>Components<\/div>/);
    expect(html).toMatch(/>Forms<\/div>/);
  });

  it('puts icons on top-level rows only', () => {
    expect(rowHtml('Introduction')).toContain('<svg');
    expect(rowHtml('Button')).toContain('<svg');
    expect(rowHtml('Input')).not.toContain('<svg');
  });

  it('reads the badge out', () => {
    expect(rowHtml('Button')).toContain('New');
    expect(html).not.toMatch(/<span[^>]*aria-hidden="true"[^>]*>(?:(?!<\/span>)[\s\S])*New/);
  });

  it('marks an external link with an arrow after its label', () => {
    expect(rowHtml('GitHub')).toMatch(/GitHub<\/span>[\s\S]*<svg/);
  });
});
