import type { GroupConfig } from '../nav.ts';
import type { ApiModel } from './types.ts';

/** Tag folders are virtual: their labels and order come from the model, not a `_group.yaml`. */
export function openApiGroups(
  entries: Array<{ id: string; data: Record<string, unknown> }>
): Map<string, GroupConfig> {
  const out = new Map<string, GroupConfig>();
  const blank = { hidden: false, links: [] };
  for (const e of entries) {
    if (e.data.generated !== 'model') continue;
    const api = e.data.api as Pick<ApiModel, 'tags' | 'operations'>;
    const owner = e.data.owner as string;
    out.set(owner, { ...blank, order: api.tags.map((t) => t.slug) });
    for (const tag of api.tags) {
      out.set(`${owner}/${tag.slug}`, {
        ...blank,
        label: tag.name,
        order: api.operations.filter((o) => o.tagSlug === tag.slug).map((o) => o.slug),
      });
    }
  }
  return out;
}
