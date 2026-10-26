import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { NavDrill, NavDrillLevel } from '@/components/nav-list/nav-drill';
import { NavList } from '@/components/nav-list/nav-list';

// React 18 warns on every server render that reaches a raw useLayoutEffect; the suite runs on 19,
// which does not, so the test checks NavDrill goes through the helper that avoids it
const calls = vi.hoisted(() => ({ count: 0 }));
vi.mock('@/lib/use-isomorphic-layout-effect', () => ({
  useIsomorphicLayoutEffect: (...args: Parameters<typeof React.useEffect>) => {
    calls.count++;
    return Reflect.apply(React.useEffect, undefined, args);
  },
}));

describe('NavDrill on the server', () => {
  it('runs its layout effects through useIsomorphicLayoutEffect', () => {
    renderToString(
      <NavList>
        <NavDrill defaultValue="a">
          <NavDrillLevel value="a" />
        </NavDrill>
      </NavList>
    );
    expect(calls.count).toBeGreaterThanOrEqual(2);
  });
});
