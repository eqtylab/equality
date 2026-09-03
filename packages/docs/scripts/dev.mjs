// `pnpm dev`: serve the playground, keeping dist/runtime in sync so edits to
// .astro / .tsx / .module.css hot-reload.
//
// The sync is needed because the playground consumes the package by NAME: Astro
// resolves injected route entrypoints through the real exports map, which lands
// in dist/runtime, so that is what Vite serves. Re-copying triggers HMR.
import { spawn } from 'node:child_process';
import { relative, resolve } from 'node:path';

import { root, sync, watchRuntime } from './runtime-sync.mjs';

await sync();
watchRuntime((file) => console.log(`[docs] runtime re-synced (${file ?? 'change'})`));
console.log('[docs] runtime synced, watching for changes');

const playground = resolve(root, 'playground');
console.log(`[docs] starting playground in ${relative(root, playground)}`);

const child = spawn(resolve(root, 'node_modules/.bin/astro'), ['dev', '--port', '4322'], {
  cwd: playground,
  stdio: 'inherit',
  env: process.env,
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    child.kill(signal);
    process.exit(0);
  });
}
child.on('exit', (code) => process.exit(code ?? 0));
