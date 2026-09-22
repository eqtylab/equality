import { Fragment } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
 */
export default function VersionSwitcher({ data, className }: Props) {
  const items = [data.latest, ...data.groups.flatMap((g) => g.items)];
  const current = items.find((i) => i.current) ?? data.latest;

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
          <DropdownMenuRadioGroup
            value={current.href}
            onValueChange={(href) => {
              if (href !== current.href) window.location.assign(href);
            }}
          >
            {/* A heading, not a suffix on the name: the trigger shows the version alone, and
                "v4.1 (latest)" would then disagree with it and read twice in the banner. */}
            <DropdownMenuLabel>Latest</DropdownMenuLabel>
            <DropdownMenuRadioItem value={data.latest.href}>
              {data.latest.label}
            </DropdownMenuRadioItem>
            {data.groups.map((group) => (
              <Fragment key={group.label}>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                {group.items.map((item) => (
                  <DropdownMenuRadioItem key={item.href} value={item.href}>
                    {item.label}
                  </DropdownMenuRadioItem>
                ))}
              </Fragment>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
