import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const uiDist = fileURLToPath(new URL('../ui/dist', import.meta.url));
const uiStyles = fileURLToPath(new URL('../ui/styles', import.meta.url));
const demoRoot = fileURLToPath(new URL('.', import.meta.url));
const demoSrc = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      // keep CSS import working
      { find: '@eqtylab/equality/styles', replacement: uiStyles },
      // point main entry to built package
      { find: '@eqtylab/equality', replacement: uiDist },
      // add @ alias for demo src directory
      { find: '@', replacement: demoSrc },
    ],
  },
  optimizeDeps: {
    exclude: ['@eqtylab/equality'],
  },
  server: {
    fs: { allow: [demoRoot, uiDist, uiStyles, demoSrc] },
  },
});
