import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', 'motion/react', '@radix-ui/react-slot'],
  loader: {
    '.css': 'copy', // Include CSS files in the bundle
  },
  esbuildOptions(options) {
    options.assetNames = '[name]'; // Do not hash/version asset filenames
  },
});
