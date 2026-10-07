import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveConfig } from '../src/config.ts';
import { configuredIcons } from '../src/internal/configured-icons.ts';

test('icons come from header links and footer rows, each once', () => {
  const cfg = resolveConfig({
    title: 'x',
    header: { links: [{ label: 'Blog', href: '/blog/', icon: 'lucide:newspaper' }] },
    footer: {
      links: [
        { label: 'News', href: '/news/', icon: 'lucide:newspaper' },
        { label: 'Licensed under MIT', icon: 'lucide:scale' },
        { label: 'No icon' },
      ],
    },
  });
  assert.deepEqual(configuredIcons(cfg), ['lucide:newspaper', 'lucide:scale', 'lucide:pencil']);
});

test("the edit row's icon is always listed, so a page given editHref without editUrl still draws", () => {
  assert.deepEqual(configuredIcons(resolveConfig({ title: 'x' })), ['lucide:pencil']);
  const withEdit = resolveConfig({
    title: 'x',
    footer: { editUrl: 'https://github.com/a/b/edit/main/' },
  });
  assert.deepEqual(configuredIcons(withEdit), ['lucide:pencil']);
});

test("the issue row's icon is listed only when issueUrl is set", () => {
  const withIssue = resolveConfig({
    title: 'x',
    footer: { issueUrl: 'https://github.com/a/b/issues/new' },
  });
  assert.deepEqual(configuredIcons(withIssue), ['lucide:pencil', 'lucide:circle-dot']);
});

test('only header and footer links are read; sidebar and plugin icons are left to their own code', () => {
  const cfg = resolveConfig({
    title: 'x',
    sidebar: { extra: [{ label: 'Docs', icon: 'lucide:book' }] },
    plugins: [{ name: 'p', icon: 'lucide:typo' }],
  });
  assert.deepEqual(configuredIcons(cfg), ['lucide:pencil']);
});
