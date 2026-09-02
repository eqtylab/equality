import assert from 'node:assert/strict';
import { test } from 'node:test';

import { breadcrumbsFor, buildNavTree, buildTocTree, prevNextFor, titleCase } from '../src/nav.ts';
import type { GroupConfig, SortMode } from '../src/nav.ts';
import type { DocsNavEntry, NavNode } from '../src/types.ts';

const paths = { base: '/' };

function group(partial: Partial<GroupConfig> = {}): GroupConfig {
  return { order: [], hidden: false, links: [], ...partial };
}

function entry(id: string, label: string, extra: Partial<DocsNavEntry> = {}): DocsNavEntry {
  const filePath = extra.filePath ?? `src/content/docs/${id}.mdx`;
  return { id, label, filePath, ...extra };
}

function build(
  entries: DocsNavEntry[],
  groups: Record<string, GroupConfig> = {},
  opts: { currentPath?: string; defaultSort?: SortMode; warn?: string[] } = {}
) {
  return buildNavTree({
    entries,
    groups: new Map(Object.entries(groups)),
    currentPath: opts.currentPath ?? '/',
    paths,
    defaultCollapsed: false,
    defaultSort: opts.defaultSort ?? 'alpha',
    onWarn: opts.warn ? (m) => opts.warn!.push(m) : undefined,
  });
}

const labels = (nodes: NavNode[]) => nodes.map((n) => n.label);
const find = (nodes: NavNode[], label: string) =>
  nodes.find((n) => n.label === label) ?? assert.fail(`no node labelled ${label}`);

test('order array wins, unlisted children append alphabetically by label', () => {
  const tree = build(
    [
      entry('guides/zebra', 'Zebra'),
      entry('guides/alpha', 'Alpha'),
      entry('guides/install', 'Installation'),
      entry('guides/usage', 'Usage'),
    ],
    { guides: group({ label: 'Guides', order: ['install', 'usage'] }) }
  );
  const guides = find(tree, 'Guides');
  assert.deepEqual(labels(guides.children!), ['Installation', 'Usage', 'Alpha', 'Zebra']);
});

test('order tokens normalise extensions and trailing slashes', () => {
  const tree = build([entry('g/b', 'B'), entry('g/a', 'A')], {
    g: group({ label: 'G', order: ['b.mdx', 'a/'] }),
  });
  assert.deepEqual(labels(find(tree, 'G').children!), ['B', 'A']);
});

test('a misspelled order token warns, naming the token and the available children', () => {
  const warn: string[] = [];
  const tree = build(
    [entry('g/usage', 'Usage')],
    { g: group({ label: 'G', order: ['usage', 'ussage'] }) },
    { warn }
  );
  assert.equal(warn.length, 1);
  assert.match(warn[0]!, /ussage/);
  assert.match(warn[0]!, /usage/);
  // The typo must not drop the real page.
  assert.deepEqual(labels(find(tree, 'G').children!), ['Usage']);
});

test('index.mdx becomes the folder’s own landing page, not a child', () => {
  const tree = build(
    [
      entry('guides', 'Guides Home', { filePath: 'src/content/docs/guides/index.mdx' }),
      entry('guides/one', 'One'),
    ],
    {}
  );
  const guides = find(tree, 'Guides Home');
  assert.equal(guides.kind, 'group');
  assert.equal(guides.href, '/guides/');
  assert.deepEqual(labels(guides.children!), ['One']);
});

test('root index.mdx maps to "/" and is not itself a group', () => {
  const tree = build([
    entry('index', 'Home', { filePath: 'src/content/docs/index.mdx' }),
    entry('one', 'One'),
  ]);
  assert.deepEqual(labels(tree), ['One']);
});

test('groups nest to arbitrary depth', () => {
  const tree = build([entry('a/b/c/page', 'Deep')]);
  const a = find(tree, 'A');
  const b = find(a.children!, 'B');
  const c = find(b.children!, 'C');
  assert.deepEqual(labels(c.children!), ['Deep']);
  assert.equal(c.children![0]!.href, '/a/b/c/page/');
});

test('folder name is title-cased when no label or index page supplies one', () => {
  const tree = build([entry('getting-started/usage', 'Usage')]);
  assert.deepEqual(labels(tree), ['Getting Started']);
});

test('sort: filename orders by name, not by label', () => {
  const tree = build([entry('g/01-first', 'Zebra'), entry('g/02-second', 'Alpha')], {
    g: group({ label: 'G', sort: 'filename' }),
  });
  assert.deepEqual(labels(find(tree, 'G').children!), ['Zebra', 'Alpha']);
});

test('sort: manual drops unlisted children from the nav', () => {
  const tree = build([entry('g/listed', 'Listed'), entry('g/unlisted', 'Unlisted')], {
    g: group({ label: 'G', sort: 'manual', order: ['listed'] }),
  });
  assert.deepEqual(labels(find(tree, 'G').children!), ['Listed']);
});

test('alpha sort is numeric-aware', () => {
  const tree = build([entry('g/a', 'Item 2'), entry('g/b', 'Item 10'), entry('g/c', 'Item 1')], {
    g: group({ label: 'G' }),
  });
  assert.deepEqual(labels(find(tree, 'G').children!), ['Item 1', 'Item 2', 'Item 10']);
});

test('hidden entries and hidden groups are omitted; empty groups are pruned', () => {
  const tree = build(
    [entry('g/shown', 'Shown'), entry('g/gone', 'Gone', { hidden: true }), entry('h/x', 'X')],
    { h: group({ hidden: true }) }
  );
  assert.deepEqual(labels(find(tree, 'G').children!), ['Shown']);
  assert.equal(
    tree.find((n) => n.label === 'H'),
    undefined
  );
});

test('draft entries are excluded', () => {
  const tree = build([entry('a', 'A'), entry('b', 'B', { draft: true })]);
  assert.deepEqual(labels(tree), ['A']);
});

test('a group containing the current page is forced open even when collapsed', () => {
  const tree = build(
    [entry('g/deep', 'Deep')],
    { g: group({ label: 'G', collapsed: true }) },
    { currentPath: '/g/deep/' }
  );
  const g = find(tree, 'G');
  assert.equal(g.open, true);
  assert.equal(g.inPath, true);
  assert.equal(g.children![0]!.current, true);
});

test('a collapsed group not containing the current page stays closed', () => {
  const tree = build(
    [entry('g/deep', 'Deep'), entry('other', 'Other')],
    { g: group({ label: 'G', collapsed: true }) },
    { currentPath: '/other/' }
  );
  assert.equal(find(tree, 'G').open, false);
});

test('external links are appended after files and marked external', () => {
  const tree = build([entry('g/page', 'Page')], {
    g: group({
      label: 'G',
      links: [{ label: 'Releases', href: 'https://example.com/r', external: true, attrs: {} }],
    }),
  });
  const children = find(tree, 'G').children!;
  assert.deepEqual(labels(children), ['Page', 'Releases']);
  assert.equal(children[1]!.kind, 'link');
  assert.equal(children[1]!.external, true);
});

test('badges come from the entry or the group config', () => {
  const badge = { text: 'Deprecated', variant: 'warning' as const };
  const tree = build([entry('g/old', 'Old', { badge })], {
    g: group({ label: 'G', badge: { text: 'New', variant: 'success' } }),
  });
  const g = find(tree, 'G');
  assert.deepEqual(g.badge, { text: 'New', variant: 'success' });
  assert.deepEqual(g.children![0]!.badge, badge);
});

test('base is applied to every href', () => {
  const tree = buildNavTree({
    entries: [entry('guides/one', 'One')],
    groups: new Map(),
    currentPath: '/sub/guides/one/',
    paths: { base: '/sub/' },
    defaultCollapsed: false,
    defaultSort: 'alpha',
  });
  const one = find(find(tree, 'Guides').children!, 'One');
  assert.equal(one.href, '/sub/guides/one/');
  assert.equal(one.current, true);
});

test('a version prefix is applied between base and path', () => {
  const tree = buildNavTree({
    entries: [entry('guides/one', 'One')],
    groups: new Map(),
    currentPath: '/',
    paths: { base: '/', versionPrefix: 'v3.1' },
    defaultCollapsed: false,
    defaultSort: 'alpha',
  });
  assert.equal(find(find(tree, 'Guides').children!, 'One').href, '/v3.1/guides/one/');
});

test('the root group config is read from the ~root sentinel', () => {
  const tree = build([entry('b', 'Bravo'), entry('a', 'Alpha')], {
    '~root': group({ order: ['b'] }),
  });
  assert.deepEqual(labels(tree), ['Bravo', 'Alpha']);
});

test('extra nodes are appended after folder-derived ones', () => {
  const extra: NavNode = { kind: 'group', name: 'api', label: 'API', children: [] };
  const tree = buildNavTree({
    entries: [entry('a', 'A')],
    groups: new Map(),
    currentPath: '/',
    paths,
    defaultCollapsed: false,
    defaultSort: 'alpha',
    extra: [extra],
  });
  assert.deepEqual(labels(tree), ['A', 'API']);
});

test('prevNext follows sidebar order, not alphabetical id order', () => {
  const tree = build([entry('g/c', 'C'), entry('g/a', 'A'), entry('g/b', 'B')], {
    g: group({ label: 'G', order: ['c', 'a', 'b'] }),
  });
  const { prev, next } = prevNextFor(tree, '/g/a/');
  assert.equal(prev?.label, 'C');
  assert.equal(next?.label, 'B');
});

test('breadcrumbs return the ancestor chain', () => {
  const tree = build([entry('a/b/page', 'Page')]);
  assert.deepEqual(labels(breadcrumbsFor(tree, '/a/b/page/')), ['A', 'B', 'Page']);
});

test('buildTocTree nests h3 under the preceding h2 and clamps levels', () => {
  const toc = buildTocTree([
    { depth: 1, slug: 'title', text: 'Title' },
    { depth: 2, slug: 'one', text: 'One' },
    { depth: 3, slug: 'one-a', text: 'One A' },
    { depth: 4, slug: 'too-deep', text: 'Too Deep' },
    { depth: 2, slug: 'two', text: 'Two' },
  ]);
  assert.deepEqual(
    toc.map((n) => n.text),
    ['One', 'Two']
  );
  assert.deepEqual(
    toc[0]!.children.map((n) => n.text),
    ['One A']
  );
  assert.equal(toc[1]!.children.length, 0);
});

test('buildTocTree tolerates an h3 with no preceding h2', () => {
  const toc = buildTocTree([{ depth: 3, slug: 'orphan', text: 'Orphan' }]);
  assert.deepEqual(
    toc.map((n) => n.text),
    ['Orphan']
  );
});

test('titleCase handles hyphens and underscores', () => {
  assert.equal(titleCase('getting-started'), 'Getting Started');
  assert.equal(titleCase('api_reference'), 'Api Reference');
});
