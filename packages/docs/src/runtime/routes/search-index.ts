/**
 * Titles index: the dev fallback for Pagefind and the whole provider for small
 * sites. Headings come from render() because `entry.rendered.metadata` is empty for MDX.
 */
import { docsHref } from '@eqtylab/docs/paths';
import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import CONFIG from 'virtual:eqty-docs/config';

interface StoreEntry {
  id: string;
  data: { title: string; description?: string; draft?: boolean; noIndex?: boolean };
  rendered?: { metadata?: { headings?: Array<{ depth: number; slug: string; text: string }> } };
}

export const GET: APIRoute = async () => {
  const entries = (await getCollection(
    'docs',
    ({ data }: { data: { draft?: boolean; noIndex?: boolean } }) => !data.draft && !data.noIndex
  )) as unknown as StoreEntry[];

  const paths = { base: import.meta.env.BASE_URL, pathPrefix: CONFIG.pathPrefix };

  const documents = await Promise.all(
    entries.map(async (entry) => {
      let headings: Array<{ text: string; slug: string }> = [];
      try {
        const rendered = await render(entry as never);
        headings = (rendered.headings ?? [])
          .filter((h) => h.depth >= 2 && h.depth <= 3)
          .map((h) => ({ text: h.text, slug: h.slug }));
      } catch {
        // Still index the page by title.
      }
      return {
        id: entry.id,
        title: entry.data.title,
        description: entry.data.description ?? '',
        href: docsHref(entry.id, paths),
        headings,
      };
    })
  );

  return new Response(JSON.stringify({ version: 1, documents }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
