/**
 * Generates the scoped options and decisions from the global ones.
 *
 * `theme-options.css` and `theme-decisions.css` are the single authored copies.
 * The scoped build differs only in where the variables land, `.root` instead of
 * `html`, so deriving it here keeps them off the host page without a second copy
 * to drift.
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FILES = [
  { name: 'options', file: 'theme-options.css' },
  { name: 'decisions', file: 'theme-decisions.css' },
];

const banner = (name, file) => `/* =========================================================
   SCOPED ${name.toUpperCase()} — GENERATED FILE, DO NOT EDIT

   Generated from \`${file}\` by
   \`src/scripts/build-decisions.js\`. Edit that file instead, then run
   \`pnpm build:decisions\`.
   ========================================================= */`;

export function scopeDecisions(source, name = 'decisions', file = 'theme-decisions.css') {
  const start = source.search(/^html \{/m);
  if (start === -1) {
    throw new Error(`Expected an "html {" rule in ${file}. Did the global root selector change?`);
  }
  const body = source
    .slice(start)
    .replace(/^(\s*)html\[data-equality-theme='dark'\]/gm, "$1[data-equality-theme='dark'] .root")
    .replace(/^(\s*)html(?= \{)/gm, '$1.root');
  return `${banner(name, file)}\n\n${body}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const { name, file } of FILES) {
    const source = resolve(__dirname, '../theme', file);
    const output = source.replace(/\.css$/, '-scoped.css');
    writeFileSync(output, scopeDecisions(readFileSync(source, 'utf8'), name, file));
    console.log(`Generated ${output} from ${source}`);
  }
}
