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

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: string }> = [
  { value: 'dark', label: 'Dark', icon: 'Moon' },
  { value: 'light', label: 'Light', icon: 'Sun' },
  { value: 'system', label: 'System', icon: 'Monitor' },
];

/** Drives the menu only; the trigger is CSS-driven so it never flashes the server snapshot. */
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
         * All three states render; CSS shows the one matching `data-eq-theme-pref`,
         * set before first paint. Rendering it from React would flash System until hydration.
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
