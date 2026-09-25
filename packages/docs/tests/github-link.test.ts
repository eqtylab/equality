import assert from 'node:assert/strict';
import { test } from 'node:test';

import { brandAssets } from '../src/config.ts';
import { EQTY_GITHUB, githubUrl, withGithubLink } from '../src/internal/github-link.ts';

test('owner/repo expands, and a github.com URL is kept as written', () => {
  assert.equal(githubUrl('eqtylab/equality'), 'https://github.com/eqtylab/equality');
  assert.equal(
    githubUrl('https://github.com/eqtylab/equality'),
    'https://github.com/eqtylab/equality'
  );
  assert.equal(
    githubUrl('https://github.com/eqtylab/mono/tree/main/docs'),
    'https://github.com/eqtylab/mono/tree/main/docs'
  );
});

test('a value that names no GitHub repo reads as none', () => {
  for (const value of ['', 'equality', 'https://gitlab.com/a/b', 'github:a/b', 'a/b/c']) {
    assert.equal(githubUrl(value), undefined, value);
  }
});

test('the github option becomes a header link with the shipped icon', () => {
  assert.deepEqual(withGithubLink([], 'https://github.com/eqtylab/equality'), [
    {
      label: 'GitHub',
      href: 'https://github.com/eqtylab/equality',
      icon: brandAssets.github,
      external: true,
    },
  ]);
});

test('unset, the link points at the EQTY Lab organisation', () => {
  assert.equal(withGithubLink([], undefined)[0].href, EQTY_GITHUB);
});

test('github: false adds nothing', () => {
  assert.deepEqual(withGithubLink([], false), []);
});

test("a site's own GitHub link is not doubled, and gains the icon it lacks", () => {
  const own = [{ label: 'GitHub', href: 'https://github.com/eqtylab/vcomp-docs', external: true }];
  assert.deepEqual(withGithubLink(own, undefined), [{ ...own[0], icon: brandAssets.github }]);
});

test("a site's own icon on its GitHub link is kept", () => {
  const own = [{ label: 'Source', href: 'https://github.com/a/b', icon: 'Code' }];
  assert.deepEqual(withGithubLink(own, undefined), own);
});

test('github: false still gives a hand-written GitHub link its icon', () => {
  const own = [{ label: 'GitHub', href: 'https://github.com/a/b' }];
  assert.equal(withGithubLink(own, false)[0].icon, brandAssets.github);
});

test('non-GitHub links are left alone, and the GitHub link follows them', () => {
  const own = [{ label: 'Blog', href: 'https://eqtylab.io/blog' }];
  assert.deepEqual(
    withGithubLink(own, undefined).map((l) => [l.label, l.icon]),
    [
      ['Blog', undefined],
      ['GitHub', brandAssets.github],
    ]
  );
});
