import { useSyncExternalStore } from 'react';
import { Icon } from '@eqtylab/equality';

import {
  getThemePreference,
  setThemePreference,
  subscribeToThemePreference,
  type ThemePreference,
} from '../lib/theme.ts';
import styles from './ThemeToggle.module.css';

/**
 * One button that cycles System, Light, Dark.
 *
 * Do not reduce this to the current state, or to an `aria-label`. All three render and
 * CSS picks one, which is what keeps the button correct before React hydrates.
 */
/** System first, so it is never more than one press away. */
const CYCLE: ThemePreference[] = ['system', 'light', 'dark'];
const LABEL: Record<ThemePreference, string> = { system: 'System', light: 'Light', dark: 'Dark' };
const ICON: Record<ThemePreference, string> = { system: 'Monitor', light: 'Sun', dark: 'Moon' };

const after = (preference: ThemePreference) =>
  CYCLE[(CYCLE.indexOf(preference) + 1) % CYCLE.length];

function usePreference() {
  return useSyncExternalStore(
    subscribeToThemePreference,
    getThemePreference,
    () => 'system' as const
  );
}

interface Props {
  /** The bar's control recipe, passed by Header so this cannot drift from the links. */
  className?: string;
}

export default function ThemeToggle({ className }: Props) {
  const preference = usePreference();

  return (
    <button
      type="button"
      className={[className, styles.trigger].filter(Boolean).join(' ')}
      onClick={() => setThemePreference(after(preference))}
    >
      {CYCLE.map((value) => (
        <span key={value} className={styles.state} data-eq-pref={value}>
          <span aria-hidden="true" className={styles.icon}>
            <Icon icon={ICON[value]} size="xs" />
          </span>
          <span aria-hidden="true" className={styles.label}>
            {LABEL[value]}
          </span>
          <span className={styles.srOnly}>
            Theme: {LABEL[value]}. Activate to switch to {LABEL[after(value)]}.
          </span>
        </span>
      ))}
    </button>
  );
}
