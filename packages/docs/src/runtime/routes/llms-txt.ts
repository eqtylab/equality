/** An index of every page, in the llms.txt convention. */
import { docsHref } from '@eqtylab/docs/paths';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import CONFIG from 'virtual:eqty-docs/config';

export const GET: APIRoute = async (ctx) => {
  const entries = await getCollection(
    'docs',
    ({ data }: { data: { draft?: boolean; noIndex?: boolean } }) => !data.draft && !data.noIndex
  );

  const paths = {
    base: import.meta.env.BASE_URL,
    pathPrefix: CONFIG.pathPrefix,
  };
  const origin = (ctx.site ?? new URL(ctx.request.url)).origin;

  const sorted = [...entries].sort((a, b) => a.data.title.localeCompare(b.data.title));

  const lines = [
    `# ${CONFIG.title}`,
    '',
    ...(CONFIG.description ? [`> ${CONFIG.description}`, ''] : []),
    '## Pages',
    '',
    ...sorted.map((entry) => {
      const href = docsHref(entry.id, paths).replace(/\/$/, '');
      const suffix = entry.data.description ? `: ${entry.data.description}` : '';
      return `- [${entry.data.title}](${origin}${href}.md)${suffix}`;
    }),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
