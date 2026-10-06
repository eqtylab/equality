import assert from 'node:assert/strict';
import { test } from 'node:test';

import { siteAddress, siteMenu } from '../src/internal/site-list.ts';

const shared = [
  { title: 'Equality', href: 'https://equality.eqtylab.io/', description: 'Components' },
  { title: 'Integrity Python SDK', href: 'https://integrity-py.docs.eqtylab.io/' },
  { title: 'Verifiable Compute', href: 'https://eqtylab.github.io/vcomp-docs/' },
];

test('rows keep the list order and flag the current site', () => {
  const { rows } = siteMenu({ title: 'Integrity Python SDK' }, shared);
  assert.deepEqual(
    rows?.map((r) => [r.title, r.current]),
    [
      ['Equality', false],
      ['Integrity Python SDK', true],
      ['Verifiable Compute', false],
    ]
  );
});

test("a row shows the site's own description", () => {
  const { rows } = siteMenu({ title: 'Integrity Python SDK' }, shared);
  assert.equal(rows?.[0].detail, 'Components');
  assert.equal(rows?.[0].detailIsAddress, false);
});

test("the current site, with no description in the list, borrows the config's", () => {
  const { rows } = siteMenu({ title: 'Integrity Python SDK', description: 'Provenance' }, shared);
  assert.equal(rows?.[1].detail, 'Provenance');
  assert.equal(rows?.[1].detailIsAddress, false);
});

test('any other row with no description shows its address', () => {
  const { rows } = siteMenu({ title: 'Integrity Python SDK', description: 'Provenance' }, shared);
  assert.equal(rows?.[2].detail, 'eqtylab.github.io/vcomp-docs');
  assert.equal(rows?.[2].detailIsAddress, true);
});

test('an address drops the scheme and the trailing slash', () => {
  assert.equal(
    siteAddress('https://integrity-py.docs.eqtylab.io/'),
    'integrity-py.docs.eqtylab.io'
  );
  assert.equal(
    siteAddress('https://eqtylab.github.io/vcomp-docs/'),
    'eqtylab.github.io/vcomp-docs'
  );
});

test('sites: false gives a plain label and no warning', () => {
  assert.deepEqual(siteMenu({ title: 'Equality', sites: false }, shared), { rows: null });
});

test('a list holding only this site gives a plain label', () => {
  assert.deepEqual(siteMenu({ title: 'Equality', sites: [shared[0]] }, shared), { rows: null });
});

test('a site missing from the shared list gets a plain label and a warning naming it', () => {
  const menu = siteMenu({ title: 'Acme Docs' }, shared);
  assert.equal(menu.rows, null);
  assert.match(menu.warning ?? '', /"Acme Docs" is not in the EQTY Lab docs list/);
});

test('the shared EQTY Lab list is the default', () => {
  const { rows } = siteMenu({ title: 'Integrity Python SDK' });
  assert.ok(rows && rows.length >= 2);
});

test("Equality's own site gets the switcher from the shared list", () => {
  const { rows } = siteMenu({ title: 'Equality' });
  assert.equal(rows?.find((r) => r.current)?.title, 'Equality');
});
