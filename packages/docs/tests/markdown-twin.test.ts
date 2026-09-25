import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { markdownTwinHref } from '../src/paths.ts';
import { entryMarkdown, expandMdxSource } from '../src/runtime/lib/markdown-twin.ts';

const page = fileURLToPath(new URL('./fixtures/markdown-twin/page.mdx', import.meta.url));

test('an imported MDX partial is inlined, its own imports and exports dropped', () => {
  const source = [
    "import DeclarationRef from './partial.mdx';",
    '',
    '# Declaration',
    '',
    '<DeclarationRef />',
    '',
  ].join('\n');

  const { markdown, unexpanded } = expandMdxSource(source, page);

  assert.equal(
    markdown,
    [
      '# Declaration',
      '',
      '## `eqty_sdk.Declaration.to_json`',
      '',
      '```python',
      'to_json() -> str',
      '```',
      '',
      'Convert to JSON string.',
      '',
    ].join('\n')
  );
  assert.deepEqual(unexpanded, []);
});

test('a CodeFence fed by a ?raw import becomes a fence long enough for its contents', () => {
  const source = [
    "import CodeFence from '@eqtylab/docs/components/CodeFence.astro';",
    "import sample from './sample.py?raw';",
    '',
    '- Run it:',
    '',
    '  <CodeFence code={sample} lang="python" title="sample.py" />',
    '',
  ].join('\n');

  const { markdown } = expandMdxSource(source, page);

  assert.equal(
    markdown,
    ['- Run it:', '', '  ````python title="sample.py"', '  print("```")', '  ````', ''].join('\n')
  );
});

test('a page with no imports comes back byte-identical', () => {
  const source = '# Title\n\n<Callout>Kept as written.</Callout>\n\n```js\nx\n```\n';
  assert.deepEqual(expandMdxSource(source, page), { markdown: source, unexpanded: [] });
});

test('a live demo has no Markdown form, so it stays as written and is not reported', () => {
  const source = "import { Button } from '@eqtylab/equality';\n\n<Button>Go</Button>\n";
  assert.deepEqual(expandMdxSource(source, page), { markdown: source, unexpanded: [] });
});

test('a CodeFence whose sample does not resolve stays as written, and is reported', () => {
  const source = [
    "import CodeFence from '@eqtylab/docs/components/CodeFence.astro';",
    "import gone from './missing.py?raw';",
    '',
    '<CodeFence code={gone} lang="python" />',
    '',
  ].join('\n');
  assert.deepEqual(expandMdxSource(source, page), { markdown: source, unexpanded: ['CodeFence'] });
});

test('a partial that cannot be read stays as written, and is reported', () => {
  const source = "import Gone from './missing.mdx';\n\n<Gone />\n";
  assert.deepEqual(expandMdxSource(source, page), { markdown: source, unexpanded: ['Gone'] });
});

const fixtures = fileURLToPath(new URL('./fixtures/markdown-twin/', import.meta.url));

/** Written at runtime: the pre-commit formatter would normalise a checked-in BOM or CRLF away. */
function scratchPage(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'markdown-twin-'));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
  return join(dir, 'page.mdx');
}

test('two imports on one line are both removed without touching the rest of the page', () => {
  const source =
    "import Nested from './nested.mdx'; import Front from './frontmatter.mdx';\n\n# T\n\n<Nested />\n\n<Front />\n";
  assert.deepEqual(expandMdxSource(source, page), {
    markdown: '# T\n\nConvert to JSON string.\n\nFront matter partial.\n',
    unexpanded: [],
  });
});

test('an import sharing its line with one that stays keeps the other intact', () => {
  const source =
    "import Nested from './nested.mdx'; import Other from './other.js';\n\n<Nested />\n";
  assert.equal(
    expandMdxSource(source, page).markdown,
    "import Other from './other.js';\n\nConvert to JSON string.\n"
  );
});

test("a partial's front matter is dropped", () => {
  const source = "import Front from './frontmatter.mdx';\n\n<Front />\n";
  assert.equal(expandMdxSource(source, page).markdown, 'Front matter partial.\n');
});

test('a partial saved with a BOM or CRLF endings expands cleanly', () => {
  const scratch = scratchPage({
    'bom.mdx': '\uFEFFimport Inner from "./inner.mdx";\n\nBOM partial.\n\n<Inner />\n',
    'inner.mdx': 'Inner.\n',
    'crlf.mdx': '---\r\ntitle: x\r\n---\r\nCRLF partial.\r\n',
  });
  const source =
    "import Bom from './bom.mdx';\nimport Crlf from './crlf.mdx';\n\n<Bom />\n\n<Crlf />\n";
  assert.deepEqual(expandMdxSource(source, scratch), {
    markdown: 'BOM partial.\n\nInner.\n\nCRLF partial.\n',
    unexpanded: [],
  });
});

test('CodeFence is recognised by the file it is imported from, not the name on the page', () => {
  const aliased = [
    "import Fence from '@eqtylab/docs/components/CodeFence.astro';",
    "import sample from './sample.py?raw';",
    '',
    "<Fence code={ sample } lang={'python'} />",
    '',
  ].join('\n');
  assert.equal(expandMdxSource(aliased, page).markdown, '````python\nprint("```")\n````\n');

  const impostor = [
    "import CodeFence from '@eqtylab/docs/components/Tabs.astro';",
    "import sample from './sample.py?raw';",
    '',
    '<CodeFence code={sample} />',
    '',
  ].join('\n');
  assert.deepEqual(expandMdxSource(impostor, page), { markdown: impostor, unexpanded: [] });
});

test('a plain .md partial is inlined as written', () => {
  const source = "import Plain from './plain.md';\n\n<Plain />\n";
  assert.equal(expandMdxSource(source, page).markdown, '# Plain\n\nA {curly} Markdown partial.\n');
});

test('an import still referenced elsewhere is kept', () => {
  const source = [
    "import CodeFence from '@eqtylab/docs/components/CodeFence.astro';",
    "import sample from './sample.py?raw';",
    '',
    '<CodeFence code={sample} />',
    '',
    'Length: {sample.length}',
    '',
  ].join('\n');
  assert.equal(
    expandMdxSource(source, page).markdown,
    [
      "import sample from './sample.py?raw';",
      '',
      '````',
      'print("```")',
      '````',
      '',
      'Length: {sample.length}',
      '',
    ].join('\n')
  );
});

test('a partial that imports itself stops at the cycle and is reported', () => {
  const source = "import Self from './self.mdx';\n\n<Self />\n";
  assert.deepEqual(expandMdxSource(source, page), {
    markdown: 'In self.\n\n<Self />\n',
    unexpanded: ['Self'],
  });
});

test('a tag the twin cannot place stays as written, and is reported', () => {
  const source = "import Nested from './nested.mdx';\n\n> <Nested />\n";
  assert.deepEqual(expandMdxSource(source, page), { markdown: source, unexpanded: ['Nested'] });
});

test('a page mentioning "import" with nothing to expand is untouched', () => {
  const source = '\n# T\n\nThis is important.\n';
  assert.deepEqual(expandMdxSource(source, page), { markdown: source, unexpanded: [] });
});

test('archived entries stay as written; latest ones resolve from the project root', () => {
  const body = "import Nested from './nested.mdx';\n\n<Nested />\n";
  const entry = { body, filePath: 'page.mdx' };
  assert.deepEqual(entryMarkdown(entry, fixtures, 'v3.9'), { markdown: body, unexpanded: [] });
  assert.equal(entryMarkdown(entry, fixtures, undefined).markdown, 'Convert to JSON string.\n');
});

test("a twin's URL names the home page index.md and follows base, prefix and version", () => {
  assert.equal(markdownTwinHref('index', { base: '/' }), '/index.md');
  assert.equal(markdownTwinHref('', { base: '/integrity-py/' }), '/integrity-py/index.md');
  assert.equal(
    markdownTwinHref('guides/intro', { base: '/', pathPrefix: 'docs', versionPrefix: 'v3.9' }),
    '/docs/v3.9/guides/intro.md'
  );
});

test('inlined content keeps a blank line from the prose around it', () => {
  const source = "import Front from './frontmatter.mdx';\n\nIntro line\n<Front />\nOutro line\n";
  assert.equal(
    expandMdxSource(source, page).markdown,
    'Intro line\n\nFront matter partial.\n\nOutro line\n'
  );
});

test('a tag sharing its line with other content stays, and is reported', () => {
  const source = "import Nested from './nested.mdx';\n\n<Nested /> <Nested />\n";
  assert.deepEqual(expandMdxSource(source, page), { markdown: source, unexpanded: ['Nested'] });
});

test('a comment inside an import block goes with the imports', () => {
  const source = "import Nested from './nested.mdx'; // shared intro\n// more\n\n<Nested />\n";
  assert.equal(expandMdxSource(source, page).markdown, 'Convert to JSON string.\n');
});

test('a partial imported through an alias is reported, not skipped silently', () => {
  const source = "import Aliased from '~/partials/a.mdx';\n\n<Aliased />\n";
  assert.deepEqual(expandMdxSource(source, page), { markdown: source, unexpanded: ['Aliased'] });
});
