import * as React from 'react';

export interface NavDrillContextValue {
  requestDrill(view: string): void;
  leaving: boolean;
}

export const NavDrillContext = React.createContext<NavDrillContextValue | null>(null);

export interface FolderMemory {
  open: boolean;
  closedByReader: boolean;
}

// NavDrill rebuilds a level on every view change, so folder state kept only in NavListExpandable is lost
export const FolderMemoryContext = React.createContext<Map<string, FolderMemory> | null>(null);
