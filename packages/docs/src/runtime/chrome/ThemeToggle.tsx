import { useSyncExternalStore } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from '@eqtylab/equality';

import {
  getThemePreference,
  setThemePreference,
  subscribeToThemePreference,
  type ThemePreference,
} from '../lib/theme.ts';
import styles from './ThemeToggle.module.css';

/**
 * Three-state theme control: Dark, Light, System, with System the default.
 *
 * A dropdown rather than a switch because a switch is for a binary setting, and
 * pre-selecting System behind a two-state toggle tells the reader nothing about
 * what is actually in force.
 *
 * Composed from Equality's dropdown primitives rather than its packaged
 * `RadioDropdown`, whose options carry a label and a count but no icon. Adding
 * one would mean changing `packages/ui` for a single consumer; composing costs
 * a few lines and leaves the design system alone.
 *
 * Icons sit beside labels, never instead of them: an icon carrying the meaning
 * alone gets misread, and "System" has no conventional symbol at all.
 */
const OPTIONS: Array<{ value: ThemePreference; label: string; icon: string }> = [
  { value: 'dark', label: 'Dark', icon: 'Moon' },
  { value: 'light', label: 'Light', icon: 'Sun' },
  { value: 'system', label: 'System', icon: 'Monitor' },
];

/**
 * The server snapshot is System because that is the default. It drives the menu
 * only: the menu is invisible until opened, so by the time anyone sees it the
 * store has hydrated. The trigger deliberately does not use this -- see below.
 */
function useThemePreference() {
  const preference = useSyncExternalStore(
    subscribeToThemePreference,
    getThemePreference,
    () => 'system' as const
  );
  return [preference, setThemePreference] as const;
}

export default function ThemeToggle() {
  const [preference, setPreference] = useThemePreference();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/*
         * All three states are rendered and CSS shows the one matching
         * `data-eq-theme-pref` on the root, which the blocking script sets
         * before first paint. Driving the trigger from React instead would
         * render System on the server and swap to the reader's real choice on
         * hydration, which reads as the wrong word on screen for a moment.
         *
         * "Theme:" is always present and visually hidden, so the accessible
         * name is "Theme: Dark" rather than a bare "Dark". Hidden options are
         * `display: none`, so they are excluded from the name and from the
         * accessibility tree.
         */}
        <Button variant="tertiary" className={styles.trigger}>
          <span className={styles.srOnly}>Theme:</span>
          {OPTIONS.map((option) => (
            <span key={option.value} className={styles.state} data-eq-pref={option.value}>
              <span aria-hidden="true" className={styles.icon}>
                <Icon icon={option.icon} size="xs" />
              </span>
              <span className={styles.label}>{option.label}</span>
            </span>
          ))}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value: string) => setPreference(value as ThemePreference)}
        >
          {OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <span aria-hidden="true" className={styles.icon}>
                <Icon icon={option.icon} size="xs" />
              </span>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
