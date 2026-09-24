import { readFile } from 'node:fs/promises';
import type { APIRoute } from 'astro';
import CONFIG from 'virtual:eqty-docs/config';

import { docsEntries } from '../lib/nav-data.ts';
import { servedFiles } from '../lib/openapi.ts';

const TYPES = {
  json: 'application/json; charset=utf-8',
  yaml: 'application/yaml; charset=utf-8',
};

export async function getStaticPaths() {
  const versions: Array<string | undefined> = [
    undefined,
    ...CONFIG.versionManifest.map((v) => v.id),
  ];
  const out = [];
  for (const versionId of versions) {
    for (const f of servedFiles((await docsEntries(versionId)) as never)) {
      out.push({
        // `undefined` (not '') is how a rest param matches the empty path, for an owner at the root.
        params: { slug: [versionId, f.slug].filter(Boolean).join('/') || undefined, ext: f.ext },
        props: f,
      });
    }
  }
  return out;
}

export const GET: APIRoute = async ({ props }) => {
  const { path, ext } = props as { path: string; ext: 'json' | 'yaml' };
  return new Response(await readFile(path), { headers: { 'Content-Type': TYPES[ext] } });
};
