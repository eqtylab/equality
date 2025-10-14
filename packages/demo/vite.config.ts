import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const uiSrc = fileURLToPath(new URL('../ui/src', import.meta.url));
const uiStyles = fileURLToPath(new URL('../ui/styles', import.meta.url));
const demoRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      // keep CSS import working
      { find: '@eqtylab/equality/styles', replacement: uiStyles },
      // point main entry to source for HMR
      { find: '@eqtylab/equality', replacement: uiSrc },
    ],
  },
  optimizeDeps: {
    exclude: ['@eqtylab/equality'],
  },
  server: {
    fs: { allow: [demoRoot, uiSrc, uiStyles] },
  },
});

// - Keep your existing imports in the demo:
// - Components: `import { Button, Card } from '@eqtylab/equality'`
// - CSS: `import '@eqtylab/equality/styles/style.css'`
// - Result: Edits in `packages/ui/src/*` hot-reload the demo.

// Note: if you change the UI’s Tailwind/CSS files, you’ll also need a CSS watcher (e.g., add a `watch:css` script that runs PostCSS with `-w`) or rebuild CSS.

// - Edits proposed: add a Vite alias in `packages/demo/vite.config.ts` or run the UI `watch` script in parallel.
