// Copies src/runtime -> dist/runtime verbatim.
//
// Verbatim matters: it keeps every relative import inside the runtime tree valid
// unchanged, which is what makes dev source-linking byte-equivalent to the
// published package. These files are compiled by the CONSUMER's Astro/Vite, so
// they must never pass through tsup.
import { watch } from 'node:fs';
import { cp, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const from = resolve(root, 'src/runtime');
const to = resolve(root, 'dist/runtime');

const skip = /(\.test\.|\.spec\.|__fixtures__)/;

async function sync() {
  await rm(to, { recursive: true, force: true });
  await cp(from, to, { recursive: true, filter: (src) => !skip.test(src) });
}

await sync();
console.log(`[docs] runtime -> ${to.replace(root + '/', '')}`);

if (process.argv.includes('--watch')) {
  let queued = null;
  watch(from, { recursive: true }, () => {
    clearTimeout(queued);
    queued = setTimeout(() => {
      sync().then(
        () => console.log('[docs] runtime re-synced'),
        (err) => console.error('[docs] runtime sync failed', err)
      );
    }, 50);
  });
  console.log('[docs] watching runtime for changes');
}
