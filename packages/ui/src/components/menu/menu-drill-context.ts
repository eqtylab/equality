import * as React from 'react';

export interface MenuDrillContextValue {
  requestDrill(view: string): void;
  leaving: boolean;
}

export const MenuDrillContext = React.createContext<MenuDrillContextValue | null>(null);
