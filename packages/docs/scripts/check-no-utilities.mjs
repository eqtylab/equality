// Tailwind does not scan node_modules, so a utility class written literally in
// this package's markup produces nothing in a consumer build. Every class must
// come from a CSS module; literal class strings are rejected bar a short allowlist.
import { readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'tinyglobby';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Deliberately global hooks. */
const ALLOWED = new Set(['eq-prose']);

/** Markup only: frontmatter and comments may mention `class` legitimately. */
function markupOf(file, text) {
  if (!file.endsWith('.astro')) {
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
