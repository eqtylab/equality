/**
 * Prettier config using absolute plugin resolution to avoid editor plugin resolution issues in monorepos.
 */
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: [
    require.resolve('@ianvs/prettier-plugin-sort-imports'),
    require.resolve('prettier-plugin-tailwindcss'),
    require.resolve('prettier-plugin-astro'),
  ],
  importOrder: ['^react', '<THIRD_PARTY_MODULES>', '', '^@/(.*)$', '', '^[./]'],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  tailwindFunctions: ['cn', 'cva'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
