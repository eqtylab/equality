/** Markdown twin of every page, for LLM and agent consumption. */
import { idToPath } from '@eqtylab/docs/paths';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import CONFIG from 'virtual:eqty-docs/config';

import { collectionsFor } from '../lib/nav-data.ts';

export async function getStaticPaths() {
  const visible = ({ data }: { data: { draft?: boolean; noIndex?: boolean } }) =>
    !data.draft && !data.noIndex;
  const anyCollection = getCollection as unknown as (
    name: string,
    f: typeof visible
  ) => Promise<never[]>;
  const versions: Array<string | undefined> = [
    undefined,
    ...CONFIG.versionManifest.map((v) => v.id),
  ];
  const out: Array<{ params: { slug: string }; props: { entry: unknown } }> = [];
  for (const versionId of versions) {
    const entries = (await anyCollection(collectionsFor(versionId).docs, visible)) as Array<{
      id: string;
    }>;
    for (const entry of entries) {
      // An empty slug would emit a file literally called ".md".
      const page = idToPath(entry.id) || 'index';
      out.push({ params: { slug: versionId ? `${versionId}/${page}` : page }, props: { entry } });
    }
  }
  return out;
}

type Deprecated = boolean | { message?: string; replacedBy?: string } | undefined;

/** Agents read the twin, not the rendered banner, so the deprecation has to travel with it. */
function deprecationNotice(deprecated: Deprecated) {
  if (!deprecated) return [];
  const detail = typeof deprecated === 'object' ? deprecated : {};
  const message = stripHtml(detail.message) ?? 'This page documents a deprecated feature.';
  const replacedBy = detail.replacedBy ? ` Use ${stripHtml(detail.replacedBy)} instead.` : '';
  return [`> **Deprecated** — ${message}${replacedBy}`, ''];
}

/** Frontmatter messages may carry authored HTML links, which are noise in plain Markdown. */
function stripHtml(value?: string) {
  return value?.replace(/<[^>]*>/g, '').trim() || undefined;
}

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as {
    entry: {
      body?: string;
      data: { title: string; description?: string; deprecated?: Deprecated };
    };
  };

  const frontmatter = ['---', `title: ${JSON.stringify(entry.data.title)}`];
  if (entry.data.description) {
    frontmatter.push(`description: ${JSON.stringify(entry.data.description)}`);
  }
  if (entry.data.deprecated) {
    frontmatter.push('deprecated: true');
  }
  frontmatter.push(`source: ${JSON.stringify(CONFIG.title)}`, '---', '');

  const body = [...deprecationNotice(entry.data.deprecated), entry.body ?? ''].join('\n');

  return new Response(frontmatter.join('\n') + body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
