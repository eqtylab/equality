import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { rehypeRelativeLinks } from '../src/internal/rehype-relative-links.ts';

const CONTENT_ROOT = fileURLToPath(new URL('./fixtures/basic/src/content/docs/', import.meta.url));

interface Tree {
  type: string;
  children: Array<{ type: string; tagName: string; properties: Record<string, unknown> }>;
}

const tree = (href: string): Tree => ({
  type: 'root',
  children: [{ type: 'element', tagName: 'a', properties: { href } }],
});

/** Resolve `href` as authored in the content file `from`, relative to the fixture root. */
function resolve(
  href: string,
  from = 'getting-started/install.mdx',
  opts: { base?: string; pathPrefix?: string } = {}
) {
  const missing: string[] = [];
  const doc = tree(href);
  rehypeRelativeLinks({
    contentRoot: CONTENT_ROOT,
    base: opts.base ?? '/',
    pathPrefix: opts.pathPrefix,
    onMissing: (target) => missing.push(target),
  })(doc, { path: path.join(CONTENT_ROOT, from) });
  return { href: doc.children[0]!.properties.href, missing };
}

test('a sibling page resolves to its route', () => {
  assert.equal(resolve('./usage.mdx').href, '/getting-started/usage/');
});

test('an extensionless neighbour is left to the browser', () => {
  assert.equal(resolve('./usage').href, './usage');
});

test('a parent-relative link resolves, and its anchor survives', () => {
  assert.equal(resolve('../guides/tabs.mdx#syncing').href, '/guides/tabs/#syncing');
});

test("a folder's index page resolves to the folder", () => {
  assert.equal(resolve('../guides/index.mdx').href, '/guides/');
});

test('the root index page resolves to the site root', () => {
  assert.equal(resolve('../index.mdx').href, '/');
});

test('a .md link finds the .mdx file it names', () => {
  const { href, missing } = resolve('./usage.md');
  assert.equal(href, '/getting-started/usage/');
  assert.deepEqual(missing, []);
});

test('base and pathPrefix are applied once each', () => {
  assert.equal(
    resolve('./usage.mdx', 'getting-started/install.mdx', { base: '/v3.1/', pathPrefix: 'docs' })
      .href,
    '/v3.1/docs/getting-started/usage/'
  );
});

test('a missing target warns and still resolves', () => {
  const { href, missing } = resolve('./nope.mdx');
  assert.equal(href, '/getting-started/nope/');
  assert.deepEqual(missing, ['./nope.mdx']);
});

for (const href of [
  'https://example.com/a.mdx',
  'mailto:docs@example.com',
  '//example.com/a.mdx',
  '/getting-started/usage/',
  '#section',
  '?q=1',
  './diagram.png',
]) {
  test(`${href} is left alone`, () => {
    assert.equal(resolve(href).href, href);
  });
}

test('a target outside the content root is left alone', () => {
  assert.equal(resolve('../../../README.mdx').href, '../../../README.mdx');
});

test('a file outside the content root is not rewritten at all', () => {
  const doc = tree('./usage.mdx');
  rehypeRelativeLinks({ contentRoot: CONTENT_ROOT, base: '/' })(doc, {
    path: path.join(CONTENT_ROOT, '../../pages/landing.mdx'),
  });
  assert.equal(doc.children[0]!.properties.href, './usage.mdx');
});

test('a tree with no file path is not rewritten', () => {
  const doc = tree('./usage.mdx');
  rehypeRelativeLinks({ contentRoot: CONTENT_ROOT, base: '/' })(doc);
  assert.equal(doc.children[0]!.properties.href, './usage.mdx');
});
