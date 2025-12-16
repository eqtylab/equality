import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/scripts.ts', 'src/shared.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ['react', 'react-dom', 'motion/react', '@radix-ui/react-slot'],
  // Include CSS files in the bundle
  loader: {
    '.css': 'copy',
  },
  esbuildOptions(options) {
    options.assetNames = '[name].[ext]';
  },
});
