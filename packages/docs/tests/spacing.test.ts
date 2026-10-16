import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const require = createRequire(join(root, 'package.json'));
const entry = join(root, 'src/runtime/styles/docs.css');

function packageStylesheet(id: string, from: string): string {
  const parts = id.split('/');
  const scoped = parts[0].startsWith('@');
  const name = scoped ? `${parts[0]}/${parts[1]}` : parts[0];
  const subpath = parts.slice(scoped ? 2 : 1).join('/');
  for (let dir = from; ; dir = dirname(dir)) {
    const pkgDir = join(dir, 'node_modules', name);
    if (existsSync(pkgDir)) {
      const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
      const exported = pkg.exports?.[subpath ? `./${subpath}` : '.'];
      const file =
        typeof exported === 'string'
          ? exported
          : (exported?.style ?? exported?.default ?? (subpath || pkg.style));
      return resolve(pkgDir, file);
    }
    if (dir === dirname(dir)) throw new Error(`cannot resolve ${id} from ${from}`);
  }
}

async function compileDocsCss(candidates: string[] = []): Promise<string> {
  const tailwind = await import(require.resolve('tailwindcss'));
  const compile = tailwind.compile ?? tailwind.default.compile;
  const compiler = await compile(await readFile(entry, 'utf8'), {
    base: dirname(entry),
    loadStylesheet: async (id: string, base: string) => {
      if (id.startsWith('@fontsource')) return { path: id, base, content: '' };
      const path = id.startsWith('.')
        ? resolve(base, id)
        : packageStylesheet(id === 'tailwindcss' ? 'tailwindcss/index.css' : id, base);
      return { path, base: dirname(path), content: await readFile(path, 'utf8') };
    },
    loadModule: async () => ({ module: {}, base: root }),
  });
  return compiler.build(candidates);
}

const block = (css: string, opener: string) => {
  const start = css.indexOf(opener);
  assert.notEqual(start, -1, `no rule opening with ${opener}`);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`unclosed rule after ${opener}`);
};

test('each compact prose override follows the comfortable value it replaces', async () => {
  const css = await compileDocsCss();
  const cases: Array<[string, string, string]> = [
    ['&:is(h2) {', 'margin-top: calc(0.25rem * 20)', 'margin-top: calc(0.25rem * 12)'],
    ['&:is(h3) {', 'margin-top: calc(0.25rem * 12)', 'margin-top: calc(0.25rem * 8)'],
    ['&:is(p) {', 'margin-bottom: calc(0.25rem * 6)', 'margin-bottom: calc(0.25rem * 4)'],
    ['&:is(ul, ol) {', 'margin-bottom: calc(0.25rem * 6)', 'margin-bottom: calc(0.25rem * 4)'],
    ['&:is(hr) {', 'margin-bottom: calc(0.25rem * 6)', 'margin-bottom: calc(0.25rem * 4)'],
  ];
  for (const [opener, comfortable, compact] of cases) {
    const rule = block(css, opener);
    const override = rule.indexOf('&:where(html[data-eq-docs-spacing=compact] *)');
    assert.ok(override > rule.indexOf(comfortable), `${opener} compact override comes first`);
    assert.ok(rule.indexOf(compact, override) > override, `${opener} compact value missing`);
  }
});

test('the h2 label applies only while heading labels are on', async () => {
  const labels = block(await compileDocsCss(), '&:has(+ h3) {');
  assert.match(
    labels,
    /&:where\(html:not\(\[data-eq-docs-heading-labels=false\]\) \*\) \{[^}]*text-transform: uppercase/
  );
  assert.doesNotMatch(labels.split('&:where(')[0], /text-transform: uppercase/);
});

test('a compact utility in markup sorts after the comfortable one it overrides', async () => {
  const css = await compileDocsCss(['mt-24', 'compact:mt-16', 'py-10', 'compact:py-6']);
  assert.ok(css.indexOf('.compact\\:mt-16') > css.indexOf('.mt-24'));
  assert.ok(css.indexOf('.compact\\:py-6') > css.indexOf('.py-10'));
});

test('DocsShell writes both options onto <html>', () => {
  const shell = readFileSync(join(root, 'src/runtime/layouts/DocsShell.astro'), 'utf8');
  const tag = shell.indexOf('\n<html');
  assert.notEqual(tag, -1, 'no <html> tag');
  const html = shell.slice(tag, shell.indexOf('>', tag) + 1);
  assert.match(html, /data-eq-docs-spacing=\{CONFIG\.spacing\}/);
  assert.match(html, /data-eq-docs-heading-labels=\{String\(CONFIG\.headingLabels\)\}/);
});
