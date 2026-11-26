import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import { PORTAL_ROOT_ID } from '@/theme/portal-container';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['xxs', 'title', 'title-2', 'section', 'body', 'caption'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @deprecated Prefer the `usePortalContainer` hook, which respects a
 * `PortalContainerProvider` (or `ThemeProvider`) above it and so works inside a shadow
 * root and with more than one theme root on a page. This lookup resolves by a
 * document-unique id and can do neither.
 */
export function getThemeProviderRoot() {
  return document.getElementById(PORTAL_ROOT_ID);
}
