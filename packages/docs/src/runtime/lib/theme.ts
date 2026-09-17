/**
 * Theme preference. The blocking bootstrap in DocsShell.astro duplicates the
 * constants below because it runs before any module loads; keep them in step.
 */
import CONFIG from 'virtual:eqty-docs/config';

export const STORAGE_KEY = 'eqty-docs-theme';
export const UPDATE_EVENT = 'eqty-docs-theme-change';
/** Equality's palette keys on this. */
export const THEME_ATTRIBUTE = 'data-equality-theme';
/** Lets CSS drive the theme control before hydration; see ThemeToggle.module.css. */
export const PREFERENCE_ATTRIBUTE = 'data-eq-theme-pref';

export type ThemePreference = 'light' | 'dark' | 'system';

export type ResolvedTheme = 'light' | 'dark';

const PREFERENCES: readonly ThemePreference[] = ['dark', 'light', 'system'];

function isPreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (PREFERENCES as readonly string[]).includes(value);
}

function readStored(): string | null {
  if (!CONFIG.theme.persist) return window.__eqtyDocsTheme ?? null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(preference: ThemePreference): void {
  if (!CONFIG.theme.persist) {
    window.__eqtyDocsTheme = preference;
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Storage denied; the attribute still applies for this page.
  }
}

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = readStored();
  return isPreference(stored) ? stored : 'system';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

export function applyTheme(preference: ThemePreference): void {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;
  root.setAttribute(THEME_ATTRIBUTE, resolved);
  root.setAttribute(PREFERENCE_ATTRIBUTE, preference);
  // Native UI keys off `color-scheme`, not the attribute; must match the DocsShell.astro bootstrap.
  root.style.colorScheme = resolved;
}

export function setThemePreference(preference: ThemePreference): void {
  writeStored(preference);
  applyTheme(preference);
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: preference }));
}

export function subscribeToThemePreference(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };

  window.addEventListener(UPDATE_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(UPDATE_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
}
