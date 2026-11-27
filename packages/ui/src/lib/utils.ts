import { PORTAL_ROOT_ID } from '@/theme/portal-container';

export { cn } from '@/lib/cn';

/**
 * @deprecated Prefer the `usePortalContainer` hook, which respects a
 * `PortalContainerProvider` (or `ThemeProvider`) above it and so works inside a shadow
 * root and with more than one theme root on a page. This lookup resolves by a
 * document-unique id and can do neither.
 */
export function getThemeProviderRoot() {
  return document.getElementById(PORTAL_ROOT_ID);
}
