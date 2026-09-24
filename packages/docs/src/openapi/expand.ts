import path from 'node:path';

import { assertNotForged, fanOut, isGeneratedKey } from './fan-out.ts';
import { loadOpenApi, OpenApiError } from './index.ts';
import type { ApiModel, Operation } from './types.ts';

export interface ExpandContext {
  store: {
    get(id: string): { data: Record<string, unknown>; filePath?: string } | undefined;
    set(entry: { id: string; data: Record<string, unknown>; body?: string; digest?: string }): void;
    delete(id: string): void;
    keys(): Iterable<string>;
  };
  parseData(p: { id: string; data: Record<string, unknown> }): Promise<Record<string, unknown>>;
  generateDigest(text: string): string;
  readFile(abs: string): Promise<string>;
  logger: { warn(m: string): void; error(m: string): void };
  watch?(abs: string): void;
}

type OwnerData = {
  title: string;
  openapi?: string;
  draft?: boolean;
  hidden?: boolean;
  noIndex?: boolean;
};

export function createExpander(
  opts: {
    projectRoot: string;
    contentRoot: string;
    cache: Map<string, { digest: string; model: ApiModel }>;
    load?: typeof loadOpenApi;
  },
  ctx: ExpandContext
) {
  const load = opts.load ?? loadOpenApi;
  const owners = new Map<string, string>();
  // Watcher events arrive faster than an expand finishes; unserialised, two runs interleave deletes and writes.
  const queues = new Map<string, Promise<void>>();

  const fail = (fatal: boolean, err: Error) => {
    if (fatal) throw err;
    ctx.logger.error(err.message);
  };

  async function run(ownerId: string, fatal: boolean) {
    // An authored MDX file can sit under `<owner>/operations/`; only entries without a file are ours.
    for (const key of [...ctx.store.keys()]) {
      if (isGeneratedKey(ownerId, key) && !ctx.store.get(key)?.filePath) ctx.store.delete(key);
    }

    const owner = ctx.store.get(ownerId);
    const data = owner?.data as OwnerData | undefined;
    if (!owner?.filePath) return;
    owners.set(path.join(opts.projectRoot, owner.filePath), ownerId);
    if (!data?.openapi) return;
    assertNotForged({ id: ownerId, filePath: owner.filePath, data: owner.data });

    const abs = path.resolve(
      path.dirname(path.join(opts.projectRoot, owner.filePath)),
      data.openapi
    );
    const rel = path.relative(opts.projectRoot, abs);
    if (!abs.startsWith(opts.contentRoot + path.sep)) {
      return fail(
        fatal,
        new OpenApiError(
          owner.filePath,
          `openapi: ${data.openapi} resolves to ${rel}, outside the content directory.`,
          'Move the file next to this page. Versioned docs only freeze files inside the content directory.'
        )
      );
    }
    owners.set(abs, ownerId);
    ctx.watch?.(abs);

    let text: string;
    try {
      text = await ctx.readFile(abs);
    } catch {
      return fail(
        fatal,
        new OpenApiError(
          owner.filePath,
          `openapi: ${data.openapi} resolves to ${rel}, which does not exist.`,
          'Correct the path, which is relative to this page.'
        )
      );
    }

    const digest = ctx.generateDigest(text);
    const cached = opts.cache.get(abs);
    let model = cached?.digest === digest ? cached.model : undefined;
    try {
      model ??= await load(text, rel, (m) => ctx.logger.warn(m));
    } catch (err) {
      return fail(fatal, err as Error);
    }
    opts.cache.set(abs, { digest, model });

    const ext = /\.ya?ml$/i.test(abs) ? 'yaml' : 'json';
    for (const item of fanOut({ id: ownerId, ...data }, model, { path: abs, ext })) {
      const authored = ctx.store.get(item.id)?.filePath;
      if (authored) {
        const slug = (item.data.operation as Operation | undefined)?.slug;
        fail(
          fatal,
          new OpenApiError(
            authored,
            `has the same URL as ${slug ? `operation ${slug}` : 'the API overview'} generated from ${rel}.`,
            'Rename or move this page.'
          )
        );
        continue;
      }
      ctx.store.set({
        id: item.id,
        data: await ctx.parseData(item),
        body: item.body,
        digest: ctx.generateDigest(`${digest}:${item.id}`),
      });
    }
  }

  return {
    expand(ownerId: string, fatal: boolean): Promise<void> {
      const next = (queues.get(ownerId) ?? Promise.resolve())
        .catch(() => {})
        .then(() => run(ownerId, fatal));
      queues.set(ownerId, next);
      return next;
    },
    ownerOf: (abs: string) => owners.get(abs),
  };
}
