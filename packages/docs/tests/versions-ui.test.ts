import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isSwitcherData, withCurrent } from '../src/runtime/lib/versions-ui.ts';

const list = {
  latest: { label: 'v1.3.0', href: '/', current: false },
  groups: [{ label: 'v1', items: [{ label: 'v1.2.1', href: '/v1-2-1/', current: false }] }],
};

test('withCurrent marks the matching item current and clears the rest', () => {
  const marked = withCurrent({ ...list, latest: { ...list.latest, current: true } }, '/v1-2-1/');
  assert.equal(marked?.latest.current, false);
  assert.equal(marked?.groups[0].items[0].current, true);
});

test('withCurrent returns null when the list does not contain the page', () => {
  assert.equal(withCurrent(list, '/v1-3-1/'), null);
});

test('isSwitcherData accepts the switcher shape and rejects anything malformed', () => {
  assert.equal(isSwitcherData(list), true);
  assert.equal(isSwitcherData(null), false);
  assert.equal(isSwitcherData({ ...list, groups: [null] }), false);
  assert.equal(isSwitcherData({ latest: list.latest }), false);
  assert.equal(
    isSwitcherData({ ...list, groups: [{ label: 'v1', items: [{ label: 'x' }] }] }),
    false
  );
});
