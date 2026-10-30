import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// The draft sidebar renders the unreleased Equality parts from source. Vitest owns only the TSX
// tests: node --test runs the .ts ones and cannot load TSX
export default defineConfig({
  resolve: {
    alias: {
      '@eqtylab/equality': fileURLToPath(new URL('../ui/src/index.ts', import.meta.url)),
      '@': fileURLToPath(new URL('../ui/src', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    include: ['tests/**/*.test.tsx'],
  },
});
