import assert from 'node:assert/strict';
import { test } from 'node:test';

import { linkTarget, siteHref } from '../src/paths.ts';

const atRoot = { base: '/' };
const inSubFolder = { base: '/integrity-py/' };

const issue = {
  label: 'Report an issue',
  href: 'https://github.com/a/b/issues/new',
  external: true,
};

test('a link starting with / gets the sub-folder; full URLs, // and # links do not', () => {
  assert.equal(linkTarget({ href: '/latest/' }, inSubFolder).href, '/integrity-py/latest/');
  assert.equal(linkTarget(issue, inSubFolder).href, issue.href);
  assert.equal(linkTarget({ href: '#props' }, inSubFolder).href, '#props');
  assert.equal(
    linkTarget({ href: '//cdn.example.com/x' }, inSubFolder).href,
    '//cdn.example.com/x'
  );
});

test('a / link gets the docs mount too, the same as a link in page text', () => {
  const ctx = { base: '/site/', pathPrefix: 'docs' };
  assert.equal(
    linkTarget({ href: '/getting-started/usage/' }, ctx).href,
    '/site/docs/getting-started/usage/'
  );
});

test('a link that already has the sub-folder keeps it once, as in page text', () => {
  assert.equal(
    linkTarget({ href: '/integrity-py/latest/' }, inSubFolder).href,
    '/integrity-py/latest/'
  );
});

test('a relative link is left alone', () => {
  assert.equal(linkTarget({ href: 'changelog/' }, inSubFolder).href, 'changelog/');
});

test('a link opens a new tab only with external: true', () => {
  assert.equal(linkTarget(issue, atRoot).external, true);
  assert.equal(linkTarget({ href: 'https://example.com' }, atRoot).external, false);
});

test('configured links and page text place / links the same way, at every base', async () => {
  const { rewriteHtmlBase } = await import('../src/internal/rehype-base-url.ts');
  for (const [base, pathPrefix] of [
    ['/', 'docs'],
    ['/site/', 'docs'],
    ['/', undefined],
  ] as const) {
    const pageText = rewriteHtmlBase('<a href="/latest/">x</a>', base, pathPrefix).match(
      /href="([^"]*)"/
    )![1];
    assert.equal(
      linkTarget({ href: '/latest/' }, { base, pathPrefix }).href,
      pageText,
      `${base} ${pathPrefix}`
    );
  }
});

test('a / link in a pinned copy stays inside that copy', () => {
  assert.equal(siteHref('/examples/', { base: '/', versionPrefix: 'v3.9' }), '/v3.9/examples/');
  assert.equal(
    siteHref('https://pypi.org/', { base: '/', versionPrefix: 'v3.9' }),
    'https://pypi.org/'
  );
});
