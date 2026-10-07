import assert from 'node:assert/strict';
import { test } from 'node:test';

import { articleRowsFor, footerRowsFor } from '../src/runtime/lib/footer-links.ts';

const issue = {
  label: 'Report an issue',
  href: 'https://github.com/a/b/issues/new',
  external: true,
};
const usage = { prefix: 'Start with the', label: 'usage guide', href: '/getting-started/usage/' };
const editHref = 'https://github.com/a/b/edit/main/docs/components/button.mdx';
const issueHref = 'https://github.com/a/b/issues/new';
const page = { editIcon: 'lucide:pencil', issueIcon: 'lucide:circle-dot' };

test('the article footer lists the edit row, then the issue row, with the icons it is given', () => {
  const [edit, issue] = articleRowsFor({ ...page, editHref, issueHref });
  assert.deepEqual(edit, {
    prefix: 'Spotted a mistake?',
    label: 'Edit this page',
    href: editHref,
    icon: 'lucide:pencil',
    external: true,
  });
  assert.deepEqual(issue, {
    prefix: 'Something broken?',
    label: 'Report an issue',
    href: issueHref,
    icon: 'lucide:circle-dot',
    external: true,
  });
});

test('without an edit link (archived version, or no file) the issue row still shows', () => {
  assert.deepEqual(
    articleRowsFor({ ...page, issueHref }).map((r) => r.label),
    ['Report an issue']
  );
});

test('the article footer has no rows when neither link is set', () => {
  assert.deepEqual(articleRowsFor(page), []);
});

test('rows keep their order', () => {
  assert.deepEqual(
    footerRowsFor([usage, issue]).map((r) => r.label),
    ['usage guide', 'Report an issue']
  );
});

test('a row without an href is plain text, exactly as written', () => {
  const rows = footerRowsFor([
    { label: 'Licensed under MIT' },
    { prefix: 'Docs for', label: 'version 2.4' },
  ]);
  assert.deepEqual(
    rows.map((r) => r.plain),
    ['Licensed under MIT', 'Docs for version 2.4']
  );
});
