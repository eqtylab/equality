/**
 * Markdown twin of every page, for LLM and agent consumption.
 *
 * Replaces the astro-markdown-export dependency (whose peer range declares
 * astro ^5.14.1 against Astro 6).
 */
import { idToPath } from '@eqtylab/docs/paths';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import CONFIG from 'virtual:eqty-docs/config';

export async function getStaticPaths() {
  const entries = await getCollection(
    'docs',
    ({ data }: { data: { draft?: boolean; noIndex?: boolean } }) => !data.draft && !data.noIndex
  );
  return entries.map((entry) => ({
    // The root page needs a real name: an empty slug against the "[...slug].md"
    // pattern would emit a file literally called ".md".
    params: { slug: idToPath(entry.id) || 'index' },
    props: { entry },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as {
    entry: { body?: string; data: { title: string; description?: string } };
  };

  const frontmatter = ['---', `title: ${JSON.stringify(entry.data.title)}`];
  if (entry.data.description) {
    frontmatter.push(`description: ${JSON.stringify(entry.data.description)}`);
  }
  frontmatter.push(`source: ${JSON.stringify(CONFIG.title)}`, '---', '');

  return new Response(frontmatter.join('\n') + (entry.body ?? ''), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
