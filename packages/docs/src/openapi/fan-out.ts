import { markdownFor } from './markdown.ts';
import type { ApiModel } from './types.ts';

export const GENERATED_FIELDS = ['generated', 'owner', 'operation', 'api', 'source'] as const;

export const modelId = (ownerId: string) => `${ownerId}/~api`;
export const operationEntryId = (ownerId: string, slug: string) => `${ownerId}/operations/${slug}`;
export const isGeneratedKey = (ownerId: string, key: string) =>
  key === modelId(ownerId) || key.startsWith(`${ownerId}/operations/`);

export type OwnerInfo = {
  id: string;
  title: string;
  draft?: boolean;
  hidden?: boolean;
  noIndex?: boolean;
};

export function fanOut(
  owner: OwnerInfo,
  model: ApiModel,
  source: { path: string; ext: 'json' | 'yaml' }
): Array<{ id: string; data: Record<string, unknown>; body?: string }> {
  // A draft or noIndex owner must not leak its operations into production, search or llms.txt.
  const inherited = {
    draft: owner.draft ?? false,
    hidden: owner.hidden ?? false,
    noIndex: owner.noIndex ?? false,
  };
  return [
    {
      id: modelId(owner.id),
      data: {
        title: owner.title,
        generated: 'model',
        owner: owner.id,
        api: model,
        source,
        draft: inherited.draft,
        hidden: true,
        noIndex: true,
      },
    },
    ...model.operations.map((op) => ({
      id: operationEntryId(owner.id, op.slug),
      data: {
        title: op.title,
        description: op.description,
        generated: 'operation',
        owner: owner.id,
        operation: op,
        deprecated: op.deprecated,
        ...inherited,
      },
      body: markdownFor(op, model),
    })),
  ];
}

export function assertNotForged(entry: {
  id: string;
  filePath?: string;
  data: Record<string, unknown>;
}) {
  if (!entry.filePath) return;
  const forged = GENERATED_FIELDS.filter((f) => entry.data[f] !== undefined);
  if (forged.length) {
    throw new Error(
      `[@eqtylab/docs] ${entry.filePath} sets ${forged.join(', ')} in its frontmatter.\n` +
        '  These fields are set by the OpenAPI viewer only. Remove them, and use `openapi:` to point at the file.'
    );
  }
}
