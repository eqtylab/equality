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
