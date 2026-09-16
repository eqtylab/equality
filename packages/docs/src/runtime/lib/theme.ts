/**
 * Theme preference, owned by this package.
 *
 * Equality types its theme as 'light' | 'dark' and has no concept of following
 * the operating system, so the three-state preference lives here instead. The
 * seam is Equality's documented public one: the dark palette activates on
 * `html[data-equality-theme="dark"]`, so writing that attribute is the whole
 * integration. No Equality component reads the theme in JavaScript.
 *
 * The pre-paint half of this lives in a blocking inline script in
 * DocsShell.astro, which must agree with `STORAGE_KEY` and `UPDATE_EVENT`
 * below. That duplication is deliberate: the script has to run before the first
 * paint and before any module loads, so it cannot import from here.
 */
import CONFIG from 'virtual:eqty-docs/config';

export const STORAGE_KEY = 'eqty-docs-theme';
export const UPDATE_EVENT = 'eqty-docs-theme-change';
/** Resolved light or dark. What Equality's palette keys on. */
export const THEME_ATTRIBUTE = 'data-equality-theme';
/**
 * The chosen preference, published to the root so the control can be driven by
 * CSS. Without it the trigger renders from React's server snapshot -- always
 * System -- and swaps to the real choice on hydration, which a reader who picked
 * Dark sees as the wrong word on screen for a moment.
 */
export const PREFERENCE_ATTRIBUTE = 'data-eq-theme-pref';

/** What the reader chose. Absent storage means System, which is the default. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** What the page is actually painted as. What Equality's CSS keys on. */
export type ResolvedTheme = 'light' | 'dark';

const PREFERENCES: readonly ThemePreference[] = ['dark', 'light', 'system'];

function isPreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (PREFERENCES as readonly string[]).includes(value);
}

/**
 * `theme.persist: false` keeps the choice for the life of the page and no
 * longer, which is the same switch Equality offers. The window fallback means
 * the dropdown still works; it just does not survive a reload.
 */
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
    // Storage denied (private mode, blocked cookies). The attribute is still
    // applied below, so the choice holds for this page and is simply forgotten
    // on the next one.
  }
}

export function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Nothing stored means System. That is the default and it is deliberate. */
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
  // Scrollbars, native form controls and the browser's own UI key off
  // `color-scheme`, not the attribute above. Must stay in step with the
  // bootstrap in DocsShell.astro.
  root.style.colorScheme = resolved;
}

/**
 * Store the choice, repaint, and tell every listener -- including the inline
 * script's own handler, which is what keeps the two halves in step.
 */
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
