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
  /** Fetched on load to replace this list, so a frozen copy can offer later versions. */
  refresh?: string;
}

export function currentVersion(data: SwitcherData): SwitcherItem {
  return (
    [data.latest, ...data.groups.flatMap((g) => g.items)].find((i) => i.current) ?? data.latest
  );
}

/** Marks `href` current, or null when the list doesn't contain it. */
export function withCurrent(data: SwitcherData, href: string): SwitcherData | null {
  const mark = (item: SwitcherItem) => ({ ...item, current: item.href === href });
  const next = {
    ...data,
    latest: mark(data.latest),
    groups: data.groups.map((group) => ({ ...group, items: group.items.map(mark) })),
  };
  return [next.latest, ...next.groups.flatMap((g) => g.items)].some((i) => i.current) ? next : null;
}

export function isSwitcherData(value: unknown): value is SwitcherData {
  const item = (v: unknown) =>
    !!v &&
    typeof (v as SwitcherItem).label === 'string' &&
    typeof (v as SwitcherItem).href === 'string';
  const data = value as SwitcherData | null;
  return (
    !!data &&
    item(data.latest) &&
    Array.isArray(data.groups) &&
    data.groups.every(
      (g) => typeof g.label === 'string' && Array.isArray(g.items) && g.items.every(item)
    )
  );
}
