/**
 * Checks the syntax-language map against the grammars the highlighter actually ships.
 *
 * The map is hand-written because nothing upstream can generate it: the grammar modules carry no
 * file-type metadata, and the highlighter's own alias list covers markdown fence tags rather than
 * filenames. What can be automated is keeping the two honest about each other, which is what this
 * does — in both directions, so the map neither names a grammar that does not exist nor misses one
 * that has appeared.
 *
 * Runs as part of `build:lib`, so a drifting map fails the build and the release rather than
 * shipping code blocks that silently render plain.
 */
import { readdirSync, readFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(__dirname, '../lib/syntax-language.ts');

/** Grammars no filename could reasonably select, so the map is not expected to reach them. */
const NOT_FILE_SHAPED = [];

const mappedGrammars = () => {
  const source = readFileSync(SOURCE, 'utf8');
  const names = new Set();

  for (const block of ['GRAMMAR_BY_EXTENSION', 'GRAMMAR_BY_FILENAME']) {
    const match = source.match(new RegExp(`${block}[^=]*=\\s*\\{([\\s\\S]*?)\\n\\};`));
    if (!match) throw new Error(`${block} not found in ${SOURCE}`);
    for (const entry of match[1].matchAll(/:\s*'([^']+)'/g)) names.add(entry[1]);
  }

  return names;
};

const shippedGrammars = () => {
  const require = createRequire(import.meta.url);
  const grammarDirectory = resolve(dirname(require.resolve('microlighter')), 'grammars');
  return new Set(
    readdirSync(grammarDirectory)
      .filter((file) => file.endsWith('.js'))
      .map((file) => file.replace(/\.js$/, ''))
  );
};

const mapped = mappedGrammars();
const shipped = shippedGrammars();

const unknown = [...mapped].filter((name) => !shipped.has(name));
const unreachable = [...shipped].filter(
  (name) => !mapped.has(name) && !NOT_FILE_SHAPED.includes(name)
);

const problems = [];

if (unknown.length) {
  problems.push(
    `Maps onto ${unknown.length} grammar(s) the highlighter does not ship: ${unknown.join(', ')}.\n` +
      `  Either the name is wrong, or the grammar is not in this release yet and the entry should wait.`
  );
}

if (unreachable.length) {
  problems.push(
    `The highlighter ships ${unreachable.length} grammar(s) no filename reaches: ${unreachable.join(', ')}.\n` +
      `  Add an extension for each, or list it in NOT_FILE_SHAPED if no filename would select it.`
  );
}

if (problems.length) {
  console.error('\nsyntax-language map is out of step with the bundled highlighter:\n');
  for (const problem of problems) console.error(`- ${problem}\n`);
  process.exit(1);
}

console.log(`Checked ${mapped.size} mapped grammars against ${shipped.size} shipped`);
