import { describe, expect, it } from 'vitest';

import * as Equality from '@/index';

describe('nav exports', () => {
  it('exports the parts a caller writes', () => {
    for (const name of [
      'NavList',
      'NavListGroup',
      'NavListItem',
      'NavListSeparator',
      'NavDrill',
      'NavDrillLevel',
      'NavPanel',
      'NavRail',
      'NavRailItem',
      'NavSwitcher',
      'blockClosedTypeahead',
    ]) {
      expect(Equality).toHaveProperty(name);
    }
  });

  it('keeps the list, the ‹ row and the switcher placeholder private', () => {
    for (const name of [
      'Menu',
      'MenuGroup',
      'MenuItem',
      'MenuList',
      'MenuSeparator',
      'MenuDrill',
      'MenuDrillLevel',
      'MenuBackButton',
      'NavSwitcherPlaceholder',
    ]) {
      expect(Equality).not.toHaveProperty(name);
    }
  });
});
