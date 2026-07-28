import * as React from 'react';

import { Portal } from './portal';
import { PortalContainerProvider } from './portal-container-provider';
import styles from './theme.module.css';

interface ThemeProviderProps {
  customVars?: React.CSSProperties & {
    [key: `--${string}`]: string | number | undefined;
  };
  /**
   * Element that portalled surfaces render into, instead of the one this component
   * renders for itself.
   *
   * Needed wherever the default document-wide lookup can't find that element: inside a
   * shadow root, or with more than one theme root on a page. Pass `null` to portal to
   * the document body.
   */
  portalContainer?: HTMLElement | null;
  children: React.ReactNode;
}

const ThemeProvider = ({ customVars, portalContainer, children }: ThemeProviderProps) => {
  // State, not a ref: portalled children read the container while rendering, so they
  // need a re-render once the element actually exists.
  const [ownPortalContainer, setOwnPortalContainer] = React.useState<HTMLDivElement | null>(null);
  const usesOwnPortal = portalContainer === undefined;

  return (
    <PortalContainerProvider container={usesOwnPortal ? ownPortalContainer : portalContainer}>
      <div id="equality-theme-provider-root" className={styles.root} style={customVars}>
        {children}
        {usesOwnPortal && <Portal ref={setOwnPortalContainer} />}
      </div>
    </PortalContainerProvider>
  );
};

export { ThemeProvider };
