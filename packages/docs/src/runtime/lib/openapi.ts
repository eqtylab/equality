import type { ApiModel } from '@eqtylab/docs/openapi';
import { modelId } from '@eqtylab/docs/openapi';
import { idToPath } from '@eqtylab/docs/paths';

type AnyEntry = { id: string; data: Record<string, any> };

export const isModelEntry = (e: AnyEntry) => e.data.generated === 'model';

export function modelFor(entries: AnyEntry[], ownerId: string): ApiModel | undefined {
  return entries.find((e) => e.id === modelId(ownerId))?.data.api as ApiModel | undefined;
}

export function sourceExtFor(entries: AnyEntry[], ownerId: string): 'json' | 'yaml' {
  return (
    (entries.find((e) => e.id === modelId(ownerId))?.data.source?.ext as 'json' | 'yaml') ?? 'json'
  );
}

export function tagRedirects(entries: AnyEntry[]) {
  return entries.filter(isModelEntry).flatMap((e) =>
    (e.data.api as ApiModel).tags.map((t) => ({
      slug: [idToPath(e.data.owner), 'operations', 'tags', t.slug].filter(Boolean).join('/'),
      ownerId: e.data.owner as string,
    }))
  );
}

export function servedFiles(entries: AnyEntry[]) {
  return entries.filter(isModelEntry).map((e) => ({
    slug: idToPath(e.data.owner),
    path: e.data.source.path as string,
    ext: e.data.source.ext as 'json' | 'yaml',
  }));
}
