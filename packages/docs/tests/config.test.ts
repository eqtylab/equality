import assert from 'node:assert/strict';
import { test } from 'node:test';

import { brandAssets, resolveConfig } from '../src/config.ts';
import { eqtyDocsSites } from '../src/sites.ts';

test('versions is on by default with tags and granularity filled in', () => {
  const cfg = resolveConfig({ title: 'x' });
  assert.deepEqual(cfg.versions, { source: 'tags', tags: 'v*', granularity: 'major', folders: {} });
});

test('versions: false is the off switch', () => {
  assert.equal(resolveConfig({ title: 'x', versions: false }).versions, false);
});

test('an explicit current and granularity survive, defaults fill the rest', () => {
  const cfg = resolveConfig({ title: 'x', versions: { current: '4.0.0', granularity: 'minor' } });
  assert.deepEqual(cfg.versions, {
    current: '4.0.0',
    source: 'tags',
    tags: 'v*',
    granularity: 'minor',
    folders: {},
  });
});

test("versions.source is 'tags' or 'folders'", () => {
  const cfg = resolveConfig({ title: 'x', versions: { source: 'folders' } });
  assert.equal(cfg.versions && cfg.versions.source, 'folders');
  assert.throws(
    () => resolveConfig({ title: 'x', versions: { source: 'branches' } as never }),
    /source \(tags \| folders\)/
  );
});

test('an unknown granularity fails loudly', () => {
  assert.throws(
    () => resolveConfig({ title: 'x', versions: { granularity: 'weekly' } as never }),
    /granularity/
  );
});

test('the favicon defaults to the shipped EQTY Lab mark', () => {
  assert.equal(resolveConfig({ title: 'x' }).favicon, brandAssets.favicon);
});

test("a site's own favicon wins over the shipped one", () => {
  assert.equal(resolveConfig({ title: 'x', favicon: '/mine.svg' }).favicon, '/mine.svg');
});

test('the share image defaults to the shipped EQTY Lab card, and false removes it', () => {
  assert.equal(resolveConfig({ title: 'x' }).ogImage, brandAssets.ogImage);
  assert.equal(resolveConfig({ title: 'x', ogImage: false }).ogImage, false);
});

test('the logo defaults to the shipped EQTY Lab mark', () => {
  assert.deepEqual(resolveConfig({ title: 'x' }).logo, { src: brandAssets.logo, alt: 'EQTY Lab' });
});

test('logo: false leaves the header showing the title as text', () => {
  assert.equal(resolveConfig({ title: 'x', logo: false }).logo, false);
});

test("a site's own logo wins over the shipped one", () => {
  assert.deepEqual(resolveConfig({ title: 'x', logo: { src: '/mine.svg' } }).logo, {
    src: '/mine.svg',
    alt: '',
  });
});

test('the github option is gone, and the build names the header link to write instead', () => {
  for (const github of ['eqtylab/my-repo', false]) {
    assert.throws(
      () => resolveConfig({ title: 'x', github } as never),
      /github: .*header\.links.*simple-icons:github/
    );
  }
});

test('no header links are added for a site that writes none', () => {
  assert.deepEqual(resolveConfig({ title: 'x' }).header.links, []);
});

test('versions.folders defaults to an empty map and keeps what it is given', () => {
  const plain = resolveConfig({ title: 'x' }).versions;
  assert.ok(plain !== false);
  assert.deepEqual(plain.folders, {});
  const given = resolveConfig({
    title: 'x',
    versions: { folders: { '2.2.0': 'archive/v2.2' } },
  }).versions;
  assert.ok(given !== false);
  assert.deepEqual(given.folders, { '2.2.0': 'archive/v2.2' });
});

const withHeaderIcon = (icon: string) =>
  resolveConfig({ title: 'x', header: { links: [{ label: 'a', href: '/', icon }] } });

test('footer rows default to none, and editUrl still works', () => {
  const cfg = resolveConfig({
    title: 'x',
    footer: { editUrl: 'https://github.com/a/b/edit/main/docs/' },
  });
  assert.deepEqual(cfg.footer.links, []);
  assert.equal(cfg.footer.editUrl, 'https://github.com/a/b/edit/main/docs/');
});

test('a footer link row keeps prefix, label, href, icon and external', () => {
  const row = {
    prefix: 'Something broken?',
    label: 'Report an issue',
    href: 'https://github.com/a/b/issues/new',
    icon: 'lucide:circle-dot',
    external: true,
  };
  assert.deepEqual(resolveConfig({ title: 'x', footer: { links: [row] } }).footer.links, [row]);
});

test('a plain footer row is a label with no href', () => {
  const links = [{ label: 'Licensed under MIT', icon: 'lucide:scale' }];
  assert.deepEqual(resolveConfig({ title: 'x', footer: { links } }).footer.links, links);
});

test('a row without a label fails and names the row', () => {
  assert.throws(
    () =>
      resolveConfig({ title: 'x', footer: { links: [{ label: 'a' }, { href: '/x/' }] } } as never),
    /footer\.links\.1\.label: needs a label/
  );
});

test('a header link still needs an href', () => {
  assert.throws(
    () => resolveConfig({ title: 'x', header: { links: [{ label: 'a' }] } } as never),
    /header\.links\.0\.href: needs an href/
  );
});

test('Lucide and Simple Icons names pass', () => {
  for (const icon of ['lucide:pencil', 'lucide:building-2', 'simple-icons:github']) {
    assert.equal(withHeaderIcon(icon).header.links[0].icon, icon);
  }
});

test('an old-style Lucide name fails and names its replacement', () => {
  assert.throws(() => withHeaderIcon('BookOpen'), /use 'lucide:book-open'/);
  assert.throws(() => withHeaderIcon('Building2'), /use 'lucide:building-2'/);
});

test('an svg path fails and suggests an icon name', () => {
  assert.throws(() => withHeaderIcon('/github.svg'), /'simple-icons:github'/);
});

test('another set, or no set, fails with the format', () => {
  assert.throws(
    () => withHeaderIcon('mdi:home'),
    /expected 'lucide:<name>' or 'simple-icons:<name>'/
  );
  assert.throws(
    () => withHeaderIcon('pencil'),
    /expected 'lucide:<name>' or 'simple-icons:<name>'/
  );
});

test('a footer row icon is checked too', () => {
  assert.throws(
    () => resolveConfig({ title: 'x', footer: { links: [{ label: 'a', icon: 'Pencil' }] } }),
    /use 'lucide:pencil'/
  );
});

test('brandAssets.github is the Simple Icons GitHub mark, so 0.10 configs keep their icon', () => {
  assert.equal(brandAssets.github, 'simple-icons:github');
  assert.equal(withHeaderIcon(brandAssets.github).header.links[0].icon, 'simple-icons:github');
});

test('the suggested Lucide name is one that exists', () => {
  assert.throws(() => withHeaderIcon('Grid3x3'), /use 'lucide:grid-3x3'/);
  assert.throws(() => withHeaderIcon('Lucide:Pencil'), /use 'lucide:pencil'/);
});

test('old casing after the set name still gets the suggestion', () => {
  assert.throws(() => withHeaderIcon('lucide:BookOpen'), /use 'lucide:book-open'/);
  assert.throws(() => withHeaderIcon('simple-icons:GitHub'), /use 'simple-icons:github'/);
});

test('an old-style name with no Lucide match points at lucide.dev instead of guessing', () => {
  assert.throws(() => withHeaderIcon('NotARealIcon'), /lucide\.dev/);
});

test('a footer row with an empty label, or an empty href, fails instead of rendering blank', () => {
  assert.throws(
    () => resolveConfig({ title: 'x', footer: { links: [{ label: '' }] } }),
    /footer\.links\.0\.label: needs a label/
  );
  assert.throws(
    () => resolveConfig({ title: 'x', footer: { links: [{ label: 'a', href: '' }] } }),
    /footer\.links\.0\.href: .*leave it out/
  );
});

test('sites is unset by default, which means the shared EQTY Lab list', () => {
  assert.equal(resolveConfig({ title: 'x' }).sites, undefined);
});

test('sites: false turns the switcher off', () => {
  assert.equal(resolveConfig({ title: 'x', sites: false }).sites, false);
});

test('a sites list that includes this site is kept as written', () => {
  const sites = [
    { title: 'x', href: 'https://x.example/' },
    { title: 'y', href: 'https://y.example/docs/', description: 'Y' },
  ];
  assert.deepEqual(resolveConfig({ title: 'x', sites }).sites, sites);
});

test('a sites list without this site stops the build and names the title', () => {
  assert.throws(
    () =>
      resolveConfig({
        title: 'Integrity Python SDK',
        sites: [{ title: 'Equality', href: 'https://equality.eqtylab.io/' }],
      }),
    /sites: has no site titled "Integrity Python SDK"/
  );
});

test('a site address must be a full http(s) address', () => {
  assert.throws(
    () => resolveConfig({ title: 'x', sites: [{ title: 'x', href: '/docs/' }] }),
    /sites\.0\.href: needs a full http\(s\) address/
  );
});

test('sites must be false or a list', () => {
  assert.throws(
    () => resolveConfig({ title: 'x', sites: 'all' as never }),
    /sites: expected false, or a list of sites/
  );
});

test('every shared site parses, and no two share a title', () => {
  for (const site of eqtyDocsSites) resolveConfig({ title: site.title, sites: eqtyDocsSites });
  assert.equal(new Set(eqtyDocsSites.map((s) => s.title)).size, eqtyDocsSites.length);
});
