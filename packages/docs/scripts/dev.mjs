// Dev watcher: tsup rebuilds the node-side entries while runtime-sync mirrors
// src/runtime. Both halves are non-destructive by design -- see tsup.config.ts
// and runtime-sync.mjs for why dist/ must survive a rebuild.
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

import { root, sync, watchRuntime } from './runtime-sync.mjs';

await sync({ clean: false });
console.log('[docs] runtime synced');

watchRuntime((file) => console.log(`[docs] runtime re-synced (${file ?? 'change'})`));
console.log('[docs] watching runtime for changes');

// Scoped to src: tsup's default "." walks node_modules under chokidar 4 and never
// settles. src/runtime is excluded because runtime-sync owns it.
const tsup = spawn(
  resolve(root, 'node_modules/.bin/tsup'),
  ['--watch', 'src', '--ignore-watch', 'src/runtime'],
  { stdio: 'inherit' }
);

tsup.on('exit', (code, signal) => process.exit(signal ? 0 : (code ?? 0)));

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    tsup.kill(signal);
    process.exit(0);
  });
}
