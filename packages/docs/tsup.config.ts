import { defineConfig } from 'tsup';

export default defineConfig({
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
  clean: true, // must run before copy-runtime
  splitting: true,
  treeshake: true,
  external: [
    'astro',
    'astro/zod',
    'astro/loaders',
    'astro/config',
    'astro:content',
    '@eqtylab/equality',
    'react',
    'react-dom',
  ],
});
