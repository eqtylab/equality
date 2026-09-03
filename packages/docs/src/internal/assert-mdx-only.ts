/**
 * Content is MDX-only.
 *
 * All EQTY docs are authored as MDX, and only MDX supports the component
 * overrides the framework relies on -- Astro's plain-Markdown pipeline has no
 * component substitution, so a `.md` page would quietly render with different
 * tables, callouts and code blocks than every other page.
 *
 * Rather than support two rendering paths that look subtly different, the
 * loader globs `.mdx` only. That would make a stray `.md` file silently absent
 * from the site, which is a worse failure than a loud one -- hence this check.
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
    // No content directory yet: nothing to check.
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
