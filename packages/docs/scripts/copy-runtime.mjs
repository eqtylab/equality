// Build step: mirror src/runtime into dist/runtime. `--watch` keeps it in sync.
import { sync, watchRuntime } from './runtime-sync.mjs';

await sync();
console.log('[docs] runtime synced');

if (process.argv.includes('--watch')) {
  watchRuntime((file) => console.log(`[docs] runtime re-synced (${file ?? 'change'})`));
  console.log('[docs] watching runtime for changes');
}
