import assert from 'node:assert/strict';
import { test } from 'node:test';

import { brandAssets } from '../src/config.ts';
import { EQTY_GITHUB, githubUrl, withGithubLink } from '../src/internal/github-link.ts';

test('reads every repository form npm accepts', () => {
  const want = 'https://github.com/eqtylab/equality';
  assert.equal(githubUrl('github:eqtylab/equality'), want);
  assert.equal(githubUrl('eqtylab/equality'), want);
  assert.equal(githubUrl('https://github.com/eqtylab/equality'), want);
  assert.equal(
    githubUrl({ type: 'git', url: 'git+https://github.com/eqtylab/equality.git' }),
    want
  );
  assert.equal(githubUrl({ url: 'git@github.com:eqtylab/equality.git' }), want);
  assert.equal(githubUrl({ url: 'git+ssh://git@github.com/eqtylab/equality.git' }), want);
});

test('a missing or non-GitHub repository reads as none', () => {
  assert.equal(githubUrl(undefined), undefined);
  assert.equal(githubUrl('gitlab:eqtylab/equality'), undefined);
  assert.equal(githubUrl({ url: 'https://gitlab.com/eqtylab/equality.git' }), undefined);
});

test("the site's repository becomes a GitHub header link with the shipped icon", () => {
  assert.deepEqual(withGithubLink([], undefined, 'github:eqtylab/equality'), [
    {
      label: 'GitHub',
      href: 'https://github.com/eqtylab/equality',
      icon: brandAssets.github,
      external: true,
    },
  ]);
});

test('with no repository the link falls back to the EQTY Lab organisation', () => {
  assert.equal(withGithubLink([], undefined, undefined)[0].href, EQTY_GITHUB);
});

test('an explicit github URL wins over the repository field', () => {
  const links = withGithubLink([], 'https://github.com/eqtylab/other', 'eqtylab/equality');
  assert.equal(links[0].href, 'https://github.com/eqtylab/other');
});

test('github: false adds nothing', () => {
  assert.deepEqual(withGithubLink([], false, 'eqtylab/equality'), []);
});

test('a hand-written GitHub link is not doubled', () => {
  const own = [{ label: 'Source', href: 'https://github.com/eqtylab/equality' }];
  assert.deepEqual(withGithubLink(own, undefined, 'eqtylab/equality'), own);
});

test('the GitHub link follows the site’s own links', () => {
  const own = [{ label: 'Blog', href: 'https://eqtylab.io/blog' }];
  const links = withGithubLink(own, undefined, undefined);
  assert.deepEqual(
    links.map((l) => l.label),
    ['Blog', 'GitHub']
  );
});
