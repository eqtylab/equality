import { Icon, Switch, useTheme } from '@eqtylab/equality';

import styles from './ThemeToggle.module.css';

/**
 * `useTheme`'s server snapshot is undefined, so render nothing until the theme
 * resolves -- otherwise the toggle flashes the wrong state on first paint.
 *
 * Icons come from Equality's `Icon` rather than a direct lucide-react import:
 * this package declares no lucide dependency, so there is exactly one copy in
 * the tree (packages/ui and packages/demo currently disagree on the version).
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  if (!theme) return null;

  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <label className={styles.toggle} title={label}>
      <span aria-hidden="true" className={styles.icon}>
        <Icon icon={isDark ? 'Moon' : 'Sun'} size="xs" />
      </span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked: boolean) => setTheme(checked ? 'dark' : 'light')}
        aria-label={label}
      />
    </label>
  );
}
