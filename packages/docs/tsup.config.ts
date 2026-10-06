import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  // Node-side only. Everything under src/runtime ships as source (see scripts/copy-runtime.mjs).
  entry: [
    'src/index.ts',
    'src/config.ts',
    'src/env.ts',
    'src/schema.ts',
    'src/loaders.ts',
    'src/nav.ts',
    'src/paths.ts',
    'src/types.ts',
    'src/dev.ts',
    'src/internal/rehype-base-url.ts',
  ],
  format: ['esm'], // Astro 6 is ESM-only
  dts: false, // tsconfig.build.json emits declarations instead
  sourcemap: true,
  // Watch mode must never clean: it wipes dist/ on every rebuild, and a consumer's
  // Vite that resolves @eqtylab/docs inside that window dies with an
  // unresolvable-entry error. Do not pass --no-clean instead -- that flag silently
  // disables tsup 8.5's file watcher entirely.
  clean: !options.watch, // must run before copy-runtime
  splitting: true,
  treeshake: true,
  external: [
    'astro',
    'astro/zod',
    'astro/loaders',
    'astro:content',
    'virtual:eqty-docs/config',
    '@eqtylab/equality',
    'react',
    'react-dom',
    'yaml',
    '@scalar/openapi-parser',
    '@scalar/snippetz',
  ],
}));
