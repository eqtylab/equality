import {
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
  STORAGE_KEY,
  UPDATE_EVENT,
} from './utils';

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

const buildInlineThemeInitializer = (options = {}) => {
  const { store = false } = options;

  return `
    (() => {
      const STORAGE_KEY = ${JSON.stringify(STORAGE_KEY)};
      const UPDATE_EVENT = ${JSON.stringify(UPDATE_EVENT)};
      ${serializeHelpers()}
      initializeTheme(${JSON.stringify(store)});
    })();
  `;
};

const inlineInitializeTheme = (options = {}) => {
  return buildInlineThemeInitializer(options);
};

export { inlineInitializeTheme as initializeTheme };
