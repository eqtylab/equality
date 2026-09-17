/**
 * Only MDX supports the component overrides and the loader globs `.mdx` only,
 * so a stray `.md` would be silently absent from the site. Fail loudly instead.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'tinyglobby';

export function assertMdxOnly(contentDir: URL): void {
  const dir = fileURLToPath(contentDir);

  let strays: string[] = [];
  try {
    strays = globSync(['**/*.md'], { cwd: dir, absolute: false });
  } catch {
    return;
  }
  if (strays.length === 0) return;

  const list = strays
    .sort()
    .map((file) => `  - ${file}  ->  ${file.replace(/\.md$/i, '.mdx')}`)
    .join('\n');

  throw new Error(
    `[@eqtylab/docs] Found ${strays.length} Markdown file${strays.length > 1 ? 's' : ''} in ` +
      `${path.relative(process.cwd(), dir) || dir}:\n${list}\n\n` +
      `Docs content must be .mdx. Only MDX supports the component overrides that render\n` +
      `tables, code fences and callouts through Equality, so a .md page would look\n` +
      `different from every other page. Renaming is usually the only change needed --\n` +
      `MDX is a superset of Markdown.`
  );
}
