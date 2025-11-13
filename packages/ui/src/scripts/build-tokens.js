import * as prettier from 'prettier';
import StyleDictionary from 'style-dictionary';

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

sd.registerFormat({
  name: 'css/tailwind-dark',
  format: async ({ dictionary }) => {
    const tokens = formatCssGroup(dictionary.tokens.Dark);

    return await prettier.format(
      `@theme inline {
      ${tokens}
    }`,
      { parser: 'css' }
    );
  },
});

sd.registerFormat({
  name: 'css/tailwind-light',
  format: async ({ dictionary }) => {
    const tokens = formatCssGroup(dictionary.tokens.Light);

    return await prettier.format(
      `@theme inline {
      ${tokens}
    }`,
      { parser: 'css' }
    );
  },
});

await sd.buildAllPlatforms();
