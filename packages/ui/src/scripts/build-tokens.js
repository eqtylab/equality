import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as prettier from 'prettier';
import StyleDictionary from 'style-dictionary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load the workspace prettier config
const prettierConfigPath = resolve(__dirname, '../../../../prettier.config.cjs');
const prettierConfig = require(prettierConfigPath);

const sd = new StyleDictionary('sd.config.json');

function formatCssGroup(obj) {
  const tokens = [];

  function traverse(obj, path) {
    for (const [key, token] of Object.entries(obj)) {
      if (key === '$type' || key === '$value') continue;

      const currentPath = path ? [...path, key] : [key];

      if (token && typeof token === 'object') {
        const colorValue = token.$value;
        if (colorValue) {
          const name = currentPath.join('-').toLowerCase();
          const colorSpace = colorValue.colorSpace || 'display-p3';
          const [r, g, b] = colorValue.components;
          const hex = colorValue.hex;
          const color =
            colorSpace && colorValue.components?.length > 0
              ? `color(${colorSpace} ${r} ${g} ${b})`
              : hex;
          tokens.push(`--${name}: ${color};`);
        } else {
          traverse(token, currentPath);
        }
      }
    }
  }

  traverse(obj);

  return tokens.sort().join('\n') + '\n';
}

function formatTailwindGroup(obj) {
  const tokens = [];

  function traverse(obj, path) {
    for (const [key, token] of Object.entries(obj)) {
      if (key === '$type' || key === '$value') continue;

      const currentPath = path ? [...path, key] : [key];

      if (token && typeof token === 'object') {
        const colorValue = token.$value;
        if (colorValue) {
          const name = currentPath.join('-').toLowerCase();
          tokens.push(`--${name}: var(--${name});`);
        } else {
          traverse(token, currentPath);
        }
      }
    }
  }

  traverse(obj);

  return tokens.sort().join('\n') + '\n';
}

sd.registerFormat({
  name: 'css/dark',
  format: async ({ dictionary }) => {
    const tokens = formatCssGroup(dictionary.tokens.Dark);

    return await prettier.format(
      `:root[data-equality-theme='dark'] {
      ${tokens}
    }`,
      { ...prettierConfig, parser: 'css' }
    );
  },
});

sd.registerFormat({
  name: 'css/light',
  format: async ({ dictionary }) => {
    const tokens = formatCssGroup(dictionary.tokens.Light);

    return await prettier.format(
      `:root[data-equality-theme] {
    
      --hover-lighten: 20%;
      --hover-darken: 20%;

      ${tokens}
    }`,
      { ...prettierConfig, parser: 'css' }
    );
  },
});

sd.registerFormat({
  name: 'tailwind',
  format: async ({ dictionary }) => {
    const tokens = formatTailwindGroup(dictionary.tokens.Light);

    return await prettier.format(
      `@theme inline {

      --color-mixed-light: color-mix(in oklch, var(--mix-color), white var(--hover-lighten, 20%));
      --color-mixed-dark: color-mix(in oklch, var(--mix-color), black var(--hover-darken, 20%));

      ${tokens}
    }`,
      { ...prettierConfig, parser: 'css' }
    );
  },
});

await sd.buildAllPlatforms();
