import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  rehypeBaseUrl,
  rewriteHtmlBase,
  versionFromPath,
} from '../src/internal/rehype-base-url.ts';

function tree(href: string) {
  return {
    type: 'root',
    children: [{ type: 'element', tagName: 'a', properties: { href }, children: [] }],
  };
}
function hrefOf(t: ReturnType<typeof tree>) {
  return t.children[0]!.properties.href;
}

test('versionFromPath reads the id from a cache path and nothing else', () => {
  assert.equal(
    versionFromPath(
      '/p/.astro/eqty-docs/versions/v3.9/components/button.mdx',
      '/p/.astro/eqty-docs/versions'
    ),
    'v3.9'
  );
  assert.equal(
    versionFromPath('/p/src/content/docs/components/button.mdx', '/p/.astro/eqty-docs/versions'),
    undefined
  );
  assert.equal(versionFromPath(undefined, '/p/.astro/eqty-docs/versions'), undefined);
});

test('latest with base / is untouched', () => {
  const t = tree('/components/button/');
  rehypeBaseUrl({ base: '/' })(t, { path: '/p/src/content/docs/a.mdx' });
  assert.equal(hrefOf(t), '/components/button/');
});

test('a versioned file gets its version segment', () => {
  const t = tree('/components/button/');
  rehypeBaseUrl({ base: '/', versionsDir: '/p/.astro/eqty-docs/versions' })(t, {
    path: '/p/.astro/eqty-docs/versions/v3.9/components/alert.mdx',
  });
  assert.equal(hrefOf(t), '/v3.9/components/button/');
});

test('base and pathPrefix and version compose in route order', () => {
  const t = tree('/docs/components/button/');
  rehypeBaseUrl({ base: '/site/', pathPrefix: 'docs', versionsDir: '/p/v' })(t, {
    path: '/p/v/v3.9/a.mdx',
  });
  assert.equal(hrefOf(t), '/site/docs/v3.9/components/button/');
});

test('external, fragment and already-prefixed URLs are left alone', () => {
  for (const href of ['https://x.y/', '#top', '/site/already/']) {
    const t = tree(href);
    rehypeBaseUrl({ base: '/site/' })(t, { path: '/p/a.mdx' });
    assert.equal(hrefOf(t), href);
  }
});

test('rewriteHtmlBase takes the same version', () => {
  assert.equal(
    rewriteHtmlBase('See <a href="/components/sheet/">Sheet</a>', '/', undefined, 'v3.9'),
    'See <a href="/v3.9/components/sheet/">Sheet</a>'
  );
  assert.equal(
    rewriteHtmlBase('<a href="/x/">x</a>', '/', undefined, undefined),
    '<a href="/x/">x</a>'
  );
});
