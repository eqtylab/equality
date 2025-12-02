const STORAGE_KEY = 'equality-theme';
const UPDATE_EVENT = 'equality-theme-change';
const FALLBACK_THEME = 'light';
type Theme = 'light' | 'dark';

interface InitializeThemeOptions {
  shouldStoreTheme?: boolean;
}

const getFallbackTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return FALLBACK_THEME;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getDefaultTheme = (): Theme | undefined => {
  const themeProviderElement = document.querySelector('[data-equality-theme]');
  if (themeProviderElement) {
    return themeProviderElement.getAttribute('data-equality-theme') as Theme;
  } else {
    return undefined;
  }
};

const getThemeFromLocalStorage = (): Theme | null => {
  const safeReadStorage = (key: string) => {
    try {
      return window.localStorage.getItem(key) as Theme | null;
    } catch {
      return null;
    }
  };

  const themeLocalStorageValue = safeReadStorage(STORAGE_KEY);
  return themeLocalStorageValue;
};

const getThemeFromWindow = (): Theme | undefined => {
  return window.__equalityTheme as Theme | undefined;
};

const applyThemeToDom = (theme: Theme) => {
  const themeProviderRootElement =
    document.querySelector('[data-equality-theme]') || document.documentElement;
  if (themeProviderRootElement) {
    themeProviderRootElement.setAttribute('data-equality-theme', theme); // This sets the theme that controls the styling color variables used
  }
};

const setThemeInLocalStorage = (theme: Theme) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: theme }));
  } catch {
    console.error('Failed to set theme in localStorage');
  }
};

const setThemeOnWindow = (theme: Theme) => {
  window.__equalityTheme = theme;
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: theme }));
};

const setTheme = (theme: Theme) => {
  const isUsingLocalStorage = window.__equalityIsUsingLocalStorage;
  if (isUsingLocalStorage) {
    setThemeInLocalStorage(theme);
  } else {
    setThemeOnWindow(theme);
  }
  applyThemeToDom(theme);
};

const getCurrentThemeState = () => {
  // First, use stored theme if available
  // Then, use default theme set on data-equality-theme attribute if available
  // Then, use fallback theme from browser settings if available

  if (typeof window === 'undefined') {
    return undefined;
  }

  const isUsingLocalStorage = window.__equalityIsUsingLocalStorage;
  const storedTheme = isUsingLocalStorage ? getThemeFromLocalStorage() : getThemeFromWindow();
  const theme = storedTheme || getDefaultTheme() || getFallbackTheme();
  if (!storedTheme) {
    setTheme(theme);
  }
  return theme;
};

const initializeTheme = (options: InitializeThemeOptions = {}) => {
  // This is only needed if the initial state needs to be dynamic
  const { shouldStoreTheme = false } = options;

  window.__equalityIsUsingLocalStorage = shouldStoreTheme;
  const theme = getCurrentThemeState();
  if (theme) applyThemeToDom(theme);
};

const subscribeToThemeChange = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const isUsingLocalStorage = window.__equalityIsUsingLocalStorage;
  if (isUsingLocalStorage) {
    // use localStorage
    const storageListener = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener();
    };
    const updateListener = () => listener();

    window.addEventListener('storage', storageListener);
    window.addEventListener(UPDATE_EVENT, updateListener);
    return () => {
      window.removeEventListener('storage', storageListener);
      window.removeEventListener(UPDATE_EVENT, updateListener);
    };
  } else {
    // use window object
    const windowListener = () => {
      listener();
    };
    window.addEventListener(UPDATE_EVENT, windowListener);
    return () => {
      window.removeEventListener(UPDATE_EVENT, windowListener);
    };
  }
};

export {
  Theme,
  InitializeThemeOptions,
  STORAGE_KEY,
  UPDATE_EVENT,
  FALLBACK_THEME,
  getCurrentThemeState,
  applyThemeToDom,
  initializeTheme,
  setTheme,
  subscribeToThemeChange,
  getFallbackTheme,
  getDefaultTheme,
  getThemeFromLocalStorage,
  getThemeFromWindow,
  setThemeInLocalStorage,
  setThemeOnWindow,
};
