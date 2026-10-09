import * as React from 'react';
import type { SiteMenuRow } from '@eqtylab/docs/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Icon,
  PortalContainerProvider,
} from '@eqtylab/equality';

import {
  currentVersion,
  isSwitcherData,
  withCurrent,
  type SwitcherData,
} from '../lib/versions-ui.ts';
import { VersionMenuContent } from './VersionMenu.tsx';

/* w-fit: the gradient spans the element's box, so a full-width box gives a short name only the
   start of the fade, which reads as no gradient at all.
   -my-[0.05em]: the gradient pads the name so descenders aren't clipped. Without this the row
   grows to 33.6px and drops off the nav's 4px rhythm. */
const NAME =
  'eq-display-gradient-sm -my-[0.05em] block w-fit text-base leading-tight font-semibold text-balance forced-colors:text-inherit';

/* Equality's Icon colours and sizes itself in unlayered CSS, which beats any utility; hence `!`. */
const QUIET_ICON = 'text-text-tertiary! [&_svg]:size-3.5!';
const TAG_ICON = 'text-text-secondary! [&_svg]:size-3.5!';

/* Side padding must match NavTree's row `px-2` (7px + 1px border), or the text drifts off the
   nav labels' left edge. */
const BOX = 'rounded-lg border border-transparent px-[7px] py-[5px]';
const ROW = `${BOX} focus-ring hover:bg-background data-[state=open]:border-brand-primary data-[state=open]:bg-background flex w-full items-center text-left transition-colors`;

/* Trigger width, not a 16rem floor: the sidebar's border leaves each row 255px on desktop, and a
   16rem menu overhangs its row by a pixel. */
const MENU = {
  align: 'start',
  sideOffset: 8,
  className: 'w-(--radix-dropdown-menu-trigger-width)',
} as const;

/* The sidebar and the phone drawer each render a VersionRow, so they share one request. */
const refreshed = new Map<string, Promise<unknown>>();

function refreshedList(url: string): Promise<unknown> {
  if (!refreshed.has(url)) {
    refreshed.set(
      url,
      fetch(url, { headers: { Accept: 'application/json' } })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null)
    );
  }
  return refreshed.get(url)!;
}

function VersionRow({ data: built }: { data: SwitcherData }) {
  const [data, setData] = React.useState(built);
  React.useEffect(() => {
    if (!built.refresh) return;
    let cancelled = false;
    refreshedList(built.refresh).then((next) => {
      const marked = isSwitcherData(next) && withCurrent(next, currentVersion(built).href);
      if (marked && !cancelled) setData(marked);
    });
    return () => {
      cancelled = true;
    };
  }, [built]);

  const current = currentVersion(data);
  return (
    // modal={false}: a modal Radix menu closes in the same tap that opens it on iOS Safari.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`${ROW} gap-2 text-sm font-medium tabular-nums`}
          aria-label={`Version ${current.label}, change version`}
        >
          <Icon icon="Tag" size="xs" className={TAG_ICON} />
          {current.label}
          <Icon icon="ChevronDown" size="xs" className={`${QUIET_ICON} ml-auto`} />
        </button>
      </DropdownMenuTrigger>
      <VersionMenuContent data={data} {...MENU} />
    </DropdownMenu>
  );
}

function SiteMenu({ title, sites }: { title: string; sites: SiteMenuRow[] }) {
  const current = sites.find((site) => site.current)!;
  const go = (href: string) => {
    if (href !== current.href) window.location.assign(href);
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`${ROW} gap-3`}
          aria-label={`Switch docs site, current: ${title}`}
        >
          <span className="min-w-0 flex-1">
            <span className={NAME}>{title}</span>
          </span>
          <Icon icon="ChevronsUpDown" size="xs" className={QUIET_ICON} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent {...MENU}>
        <DropdownMenuRadioGroup value={current.href} onValueChange={go}>
          {sites.map((site) => (
            <DropdownMenuRadioItem key={site.href} value={site.href} textValue={site.title}>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-text-primary text-sm font-medium">{site.title}</span>
                <span
                  className={
                    site.detailIsAddress
                      ? // Secondary, not the mockup's tertiary: tertiary at 12px is under 4.5:1 in light.
                        'text-text-secondary truncate font-mono text-xs'
                      : 'text-text-secondary line-clamp-2 text-xs'
                  }
                >
                  {site.detail}
                </span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface Props {
  title: string;
  /** `null`: a plain label. */
  sites: SiteMenuRow[] | null;
  /** Absent when versioning is dormant or off. */
  versions?: SwitcherData;
  inDrawer?: boolean;
}

export default function SiteCardControls({ title, sites, versions, inDrawer = false }: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [drawer, setDrawer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    if (inDrawer) setDrawer(ref.current?.closest<HTMLElement>('[popover]') ?? null);
  }, [inDrawer]);

  const card = (
    <div ref={ref} className="-mt-1.5 flex flex-col gap-1">
      {sites ? (
        <SiteMenu title={title} sites={sites} />
      ) : (
        <div className={BOX}>
          <p className={NAME}>{title}</p>
        </div>
      )}
      {versions && <VersionRow data={versions} />}
    </div>
  );

  /* The drawer is a popover, painted in the browser's top layer, and a menu portalled to <body>
     renders underneath it. Rendering the menus inside the drawer is the only way above it. */
  return inDrawer ? (
    <PortalContainerProvider container={drawer}>{card}</PortalContainerProvider>
  ) : (
    card
  );
}
