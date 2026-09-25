import assert from 'node:assert/strict';
import { test } from 'node:test';

import { brandAssets, resolveConfig } from '../src/config.ts';

test('versions is on by default with tags and granularity filled in', () => {
  const cfg = resolveConfig({ title: 'x' });
  assert.deepEqual(cfg.versions, { tags: 'v*', granularity: 'major' });
});

test('versions: false is the off switch', () => {
  assert.equal(resolveConfig({ title: 'x', versions: false }).versions, false);
});

test('an explicit current and granularity survive, defaults fill the rest', () => {
  const cfg = resolveConfig({ title: 'x', versions: { current: '4.0.0', granularity: 'minor' } });
  assert.deepEqual(cfg.versions, { current: '4.0.0', tags: 'v*', granularity: 'minor' });
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

test('github accepts a URL or false, and is unset by default', () => {
  assert.equal(resolveConfig({ title: 'x' }).github, undefined);
  assert.equal(resolveConfig({ title: 'x', github: false }).github, false);
  assert.equal(
    resolveConfig({ title: 'x', github: 'https://github.com/a/b' }).github,
    'https://github.com/a/b'
  );
});

test('github owner/repo shorthand expands to the full URL', () => {
  assert.equal(
    resolveConfig({ title: 'x', github: 'eqtylab/my-repo' }).github,
    'https://github.com/eqtylab/my-repo'
  );
});

test('a deeper GitHub URL is kept as written', () => {
  const url = 'https://github.com/eqtylab/monorepo/tree/main/docs';
  assert.equal(resolveConfig({ title: 'x', github: url }).github, url);
});

test('a github value that names no repo fails the build, quoting it', () => {
  assert.throws(() => resolveConfig({ title: 'x', github: '' }), /github: .*""/);
  assert.throws(() => resolveConfig({ title: 'x', github: 'my-repo' }), /github: .*"my-repo"/);
  assert.throws(
    () => resolveConfig({ title: 'x', github: 'https://gitlab.com/a/b' }),
    /github: .*gitlab/
  );
});
