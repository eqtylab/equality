import * as React from 'react';

import { PortalContainerContext } from './portal-container';

interface PortalContainerProviderProps {
  /** Element every portalled surface below this point renders into. */
  container: HTMLElement | null;
  children: React.ReactNode;
}

/**
 * Supplies the container for portalled surfaces — tooltips, popovers, selects, dialogs,
 * sheets, drawers, dropdown menus.
 *
 * `ThemeProvider` renders one of these automatically, so most consumers never need it
 * directly. Reach for it when the container has to be an element you own:
 *
 * - **Shadow DOM.** `document.getElementById` cannot see into a shadow root, so the
 *   default lookup returns null and every portalled surface escapes to `document.body`
 *   — outside the shadow boundary, where the design system's styles don't reach.
 * - **More than one root on a page.** The default lookup resolves by a document-unique
 *   id, so a second root's portals land inside the first one's container.
 */
const PortalContainerProvider = ({ container, children }: PortalContainerProviderProps) => (
  <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>
);

export { PortalContainerProvider };
