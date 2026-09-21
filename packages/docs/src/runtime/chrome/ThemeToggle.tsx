import { useSyncExternalStore } from 'react';
import { Icon } from '@eqtylab/equality';

import {
  getThemePreference,
  setThemePreference,
  subscribeToThemePreference,
  type ThemePreference,
} from '../lib/theme.ts';

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

/**
 * Which state is showing. The root attribute picks one; with no JS it is absent, so
 * System shows. These outrank the `invisible` default on their own, because an
 * ancestor-qualified selector is the more specific of the two.
 */
const VISIBLE: Record<ThemePreference, string> = {
  system: '[html:not([data-eq-theme-pref])_&]:visible [html[data-eq-theme-pref=system]_&]:visible',
  light: '[html[data-eq-theme-pref=light]_&]:visible',
  dark: '[html[data-eq-theme-pref=dark]_&]:visible',
};

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
    /*
     * All three states share one grid cell, so the button is always as wide as the
     * widest and the bar never shifts. `visibility`, not `display`: a hidden state
     * must still be sized. No room for a label below lg, and hiding it outright is
     * safe because the sentence beside it is the accessible name.
     */
    <button
      type="button"
      className={[className, 'grid cursor-pointer max-lg:w-10 max-lg:justify-center max-lg:px-0']
        .filter(Boolean)
        .join(' ')}
      onClick={() => setThemePreference(after(preference))}
    >
      {CYCLE.map((value) => (
        <span
          key={value}
          className={`invisible col-start-1 row-start-1 flex items-center gap-2 ${VISIBLE[value]}`}
          data-eq-pref={value}
        >
          <span aria-hidden="true" className="inline-flex">
            <Icon icon={ICON[value]} size="xs" />
          </span>
          <span aria-hidden="true" className="text-sm max-lg:hidden">
            {LABEL[value]}
          </span>
          <span className="sr-only">
            Theme: {LABEL[value]}. Activate to switch to {LABEL[after(value)]}.
          </span>
        </span>
      ))}
    </button>
  );
}
