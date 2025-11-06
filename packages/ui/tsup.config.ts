import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom', 'motion/react', '@radix-ui/react-slot'],
  // Include CSS files in the bundle
  loader: {
    '.css': 'copy',
  },
});
