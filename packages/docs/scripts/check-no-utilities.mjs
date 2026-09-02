// Guards the package's core styling constraint.
//
// Tailwind utility classes written literally in markup only survive if the
// CONSUMER's Tailwind scans the file that contains them -- and Tailwind v4
// source detection skips node_modules. Styling via `@apply` inside a
// co-located *.module.css has no such dependency (proven by packages/ui).
//
// So: utilities in our shipped markup would silently do nothing in a consumer's
// build. That is the kind of failure review does not catch, hence this check.
import { readFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'tinyglobby';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Shapes that are unambiguously Tailwind rather than a semantic class name.
const UTILITY = new RegExp(
  [
    String.raw`^-?(?:m|p)(?:[xytrbl]|[se])?-`, // spacing
    String.raw`^(?:w|h|min-w|min-h|max-w|max-h|size)-`,
    String.raw`^(?:flex|grid|inline|block|hidden|contents|table)$`,
    String.raw`^(?:flex|grid|col|row|gap|order|basis|grow|shrink)-`,
    String.raw`^(?:items|justify|content|self|place)-`,
    String.raw`^(?:text|bg|border|ring|outline|shadow|from|via|to|fill|stroke|divide|accent|caret|decoration)-`,
    String.raw`^(?:rounded|font|leading|tracking|opacity|z|top|right|bottom|left|inset|translate|rotate|scale|skew)-`,
    String.raw`^(?:absolute|relative|fixed|sticky|static)$`,
    String.raw`^(?:overflow|whitespace|break|truncate|cursor|select|pointer-events|transition|duration|ease|animate)-`,
    String.raw`^(?:sr-only|not-sr-only|antialiased|italic|underline|uppercase|lowercase|capitalize)$`,
  ].join('|')
);

// Strip Tailwind variant prefixes (hover:, md:, dark:, group-hover:, [&>li]:)
const bare = (token) => token.replace(/!$/, '').split(':').pop() ?? '';

const files = await glob(['src/runtime/**/*.{astro,tsx}'], { cwd: root, absolute: true });
const offences = [];

for (const file of files) {
  const text = await readFile(file, 'utf8');
  // class="..." / className="..." with a literal string value
  for (const m of text.matchAll(/\bclass(?:Name)?\s*=\s*"([^"]*)"/g)) {
    const line = text.slice(0, m.index).split('\n').length;
    for (const token of m[1].split(/\s+/).filter(Boolean)) {
      if (UTILITY.test(bare(token))) {
        offences.push({ file: relative(root, file), line, token });
      }
    }
  }
}

if (offences.length) {
  console.error(
    '\nTailwind utility classes found in shipped markup. These will not be generated in a\n' +
      "consumer's build, because Tailwind v4 does not scan node_modules. Move them into a\n" +
      'co-located *.module.css using `@apply` (see any component in packages/ui).\n'
  );
  for (const o of offences) console.error(`  ${o.file}:${o.line}  ${o.token}`);
  console.error('');
  process.exit(1);
}

console.log(`[docs] no utility classes in shipped markup (${files.length} files checked)`);
