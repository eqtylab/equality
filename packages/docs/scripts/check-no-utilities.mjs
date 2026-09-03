// Guards the package's core styling constraint.
//
// Tailwind utility classes written literally in this package's markup only work
// if the CONSUMER's Tailwind scans the file containing them -- and Tailwind v4
// source detection skips node_modules. Styling via `@apply` in a co-located
// *.module.css has no such dependency (proven by packages/ui). So a utility
// class here would silently produce nothing in a consumer's build, which is the
// kind of failure review does not catch.
//
// Rather than try to recognise Tailwind class names -- a losing game against
// arbitrary values, variants and new syntax -- this inverts the rule: every
// class in shipped markup must come from a CSS module. Literal class strings
// are rejected outright, with a short allowlist for the genuine exceptions.
import { readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'tinyglobby';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Semantic hooks that are deliberately global, not CSS-module scoped. */
const ALLOWED = new Set(['eq-prose']);

/**
 * Only the markup is relevant. In .astro that is everything after the
 * frontmatter fence -- scanning the frontmatter too would flag comments and
 * regex literals that merely contain the word `class`.
 */
function markupOf(file, text) {
  if (!file.endsWith('.astro')) {
    // .tsx mixes JSX with code, so drop comments instead.
    return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  }
  if (!text.startsWith('---')) return text;
  const end = text.indexOf('\n---', 3);
  return end === -1 ? text : text.slice(end + 4);
}

const files = await glob(['src/runtime/**/*.{astro,tsx}'], { cwd: root, absolute: true });
const offences = [];

for (const file of files) {
  const full = await readFile(file, 'utf8');
  const offset = full.length - markupOf(file, full).length;
  const text = markupOf(file, full);
  for (const match of text.matchAll(/\bclass(?:Name)?\s*=\s*"([^"]*)"/g)) {
    const classes = match[1].split(/\s+/).filter(Boolean);
    const bad = classes.filter((c) => !ALLOWED.has(c));
    if (bad.length === 0) continue;
    offences.push({
      file: relative(root, file),
      line: full.slice(0, offset + match.index).split('\n').length,
      classes: bad.join(' '),
    });
  }
}

if (offences.length > 0) {
  console.error(
    '\nLiteral class names found in shipped markup. Classes must come from a\n' +
      'co-located *.module.css (styles.foo), because Tailwind does not scan\n' +
      'node_modules and a utility written here would do nothing in a consumer build.\n'
  );
  for (const o of offences) console.error(`  ${o.file}:${o.line}  class="${o.classes}"`);
  console.error('');
  process.exit(1);
}

console.log(`[docs] all classes come from CSS modules (${files.length} files checked)`);
