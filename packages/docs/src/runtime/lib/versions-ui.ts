/** Shapes the chrome receives. Computed at build in the route; the components hold no logic. */
export interface SwitcherItem {
  label: string;
  href: string;
  current: boolean;
}

export interface SwitcherData {
  latest: SwitcherItem;
  /** One group per major, newest first; items newest first. */
  groups: Array<{ label: string; items: SwitcherItem[] }>;
}
