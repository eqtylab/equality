import * as React from 'react';
import type { SiteMenuRow } from '@eqtylab/docs/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Icon,
  PortalContainerProvider,
} from '@eqtylab/equality';

import { currentVersion, type SwitcherData } from '../lib/versions-ui.ts';
import { VersionMenuContent } from './VersionMenu.tsx';

/* w-fit: the gradient spans the element's box, so a full-width box gives a short name only the
   start of the fade, which reads as no gradient at all. */
const NAME =
  'eq-display-gradient-sm block w-fit text-base leading-tight font-semibold text-balance forced-colors:text-inherit';

/* The `before:` box is the 24px-tall hit area WCAG 2.5.8 asks for; the line itself is 16px. */
const VERSION_LINE =
  'eq-docs-label focus-ring hover:text-text-primary relative inline-flex items-center gap-1 rounded-sm before:absolute before:-inset-x-2 before:-inset-y-1 before:content-[""]';

/* Equality's Icon colours and sizes itself in unlayered CSS, which beats any utility; hence `!`. */
const SITE_CHEVRON = 'text-text-tertiary! [&_svg]:size-3.5!';
const VERSION_CHEVRON = 'text-inherit!';

/* Side padding must match NavTree's row `px-2` (7px + 1px border), or the name drifts off the
   nav labels' left edge. */
const CARD_BOX = 'rounded-lg border border-transparent px-[7px] py-[5px]';

function VersionLine({ data }: { data: SwitcherData }) {
  const current = currentVersion(data);
  return (
    // modal={false}: a modal Radix menu closes in the same tap that opens it on iOS Safari.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={VERSION_LINE}
          aria-label={`Version ${current.label}, change version`}
        >
          {current.label}
          <Icon icon="ChevronDown" size="xs" className={VERSION_CHEVRON} />
        </button>
      </DropdownMenuTrigger>
      <VersionMenuContent data={data} align="start" />
    </DropdownMenu>
  );
}

function SiteMenu({
  title,
  sites,
  hasVersion,
}: {
  title: string;
  sites: SiteMenuRow[];
  hasVersion: boolean;
}) {
  const current = sites.find((site) => site.current)!;
  const go = (href: string) => {
    if (href !== current.href) window.location.assign(href);
  };
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        {/* group-hover, not hover: the version line sits on top of this button, and the card
            keeps its hover while the pointer is over it. */}
        <button
          type="button"
          className={`${CARD_BOX} focus-ring group-hover/card:bg-background data-[state=open]:border-brand-primary data-[state=open]:bg-background flex w-full items-center gap-3 text-left transition-colors`}
          aria-label={`Switch docs site, current: ${title}`}
        >
          <span className="min-w-0 flex-1">
            <span className={NAME}>{title}</span>
            {/* The version line sits on top of this space, because a button cannot hold another.
                Keep this height equal to eq-docs-label's 16px line height or the two overlap. */}
            {hasVersion && <span className="mt-1 block h-4" aria-hidden="true" />}
          </span>
          <Icon icon="ChevronsUpDown" size="xs" className={SITE_CHEVRON} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[max(16rem,var(--radix-dropdown-menu-trigger-width))]"
      >
        <DropdownMenuLabel className="eq-docs-label">EQTY Lab docs</DropdownMenuLabel>
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
    <div ref={ref} className="group/card relative -mt-1.5">
      {sites ? (
        <SiteMenu title={title} sites={sites} hasVersion={Boolean(versions)} />
      ) : (
        <div className={CARD_BOX}>
          <p className={NAME}>{title}</p>
          {versions && (
            <span className="mt-1 flex">
              <VersionLine data={versions} />
            </span>
          )}
        </div>
      )}
      {sites && versions && (
        <span className="absolute bottom-1.5 left-2 flex">
          <VersionLine data={versions} />
        </span>
      )}
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
