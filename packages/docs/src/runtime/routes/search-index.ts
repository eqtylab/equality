/**
 * Lightweight titles index.
 *
 * Pagefind indexes built HTML and so cannot work in `astro dev`; this is the dev
 * fallback, and the whole search provider for small sites.
 *
 * Headings come from render(), not from `entry.rendered.metadata`: the latter is
 * populated for .md but stays empty for .mdx, where headings are only known once
 * the component is compiled. Rendering here is a build-time cost on one route.
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
        // A page that cannot render still belongs in the index by title.
      }
      return {
        id: entry.id,
        title: entry.data.title,
        description: entry.data.description ?? '',
        // This index is per-build, so the prefix is already right for the build
        // that serves it.
        href: docsHref(entry.id, paths),
        headings,
      };
    })
  );

  return new Response(JSON.stringify({ version: 1, documents }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
