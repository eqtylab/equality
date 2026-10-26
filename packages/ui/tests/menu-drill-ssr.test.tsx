import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Menu } from '@/components/menu/menu';
import { MenuDrill, MenuDrillLevel } from '@/components/menu/menu-drill';

// React 18 warns on every server render that reaches a raw useLayoutEffect; the suite runs on 19,
// which does not, so the test checks MenuDrill goes through the helper that avoids it
const calls = vi.hoisted(() => ({ count: 0 }));
vi.mock('@/lib/use-isomorphic-layout-effect', () => ({
  useIsomorphicLayoutEffect: (...args: Parameters<typeof React.useEffect>) => {
    calls.count++;
    return Reflect.apply(React.useEffect, undefined, args);
  },
}));

describe('MenuDrill on the server', () => {
  it('runs its layout effects through useIsomorphicLayoutEffect', () => {
    renderToString(
      <Menu>
        <MenuDrill defaultView="a">
          <MenuDrillLevel value="a" />
        </MenuDrill>
      </Menu>
    );
    expect(calls.count).toBeGreaterThanOrEqual(2);
  });
});
