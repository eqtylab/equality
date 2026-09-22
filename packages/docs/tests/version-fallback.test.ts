import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveVersionedPath } from '../src/paths.ts';

const REDIRECTS = [
  { id: 'v3.2.4', to: 'v3.2' },
  { id: 'v3.9.1', to: 'v3.9' },
  { id: 'v4.0.0', to: null },
  { id: 'v3', to: 'v3.9' },
];
const COPIES = ['v3.9', 'v3.2'];
const opts = { base: '/', copyIds: COPIES, redirects: REDIRECTS };

test('a deep URL under a redirected release keeps its page', () => {
  assert.equal(
    resolveVersionedPath('/v3.2.4/components/button/', opts),
    '/v3.2/components/button/'
  );
});

test('a release redirecting to latest drops the segment', () => {
  assert.equal(resolveVersionedPath('/v4.0.0/components/button/', opts), '/components/button/');
});

test('a coarse group stub resolves like any other redirect', () => {
  assert.equal(resolveVersionedPath('/v3/components/button/', opts), '/v3.9/components/button/');
});

test('a live copy with a missing page goes to that version root, not to latest', () => {
  assert.equal(resolveVersionedPath('/v3.9/components/nope/', opts), '/v3.9/');
});

test('an ordinary 404 is left alone', () => {
  assert.equal(resolveVersionedPath('/components/nope/', opts), null);
  assert.equal(resolveVersionedPath('/', opts), null);
  assert.equal(resolveVersionedPath('/versions/x/', opts), null);
});

test('an unknown version segment is left alone', () => {
  assert.equal(resolveVersionedPath('/v9.9.9/components/button/', opts), null);
});

test('base and pathPrefix are stripped and reapplied', () => {
  const withPrefix = { base: '/site/', pathPrefix: 'docs', copyIds: COPIES, redirects: REDIRECTS };
  assert.equal(
    resolveVersionedPath('/site/docs/v3.2.4/components/button/', withPrefix),
    '/site/docs/v3.2/components/button/'
  );
});
