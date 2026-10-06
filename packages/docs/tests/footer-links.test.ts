import assert from 'node:assert/strict';
import { test } from 'node:test';

import { footerRowsFor } from '../src/runtime/lib/footer-links.ts';

const issue = {
  label: 'Report an issue',
  href: 'https://github.com/a/b/issues/new',
  external: true,
};
const usage = { prefix: 'Start with the', label: 'usage guide', href: '/getting-started/usage/' };
const editHref = 'https://github.com/a/b/edit/main/docs/components/button.mdx';
const page = { editIcon: 'lucide:pencil' };

test('with an edit link, the edit row comes first, with the icon it is given', () => {
  const [edit, next] = footerRowsFor([issue], { ...page, editHref });
  assert.deepEqual(edit, {
    prefix: 'Spotted a mistake?',
    label: 'Edit this page',
    href: editHref,
    icon: 'lucide:pencil',
    external: true,
    end: '.',
  });
  assert.equal(next.label, 'Report an issue');
});

test('without an edit link (archived version, or no file) the other rows still show', () => {
  assert.deepEqual(
    footerRowsFor([issue], page).map((r) => r.label),
    ['Report an issue']
  );
});

test('rows keep their order', () => {
  assert.deepEqual(
    footerRowsFor([usage, issue], page).map((r) => r.label),
    ['usage guide', 'Report an issue']
  );
});

test('a full stop follows the label unless it already ends in punctuation', () => {
  const rows = footerRowsFor(
    [
      issue,
      { label: 'Questions?', href: '/help/' },
      { label: 'Done.', href: '/d/' },
      { label: 'Go!', href: '/g/' },
    ],
    page
  );
  assert.deepEqual(
    rows.map((r) => r.end),
    ['.', '', '', '']
  );
});

test('a row without an href is plain text, exactly as written', () => {
  const rows = footerRowsFor(
    [{ label: 'Licensed under MIT' }, { prefix: 'Docs for', label: 'version 2.4' }],
    page
  );
  assert.deepEqual(
    rows.map((r) => [r.plain, r.end]),
    [
      ['Licensed under MIT', ''],
      ['Docs for version 2.4', ''],
    ]
  );
});
