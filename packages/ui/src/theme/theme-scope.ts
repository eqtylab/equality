import * as React from 'react';

import type { Theme } from '@/theme/lib/utils';

/**
 * The theme a subtree renders on, as declared by `<ThemeProvider theme />`.
 *
 * `undefined` means no theme was declared, so consumers fall back to the page-wide
 * theme state.
 */
export const ThemeScopeContext = React.createContext<Theme | undefined>(undefined);

/**
 * The theme the surrounding `ThemeProvider` was told it renders on, if it was told.
 *
 * Components that need to branch on the theme in JavaScript — currently only
 * `CodeBlock`, for its syntax palette — should prefer this over `useTheme`, which
 * resolves a single page-wide value and so gets it wrong whenever more than one theme
 * is on screen, or whenever the theme root is inside a shadow tree that
 * `document.querySelector` cannot see.
 *
 * Internal: the theme is set on `ThemeProvider` and nowhere else, so that every
 * component below it themes off the same value rather than taking its own prop.
 */
export function useThemeScope(): Theme | undefined {
  return React.useContext(ThemeScopeContext);
}
