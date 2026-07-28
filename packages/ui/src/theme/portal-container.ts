import * as React from 'react';

export const PORTAL_ROOT_ID = 'equality-theme-provider-root-portal';

/**
 * `undefined` means no provider is mounted, which is distinct from a provider
 * deliberately supplying `null` (portal to the document body).
 */
export const PortalContainerContext = React.createContext<HTMLElement | null | undefined>(
  undefined
);

/**
 * Container for portalled surfaces — tooltips, popovers, selects, dialogs, sheets,
 * drawers, dropdown menus.
 *
 * Resolves to whatever the nearest `PortalContainerProvider` supplies, falling back to
 * looking up `#equality-theme-provider-root-portal` in the document so consumers
 * predating this context keep working unchanged.
 */
export function usePortalContainer(): HTMLElement | null {
  const container = React.useContext(PortalContainerContext);
  if (container !== undefined) return container;
  return typeof document === 'undefined' ? null : document.getElementById(PORTAL_ROOT_ID);
}
