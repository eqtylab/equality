import assert from 'node:assert/strict';
import { test } from 'node:test';

import { siteAddress, siteMenu } from '../src/internal/site-list.ts';
import { eqtyDocsSites } from '../src/sites.ts';

const shared = [
  { title: 'Guardian', href: 'https://guardian.docs.eqtylab.io/', description: 'Guides' },
  { title: 'Integrity Python SDK', href: 'https://integrity-py.docs.eqtylab.io/' },
  { title: 'Verifiable Compute', href: 'https://eqtylab.github.io/vcomp-docs/' },
];

const rowsOf = (menu: ReturnType<typeof siteMenu>) => menu?.map((r) => [r.title, r.current]);

test('a public site gets the list in its order, with itself checked', () => {
  assert.deepEqual(rowsOf(siteMenu({ title: 'Integrity Python SDK' }, undefined, shared)), [
    ['Guardian', false],
    ['Integrity Python SDK', true],
    ['Verifiable Compute', false],
  ]);
});

test('a private site sits at the top of its own menu, above the public sites', () => {
  const menu = siteMenu({ title: 'Equality' }, 'https://equality.eqtylab.io', shared);
  assert.deepEqual(rowsOf(menu), [
    ['Equality', true],
    ['Guardian', false],
    ['Integrity Python SDK', false],
    ['Verifiable Compute', false],
  ]);
  assert.equal(menu?.[0].href, 'https://equality.eqtylab.io');
});

test('a public site whose title drifted is matched by its address, not listed twice', () => {
  const menu = siteMenu({ title: 'Integrity SDK' }, 'https://integrity-py.docs.eqtylab.io', shared);
  assert.equal(menu?.length, 3);
  assert.equal(menu?.find((r) => r.current)?.title, 'Integrity Python SDK');
});

test("a private site's row shows its config description", () => {
  const menu = siteMenu(
    { title: 'Equality', description: 'Components' },
    'https://equality.eqtylab.io/',
    shared
  );
  assert.equal(menu?.[0].detail, 'Components');
  assert.equal(menu?.[0].detailIsAddress, false);
});

test('a private site with no description shows its address', () => {
  const menu = siteMenu({ title: 'Equality' }, 'https://equality.eqtylab.io/', shared);
  assert.equal(menu?.[0].detail, 'equality.eqtylab.io');
  assert.equal(menu?.[0].detailIsAddress, true);
});

test("a row shows the site's own description", () => {
  const menu = siteMenu({ title: 'Integrity Python SDK' }, undefined, shared);
  assert.equal(menu?.[0].detail, 'Guides');
  assert.equal(menu?.[0].detailIsAddress, false);
});

test("the current site, with no description in the list, borrows the config's", () => {
  const menu = siteMenu(
    { title: 'Integrity Python SDK', description: 'Provenance' },
    undefined,
    shared
  );
  assert.equal(menu?.[1].detail, 'Provenance');
  assert.equal(menu?.[1].detailIsAddress, false);
});

test('any other row with no description shows its address', () => {
  const menu = siteMenu(
    { title: 'Integrity Python SDK', description: 'Provenance' },
    undefined,
    shared
  );
  assert.equal(menu?.[2].detail, 'eqtylab.github.io/vcomp-docs');
  assert.equal(menu?.[2].detailIsAddress, true);
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

test('the only site there is gets a plain label', () => {
  assert.equal(siteMenu({ title: 'Guardian' }, undefined, [shared[0]]), null);
});

test('the public list is the default', () => {
  const menu = siteMenu({ title: 'Equality' }, 'https://equality.eqtylab.io/');
  assert.equal(menu?.[0].title, 'Equality');
  assert.equal(menu?.length, eqtyDocsSites.length + 1);
});

test('every public site has a full https address, and no two share a title', () => {
  for (const site of eqtyDocsSites) assert.equal(new URL(site.href).protocol, 'https:');
  assert.equal(new Set(eqtyDocsSites.map((s) => s.title)).size, eqtyDocsSites.length);
});
