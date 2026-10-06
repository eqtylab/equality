import {
  DropdownMenuContent,
  DropdownMenuEmpty,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSearch,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@eqtylab/equality';

import { currentVersion, type SwitcherData } from '../lib/versions-ui.ts';

/* Radix caps both surfaces at the height available below the trigger and Equality sets no
   overflow, so a list taller than that cap spills instead of scrolling. Searching is when that
   bites: every match is lifted out of its submenu into the root, which then holds all
   twenty-seven. A `max-h` of our own is not the fix and does not even apply, measured: Equality's
   own cap is unlayered CSS and beats a utility whatever the value. */
const SURFACE = 'overflow-y-auto';

interface Props {
  data: SwitcherData;
  align: 'start' | 'end';
}

/**
 * The version list. A radio item does not follow an href on its own, hence the navigation in
 * `onValueChange`.
 *
 * A radio group cannot cross a portal, so each menu surface carries its own: the top level for
 * latest, and one inside every major's submenu. Only the group holding the current version shows
 * a checked item, which is what the reader wants.
 */
export function VersionMenuContent({ data, align }: Props) {
  const current = currentVersion(data);
  const go = (href: string) => {
    if (href !== current.href) window.location.assign(href);
  };

  return (
    <DropdownMenuContent align={align} className={SURFACE}>
      {/* Nesting holds the browse case to four rows; this holds the jump case, which nesting
          makes worse by burying a version one hover deep. Typing lifts every match out of its
          submenu into this list, each carrying its major as a breadcrumb. */}
      <DropdownMenuSearch alwaysVisible placeholder="Search versions..." />
      <DropdownMenuEmpty>No matching version</DropdownMenuEmpty>
      <DropdownMenuRadioGroup value={current.href} onValueChange={go}>
        {/* A heading, not a suffix on the name: the trigger shows the version alone, and
            "v4.1 (latest)" would then disagree with it and read twice in the banner. */}
        <DropdownMenuLabel>Latest</DropdownMenuLabel>
        <DropdownMenuRadioItem value={data.latest.href}>{data.latest.label}</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      {data.groups.map((group) => (
        <DropdownMenuSub key={group.label}>
          <DropdownMenuSubTrigger>
            <span>{group.label}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className={SURFACE}>
            <DropdownMenuRadioGroup value={current.href} onValueChange={go}>
              {group.items.map((item) => (
                <DropdownMenuRadioItem key={item.href} value={item.href}>
                  {item.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      ))}
    </DropdownMenuContent>
  );
}
