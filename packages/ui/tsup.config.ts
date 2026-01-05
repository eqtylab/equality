import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/scripts.ts',
    'src/theme/lib/utils.ts', // This is to avoid shared files (shared in both index.ts and scripts.ts) being output with hashed filenames
  ],
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
