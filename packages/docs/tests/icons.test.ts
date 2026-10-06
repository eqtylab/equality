import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveIcons } from '../src/internal/icons.ts';

test('a Lucide icon resolves to its viewBox and stroked body', () => {
  const icons = resolveIcons(['lucide:pencil']);
  assert.equal(icons['lucide:pencil'].viewBox, '0 0 24 24');
  assert.match(icons['lucide:pencil'].body, /stroke="currentColor"/);
});

test('a logo from Simple Icons resolves', () => {
  assert.match(
    resolveIcons(['simple-icons:github'])['simple-icons:github'].body,
    /fill="currentColor"/
  );
});

test('a name used twice resolves once', () => {
  assert.deepEqual(Object.keys(resolveIcons(['lucide:pencil', 'lucide:pencil'])), [
    'lucide:pencil',
  ]);
});

test('an unknown icon fails and names it', () => {
  assert.throws(
    () => resolveIcons(['lucide:pencl']),
    /Icon "lucide:pencl" not found in the lucide set/
  );
});
