import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';

import { scopeDecisions } from '../src/scripts/build-decisions.js';
import { compileCss } from './compile-css';

let scoped: string;

beforeAll(async () => {
  scoped = await compileCss('src/theme/theme.module.css');
}, 30_000);

// Top-level rules with their nested blocks: Tailwind adds `@supports` fallbacks inside each colour rule
function rulesDeclaring(css: string, name: string): { selector: string; body: string }[] {
  const rules: { selector: string; body: string }[] = [];
  let depth = 0;
  let start = 0;
  let open = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') {
      if (depth === 0) open = i;
      depth++;
    } else if (css[i] === '}') {
      depth--;
      if (depth === 0) {
        rules.push({ selector: css.slice(start, open).trim(), body: css.slice(open + 1, i) });
        start = i + 1;
      }
    }
  }
  return rules.filter((r) => new RegExp(`${name}\\s*:`).test(r.body));
}

describe('scoped build', () => {
  it('declares none of its decisions outside .root, so none reach the host page', () => {
    const leaks = rulesDeclaring(scoped, '--(eq-[\\w-]+|color-list-item-(current|hover))').filter(
      (r) => /\bhtml\b|:root/.test(`${r.selector} ${r.body}`)
    );
    expect(leaks.map((r) => r.selector)).toEqual([]);
  });
});

describe('theme-decisions-scoped.css', () => {
  it('is up to date with theme-decisions.css; run pnpm build:decisions if not', async () => {
    const [source, generated] = await Promise.all([
      readFile('src/theme/theme-decisions.css', 'utf8'),
      readFile('src/theme/theme-decisions-scoped.css', 'utf8'),
    ]);
    expect(generated).toBe(scopeDecisions(source));
  });
});
