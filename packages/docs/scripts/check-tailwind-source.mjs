// Tailwind does not scan node_modules, so this package's own markup is only compiled
// because `docs.css` names it in an explicit `@source`. A file outside that glob keeps
// its utilities in the markup and loses them in the CSS, with no error anywhere, so the
// build checks the glob still covers everything before it ships.
import { readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'tinyglobby';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = resolve(root, 'src/runtime/styles/docs.css');

const css = await readFile(entry, 'utf8');
const patterns = [...css.matchAll(/@source\s+(['"])([^'"]+)\1/g)].map((m) => m[2]);

if (patterns.length === 0) {
  console.error(
    '\nNo `@source` in src/runtime/styles/docs.css.\n' +
      'Without it every inline utility in this package compiles to nothing in a\n' +
      'consumer build, because Tailwind skips node_modules.\n'
  );
  process.exit(1);
}

const stylesDir = dirname(entry);
const covered = new Set();
for (const pattern of patterns) {
  for (const file of await glob([pattern], { cwd: stylesDir, absolute: true })) {
    covered.add(resolve(file));
  }
}

const markup = await glob(['src/runtime/**/*.{astro,tsx,ts}'], { cwd: root, absolute: true });
const missed = markup.filter((file) => !covered.has(resolve(file)));

if (missed.length > 0) {
  console.error(
    '\nShipped markup is outside the `@source` glob in src/runtime/styles/docs.css.\n' +
      'Utilities written in these files would silently compile to nothing:\n'
  );
  for (const file of missed) console.error(`  ${relative(root, file)}`);
  console.error('');
  process.exit(1);
}

console.log(
  `[docs] @source covers all shipped markup (${markup.length} files, ${patterns.length} pattern(s))`
);
