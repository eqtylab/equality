/**
 * Generates the global preflight from the scoped one.
 *
 * `theme-preflight-scoped.css` is the single authored copy of the reset. The
 * only difference in the global build is the root selector, so deriving it here
 * keeps the two from drifting.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SOURCE = resolve(__dirname, '../theme/theme-preflight-scoped.css');
const OUTPUT = resolve(__dirname, '../theme/theme-preflight-global.css');

const SCOPED_ROOT = '[data-equality-root]';
const GLOBAL_ROOT = 'html';

const BANNER = `/* =========================================================
   GLOBAL PREFLIGHT — GENERATED FILE, DO NOT EDIT

   Generated from \`theme-preflight-scoped.css\` by
   \`src/scripts/build-preflight.js\`. Edit that file instead, then run
   \`pnpm build:preflight\`.

   Deliberately carries no \`@layer\` wrapper: the importer assigns the layer,
   so a consumer can place the reset wherever their cascade needs it.

     @import '@eqtylab/equality/preflight.css' layer(base);
   ========================================================= */`;

const source = readFileSync(SOURCE, 'utf8');

// Drop the source's own header comment; the generated file gets its own.
const body = source.replace(/^\/\*[\s\S]*?\*\/\n/, '');

if (!body.includes(SCOPED_ROOT)) {
  throw new Error(
    `Expected to find "${SCOPED_ROOT}" in ${SOURCE}. Did the scoped root selector change?`
  );
}

const output = `${BANNER}\n\n${body.split(SCOPED_ROOT).join(GLOBAL_ROOT)}`;

writeFileSync(OUTPUT, output);

console.log(`Generated ${OUTPUT} from ${SOURCE}`);
