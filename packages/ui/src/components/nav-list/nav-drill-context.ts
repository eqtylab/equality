import * as React from 'react';

export interface NavDrillContextValue {
  requestDrill(view: string): void;
  leaving: boolean;
}

export const NavDrillContext = React.createContext<NavDrillContextValue | null>(null);
