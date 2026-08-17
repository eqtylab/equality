import * as React from 'react';

import type { Theme } from '@/theme/lib/utils';

import { ThemeScopeContext } from './theme-scope';

interface ThemeScopeProviderProps {
  /** The theme everything below this point is rendering on. */
  theme: Theme;
  children: React.ReactNode;
}

/**
 * Declares which theme a subtree is rendering on, and nothing else — no styles, no
 * DOM.
 *
 * Almost everything themes through CSS custom properties on the nearest
 * `[data-equality-theme]` ancestor, so it needs no help. The exception is `CodeBlock`,
 * which picks a syntax palette in JavaScript; without a scope it falls back to the
 * page-wide theme state, which is wrong in two situations:
 *
 * - **More than one theme on screen.** The page-wide value is a single global, so a
 *   dark subtree gets a light code block, or the reverse.
 * - **Shadow DOM.** The fallback resolves the theme by walking the document, and
 *   `document.querySelector` cannot see into a shadow tree.
 *
 * `ThemeProvider` renders one of these when given a `theme`, and is what an app should
 * reach for. This exists for hosts that cannot afford a second `ThemeProvider` — it
 * carries the scoped theme CSS and an unstyled wrapper element, which a host's own
 * layout may not survive. Setting the theme is the only part of it they want.
 */
const ThemeScopeProvider = ({ theme, children }: ThemeScopeProviderProps) => (
  <ThemeScopeContext.Provider value={theme}>{children}</ThemeScopeContext.Provider>
);

export { ThemeScopeProvider };
