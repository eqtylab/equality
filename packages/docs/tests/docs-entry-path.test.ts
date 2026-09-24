import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isDocsEntryPath } from '../src/internal/docs-entry-path.ts';

test('underscore files and folders are not pages', () => {
  for (const rel of [
    'ref/_api.json',
    '_group.yaml',
    'components/_group.yaml',
    'a/_b/c.mdx',
    '_draft.mdx',
  ]) {
    assert.equal(isDocsEntryPath(rel), false, rel);
  }
});

test('MDX files outside underscore folders are pages', () => {
  for (const rel of ['a/b.mdx', 'index.mdx', 'a/b_c/d.mdx'])
    assert.equal(isDocsEntryPath(rel), true, rel);
});

test('other file types and paths outside the content directory are not pages', () => {
  for (const rel of ['a/b.md', 'ref/api.json', '../other/x.mdx'])
    assert.equal(isDocsEntryPath(rel), false, rel);
});
