import * as React from 'react';

import type { Theme } from '@/theme/lib/utils';

/**
 * `undefined` means no scope is declared, so consumers fall back to the page-wide
 * theme state.
 */
export const ThemeScopeContext = React.createContext<Theme | undefined>(undefined);

/**
 * The theme the surrounding subtree is rendering on, if one has been declared.
 *
 * Components that need to branch on the theme in JavaScript — currently only
 * `CodeBlock`, for its syntax palette — should prefer this over `useTheme`, which
 * resolves a single page-wide value and so gets it wrong whenever more than one theme
 * is on screen, or whenever the theme root is inside a shadow tree that
 * `document.querySelector` cannot see.
 */
export function useThemeScope(): Theme | undefined {
  return React.useContext(ThemeScopeContext);
}
