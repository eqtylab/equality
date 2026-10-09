import assert from 'node:assert/strict';
import { test } from 'node:test';

import { brandAssets, resolveConfig } from '../src/config.ts';
import { repositoryLinks } from '../src/internal/repository.ts';
import { landingError } from '../src/schema.ts';

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

test('footer rows default to none, and a leftover editUrl fails and points at repository', () => {
  assert.deepEqual(resolveConfig({ title: 'x' }).footer.links, []);
  assert.throws(
    () =>
      resolveConfig({
        title: 'x',
        footer: { editUrl: 'https://github.com/a/b/edit/main/' },
      } as never),
    /editUrl was removed\. Set repository instead/
  );
});

test('the edit and issue links are worked out from the repository, on main unless told otherwise', () => {
  const { repository } = resolveConfig({
    title: 'x',
    repository: { url: 'https://github.com/a/b/' },
  });
  assert.deepEqual(repositoryLinks(repository, 'packages/site/src/content/docs'), {
    editBase: 'https://github.com/a/b/edit/main/packages/site/src/content/docs',
    issueHref: 'https://github.com/a/b/issues/new',
  });
  assert.deepEqual(repositoryLinks(repository, null), {
    editBase: undefined,
    issueHref: 'https://github.com/a/b/issues/new',
  });
  assert.deepEqual(repositoryLinks(undefined, 'docs'), {});
});

test('feedback replaces the new-issue page, and stands alone without a repository', () => {
  const repository = { url: 'https://github.com/a/b', branch: 'main' };
  assert.deepEqual(repositoryLinks(repository, 'docs', 'https://support.example.com'), {
    editBase: 'https://github.com/a/b/edit/main/docs',
    issueHref: 'https://support.example.com',
  });
  assert.deepEqual(repositoryLinks(undefined, null, 'https://support.example.com'), {
    issueHref: 'https://support.example.com',
  });
});

test('feedback must be a full URL', () => {
  assert.throws(() => resolveConfig({ title: 'x', feedback: '/support/' }));
});

test('license is a name, or a name linked to a full URL', () => {
  assert.equal(resolveConfig({ title: 'x', license: 'Apache 2.0' }).license, 'Apache 2.0');
  const linked = { name: 'Apache 2.0', href: 'https://github.com/a/b/blob/main/LICENSE' };
  assert.deepEqual(resolveConfig({ title: 'x', license: linked }).license, linked);
  assert.throws(() =>
    resolveConfig({ title: 'x', license: { name: 'Apache 2.0', href: '/LICENSE' } })
  );
});

test('a landing page needs sections and no body, and only a landing page takes sections', () => {
  const sections = [{ heading: 'Start' }];
  assert.equal(landingError('index', { template: 'landing', sections }, ''), null);
  assert.match(landingError('index', { template: 'landing' }, '') ?? '', /needs `sections`/);
  assert.match(
    landingError('index', { template: 'landing', sections }, 'Intro text.') ?? '',
    /not its body/
  );
  assert.match(landingError('guide', { template: 'doc', sections }, '') ?? '', /only applies/);
  assert.equal(landingError('guide', { template: 'doc' }, 'Body.'), null);
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
