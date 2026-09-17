// Mirrors src/runtime -> dist/runtime verbatim. These files are compiled by the
// consumer's Vite and must never pass through tsup.
import { watch } from 'node:fs';
import { cp, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const from = resolve(root, 'src/runtime');
const to = resolve(root, 'dist/runtime');
const skip = /(\.test\.|\.spec\.|__fixtures__)/;

export async function sync() {
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true, filter: (src) => !skip.test(src) });
}

/** Re-sync on change, debounced. Returns the watcher. */
export function watchRuntime(onSync = () => {}) {
  let queued;
  return watch(from, { recursive: true }, (_event, filename) => {
    clearTimeout(queued);
    queued = setTimeout(() => {
      sync().then(
        () => onSync(filename),
        (err) => console.error('[docs] runtime sync failed', err)
      );
    }, 60);
  });
}
