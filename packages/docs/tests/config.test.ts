import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveConfig } from '../src/config.ts';

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
