import {
  DropdownMenu,
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
  DropdownMenuTrigger,
  Icon,
} from '@eqtylab/equality';

import type { SwitcherData } from '../lib/versions-ui.ts';
import styles from './VersionSwitcher.module.css';

interface Props {
  data: SwitcherData;
  /** Header's `.navLink`, so the trigger sits beside the links unaltered. */
  className?: string;
}

/**
 * Picks a version. `modal={false}`: a modal Radix menu closes in the same tap that opens it on
 * iOS Safari, the bug the theme menu had. A radio item does not follow an href on its own,
 * hence the navigation in `onValueChange`.
 *
 * A radio group cannot cross a portal, so each menu surface carries its own: the top level for
 * latest, and one inside every major's submenu. Only the group holding the current version shows
 * a checked item, which is what the reader wants.
 */
export default function VersionSwitcher({ data, className }: Props) {
  const items = [data.latest, ...data.groups.flatMap((g) => g.items)];
  const current = items.find((i) => i.current) ?? data.latest;
  const go = (href: string) => {
    if (href !== current.href) window.location.assign(href);
  };

  return (
    <div className={styles.wrap}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={[className, styles.trigger].filter(Boolean).join(' ')}
            aria-label={`Version: ${current.label}. Choose a version`}
          >
            <Icon icon="Tag" size="sm" />
            <span className={styles.label}>{current.label}</span>
            <Icon icon="ChevronDown" size="sm" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={styles.menu}>
          {/* Nesting holds the browse case to four rows; this holds the jump case, which nesting
              makes worse by burying a version one hover deep. Typing lifts every match out of its
              submenu into this list, each carrying its major as a breadcrumb. */}
          <DropdownMenuSearch alwaysVisible placeholder="Search versions..." />
          <DropdownMenuRadioGroup value={current.href} onValueChange={go}>
            {/* A heading, not a suffix on the name: the trigger shows the version alone, and
                "v4.1 (latest)" would then disagree with it and read twice in the banner. */}
            <DropdownMenuLabel>Latest</DropdownMenuLabel>
            <DropdownMenuRadioItem value={data.latest.href}>
              {data.latest.label}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          {data.groups.map((group) => (
            <DropdownMenuSub key={group.label}>
              <DropdownMenuSubTrigger>
                <span>{group.label}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={styles.submenu}>
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
          <DropdownMenuEmpty>No matching version</DropdownMenuEmpty>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
