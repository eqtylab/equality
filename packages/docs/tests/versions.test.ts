import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Granularity } from '../src/versions.ts';
import { groupOf, highestTag, idOf, parseTag, selectVersions, suffixOf } from '../src/versions.ts';

test('parseTag accepts v-prefixed and bare MAJOR.MINOR.PATCH, rejects the rest', () => {
  assert.deepEqual(parseTag('v3.9.1'), {
    tag: 'v3.9.1',
    major: 3,
    minor: 9,
    patch: 1,
    version: '3.9.1',
  });
  assert.deepEqual(parseTag('3.9.1'), {
    tag: '3.9.1',
    major: 3,
    minor: 9,
    patch: 1,
    version: '3.9.1',
  });
  assert.equal(parseTag('v10.0.0-beta.1'), null);
  assert.equal(parseTag('nightly'), null);
  assert.equal(parseTag('v3.9'), null);
});

test('parseTag reads the version out of a prefixed tag, and keeps the tag whole', () => {
  // A consumer whose releases are not tagged the way ours are still has to work: the glob
  // finds their tags and this is what turns each one into a version. The raw tag is carried
  // through untouched, because extraction addresses git by the tag, not by the version.
  for (const [tag, version] of [
    ['@eqtylab/equality@1.2.3', '1.2.3'],
    ['sdk-v1.2.3', '1.2.3'],
    ['integrity-sdk/2.0.1', '2.0.1'],
    ['release-2.3.4', '2.3.4'],
  ] as const) {
    const parsed = parseTag(tag);
    assert.equal(parsed?.version, version, tag);
    assert.equal(parsed?.tag, tag, `${tag} keeps its own name`);
  }
});

test('parseTag still rejects what is not a release', () => {
  // The prefix is free, the version is not: these would each produce a wrong copy.
  for (const tag of ['v1.2.3.4', 'v1.2', '2024.01', 'sdk-v1.2.3-rc.1', 'latest']) {
    assert.equal(parseTag(tag), null, tag);
  }
});

test('groupOf, idOf, suffixOf follow the one naming rule', () => {
  const v = parseTag('v3.9.1')!;
  assert.equal(groupOf(v, 'major'), '3');
  assert.equal(groupOf(v, 'minor'), '3.9');
  assert.equal(groupOf(v, 'patch'), '3.9.1');
  assert.equal(idOf('3.9'), 'v3.9');
  assert.equal(suffixOf('v3.9'), 'v3_9');
  assert.equal(suffixOf('v3'), 'v3');
});

test('highestTag ignores non-semver tags and orders numerically', () => {
  assert.equal(highestTag(['v1.2.0', 'v1.10.0', 'v1.9.0', 'nightly'])!.tag, 'v1.10.0');
  assert.equal(highestTag(['nightly']), null);
  assert.equal(highestTag([]), null);
});

const TAGS = ['v3.2.0', 'v3.9.1', 'v3.9.0', 'v4.0.0', 'v2.5.0', 'v2.4.1', 'nightly', 'v1.9.1'];

test('minor granularity: highest tag per minor below the current group, newest first', () => {
  const sel = selectVersions(TAGS, '4.0.0', 'minor');
  assert.deepEqual(
    sel.copies.map((c) => [c.id, c.suffix, c.group, c.tag]),
    [
      ['v3.9', 'v3_9', '3.9', 'v3.9.1'],
      ['v3.2', 'v3_2', '3.2', 'v3.2.0'],
      ['v2.5', 'v2_5', '2.5', 'v2.5.0'],
      ['v2.4', 'v2_4', '2.4', 'v2.4.1'],
      ['v1.9', 'v1_9', '1.9', 'v1.9.1'],
    ]
  );
  assert.deepEqual(sel.skipped, ['nightly']);
  assert.deepEqual(sel.above, []);
});

test('the current GROUP is excluded, not just the current tag', () => {
  const sel = selectVersions(['v2.1.0', 'v2.1.1', 'v2.0.0'], '2.1.1', 'minor');
  assert.deepEqual(
    sel.copies.map((c) => c.id),
    ['v2.0']
  );
  // 2.1.0 is in the current group: it redirects to latest, it does not get a copy.
  // Tag redirects first, then group stubs level by level, finest first, newest first inside a level.
  assert.deepEqual(sel.redirects, [
    { id: 'v2.0.0', to: 'v2.0' },
    { id: 'v2.1.0', to: null },
    { id: 'v2.1.1', to: null },
    { id: 'v2.1', to: null },
    { id: 'v2', to: null },
  ]);
});

test('every tag in a covered group redirects, the pick included; self-redirects are dropped', () => {
  const minor = selectVersions(['v3.9.0', 'v3.9.1', 'v4.0.0'], '4.0.0', 'minor');
  assert.deepEqual(minor.redirects, [
    { id: 'v3.9.0', to: 'v3.9' },
    { id: 'v3.9.1', to: 'v3.9' },
    { id: 'v4.0.0', to: null },
    { id: 'v4.0', to: null },
    { id: 'v4', to: null },
    { id: 'v3', to: 'v3.9' },
  ]);
  const patch = selectVersions(['v3.9.0', 'v3.9.1', 'v4.0.0'], '4.0.0', 'patch');
  assert.deepEqual(
    patch.copies.map((c) => c.id),
    ['v3.9.1', 'v3.9.0']
  );
  // At patch the copy id equals the tag id, so neither tag redirects. The group stubs are what
  // keep /v3.9/ and /v3/ alive across a granularity change: without them this flip is breaking.
  assert.deepEqual(patch.redirects, [
    { id: 'v4.0.0', to: null },
    { id: 'v4.0', to: null },
    { id: 'v3.9', to: 'v3.9.1' },
    { id: 'v4', to: null },
    { id: 'v3', to: 'v3.9.1' },
  ]);
});

test('moving between minor and patch keeps every URL shape', () => {
  const tags = ['v3.9.0', 'v3.9.1', 'v4.0.0'];
  const at = (g: Granularity) => {
    const sel = selectVersions(tags, '4.0.0', g);
    const ids = new Set([...sel.copies.map((c) => c.id), ...sel.redirects.map((r) => r.id)]);
    return ['v3', 'v3.9', 'v3.9.1'].every((id) => ids.has(id));
  };
  assert.ok(at('minor'), '/v3/, /v3.9/ and /v3.9.1/ all resolve at minor');
  assert.ok(at('patch'), '/v3/, /v3.9/ and /v3.9.1/ all resolve at patch');
});

test('tags above current are reported and ignored', () => {
  const sel = selectVersions(['v3.9.1', 'v4.0.0', 'v5.0.0'], '4.0.0', 'major');
  assert.deepEqual(
    sel.copies.map((c) => c.id),
    ['v3']
  );
  assert.deepEqual(sel.above, ['v5.0.0']);
});

test('a skipped group redirects to the nearest lower covered group, or to latest when none', () => {
  const sel = selectVersions(['v1.0.0', 'v2.0.0', 'v3.0.0', 'v4.0.0'], '4.0.0', 'major', [
    '2',
    '1',
  ]);
  assert.deepEqual(
    sel.copies.map((c) => c.id),
    ['v3']
  );
  assert.deepEqual(sel.redirects, [
    { id: 'v1.0.0', to: null },
    { id: 'v2.0.0', to: null },
    { id: 'v3.0.0', to: 'v3' },
    { id: 'v4.0.0', to: null },
    { id: 'v4', to: null },
  ]);
  const sel2 = selectVersions(['v1.0.0', 'v2.0.0', 'v3.0.0', 'v4.0.0'], '4.0.0', 'major', ['2']);
  assert.deepEqual(
    sel2.redirects.find((r) => r.id === 'v2.0.0'),
    { id: 'v2.0.0', to: 'v1' }
  );
});

// Dormant: no tags means no copies, so no group stubs either. Byte-identical to a build today.
test('no tags means no copies and no redirects', () => {
  assert.deepEqual(selectVersions([], '4.0.0', 'minor'), {
    copies: [],
    redirects: [],
    skipped: [],
    above: [],
  });
});

test('a non-semver current is an error', () => {
  assert.throws(() => selectVersions(['v1.0.0'], 'latest', 'major'), /versions\.current/);
});

test('the current version gets its stubs without being tagged, but never when dormant', () => {
  // Equality's state on the day this shipped: 3.9.1 tagged, 4.0.0 only in config.
  const sel = selectVersions(['v3.9.1'], '4.0.0', 'minor');
  assert.deepEqual(
    sel.copies.map((c) => c.id),
    ['v3.9']
  );
  assert.deepEqual(sel.redirects, [
    { id: 'v3.9.1', to: 'v3.9' },
    { id: 'v4.0', to: null },
    { id: 'v4', to: null },
    { id: 'v3', to: 'v3.9' },
  ]);
  // No copies means dormant, and a seeded current must not switch the feature on.
  assert.deepEqual(selectVersions([], '4.0.0', 'minor').redirects, []);
});
