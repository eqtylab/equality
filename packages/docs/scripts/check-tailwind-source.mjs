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

/*
 * Equality declares --font-sans and --font-mono in `@theme inline`, so Tailwind emits them
 * only where a utility references them, while Equality's preflight reaches them through
 * `var()`. Drop these utilities and the preflight resolves to nothing: every page renders
 * in the browser's default serif, and code loses its monospace, with no error anywhere.
 */
const fontAnchors = [
  { file: 'src/runtime/layouts/DocsShell.astro', utility: 'font-sans', what: 'body text' },
  { file: 'src/runtime/components/CodeFence.astro', utility: 'font-mono', what: 'fenced code' },
  { file: 'src/runtime/styles/prose.css', utility: 'font-mono', what: 'inline code' },
];

// Comments are stripped first: the hazard notes beside these utilities name them, and a
// guard that its own explanation satisfies would never fire.
const withoutComments = (source) =>
  source
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ');

const unanchored = [];
for (const anchor of fontAnchors) {
  const source = withoutComments(await readFile(resolve(root, anchor.file), 'utf8'));
  if (!new RegExp(`\\b${anchor.utility}\\b`).test(source)) unanchored.push(anchor);
}

if (unanchored.length > 0) {
  console.error(
    '\nA font utility this package relies on is gone.\n' +
      "Equality's preflight reaches --font-sans / --font-mono through `var()`, but both are\n" +
      'declared `@theme inline`, so Tailwind only emits them where a utility names them.\n' +
      'Without these the type silently falls back to the browser default:\n'
  );
  for (const a of unanchored)
    console.error(`  ${a.file} no longer uses \`${a.utility}\` (${a.what})`);
  console.error('');
  process.exit(1);
}

console.log(
  `[docs] @source covers all shipped markup (${markup.length} files, ${patterns.length} pattern(s)); ` +
    `${fontAnchors.length} font anchors present`
);
