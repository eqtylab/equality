import {
  applyThemeToDom,
  getCurrentThemeState,
  getDefaultTheme,
  getFallbackTheme,
  getThemeFromLocalStorage,
  getThemeFromWindow,
  initializeTheme,
  InitializeThemeOptions,
  setTheme,
  setThemeInLocalStorage,
  setThemeOnWindow,
  STORAGE_KEY,
  UPDATE_EVENT,
} from '@/theme/lib/utils';

const helpers = {
  applyThemeToDom,
  getCurrentThemeState,
  getDefaultTheme,
  getFallbackTheme,
  getThemeFromLocalStorage,
  getThemeFromWindow,
  initializeTheme,
  setTheme,
  setThemeInLocalStorage,
  setThemeOnWindow,
};

const serializeHelpers = () =>
  Object.entries(helpers)
    .map(([name, fn]) => {
      return `const ${name} = ${fn.toString()};`;
    })
    .join('\n');

const buildInlineThemeInitializer = (options: InitializeThemeOptions = {}) => {
  const { shouldStoreTheme = false } = options;

  return `
    (() => {
      const STORAGE_KEY = ${JSON.stringify(STORAGE_KEY)};
      const UPDATE_EVENT = ${JSON.stringify(UPDATE_EVENT)};
      ${serializeHelpers()}
      initializeTheme({ shouldStoreTheme: ${JSON.stringify(shouldStoreTheme)} });
    })();
  `;
};

const inlineInitializeTheme = (options: InitializeThemeOptions = {}) => {
  return buildInlineThemeInitializer(options);
};

export { inlineInitializeTheme as initializeTheme };
