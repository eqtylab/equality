/**
 * Generates the scoped decisions from the global ones.
 *
 * `theme-decisions.css` is the single authored copy. The scoped build differs
 * only in where the variables land, `.root` instead of `html`, so deriving it
 * here keeps them off the host page without a second copy to drift.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SOURCE = resolve(__dirname, '../theme/theme-decisions.css');
const OUTPUT = resolve(__dirname, '../theme/theme-decisions-scoped.css');

const BANNER = `/* =========================================================
   SCOPED DECISIONS — GENERATED FILE, DO NOT EDIT

   Generated from \`theme-decisions.css\` by
   \`src/scripts/build-decisions.js\`. Edit that file instead, then run
   \`pnpm build:decisions\`.
   ========================================================= */`;

export function scopeDecisions(source) {
  const start = source.search(/^html \{/m);
  if (start === -1) {
    throw new Error(`Expected an "html {" rule in ${SOURCE}. Did the global root selector change?`);
  }
  const body = source
    .slice(start)
    .replace(/^(\s*)html\[data-equality-theme='dark'\]/gm, "$1[data-equality-theme='dark'] .root")
    .replace(/^(\s*)html(?= \{)/gm, '$1.root');
  return `${BANNER}\n\n${body}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(OUTPUT, scopeDecisions(readFileSync(SOURCE, 'utf8')));
  console.log(`Generated ${OUTPUT} from ${SOURCE}`);
}
