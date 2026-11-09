import { readFile } from 'node:fs/promises';
import path from 'node:path';
import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';

// Resolved from the working directory: under jsdom, paths built from import.meta.url fail with ENOENT
export async function compileCss(file: string): Promise<string> {
  const from = path.resolve(process.cwd(), file);
  const result = await postcss([tailwindcss()]).process(await readFile(from, 'utf8'), { from });
  return result.css;
}

// The body of the first rule for selector, nested blocks included
export function ruleBody(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`no rule for ${selector}`);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(css.indexOf('{', start) + 1, i);
  }
  throw new Error(`unclosed rule for ${selector}`);
}
