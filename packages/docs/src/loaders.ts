/** Astro cannot inject collections from an integration, so these are imported from the consumer's `content.config.ts`. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import type { Loader, LoaderContext } from 'astro/loaders';
import { globSync } from 'tinyglobby';
import CONFIG from 'virtual:eqty-docs/config';
import { parse as parseYaml } from 'yaml';

import { isDocsEntryPath } from './internal/docs-entry-path.ts';
import { createExpander } from './openapi/expand.ts';
import { assertNotForged } from './openapi/fan-out.ts';
import type { ApiModel } from './openapi/types.ts';
import { docsSchema, groupSchema } from './schema.ts';

const GROUP_GLOB = '**/_group.{yaml,yml,json}';

/** Sentinel id for the content root's own `_group.yaml`; '' is not a valid store key. */
export const ROOT_GROUP_ID = '~root';

type Watcher = NonNullable<LoaderContext['watcher']>;
type FileListener = (file: string, ...rest: unknown[]) => void;

const FILE_EVENTS = ['add', 'change', 'unlink'] as const;

// Astro's glob watcher ORs the patterns (`picomatch.isMatch`), so the `_` negations stop nothing
// in dev: without this filter every `_api.json` or `_group.yaml` save fails the page schema.
function docsOnlyWatcher(watcher: Watcher, contentRoot: string): Watcher {
  return new Proxy(watcher, {
    get(target, prop) {
      if (prop === 'on') {
        return (event: string, listener: FileListener) =>
          target.on(
            event,
            (FILE_EVENTS as readonly string[]).includes(event)
              ? (file: string, ...rest: unknown[]) => {
                  if (isDocsEntryPath(path.relative(contentRoot, file))) listener(file, ...rest);
                }
              : listener
          );
      }
      const value = Reflect.get(target, prop);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

/**
 * MDX only; stray `.md` files fail in `assertMdxOnly`. The `_*` negation is
 * required: the glob loader has no underscore skipping, so `_group.yaml` would become a page.
 * `dir` is an absolute path for an extracted version; `base` is relative to `src/` for latest.
 */
export function docsLoader(options: { base?: string; dir?: string } = {}): Loader {
  const base = options.dir ?? `./src/${options.base ?? 'content/docs'}`;
  const inner = glob({ base, pattern: ['**/*.mdx', '!**/_*', '!**/_*/**'] });
  const cache = new Map<string, { digest: string; model: ApiModel }>();
  let latest: { expander: ReturnType<typeof createExpander>; logger: LoaderContext['logger'] };

  const reexpand = (ownerId: string) =>
    latest.expander.expand(ownerId, false).catch((err: Error) => latest.logger.error(err.message));

  const onFile = (file: string) => {
    const ownerId = latest?.expander.ownerOf(file);
    if (!ownerId) return;
    // The glob loader's MDX `onChange` is async; expanding at once would read the entry it is replacing.
    if (file.endsWith('.mdx')) setTimeout(() => void reexpand(ownerId), 50);
    else void reexpand(ownerId);
  };

  return {
    name: options.dir ? `@eqtylab/docs:docs:${path.basename(options.dir)}` : '@eqtylab/docs:docs',
    async load(ctx: LoaderContext) {
      const projectRoot = fileURLToPath(ctx.config.root);
      const contentRoot = fileURLToPath(new URL(base, ctx.config.root)).replace(/[\\/]$/, '');
      await inner.load({
        ...ctx,
        watcher: ctx.watcher && docsOnlyWatcher(ctx.watcher, contentRoot),
      });

      latest = {
        logger: ctx.logger,
        expander: createExpander(
          { projectRoot, contentRoot, cache },
          {
            store: ctx.store,
            parseData: ctx.parseData,
            generateDigest: ctx.generateDigest,
            readFile: (abs) => readFile(abs, 'utf8'),
            logger: ctx.logger,
            watch: (abs) => ctx.watcher?.add(abs),
          }
        ),
      };

      // One watcher serves every collection, and Astro drops all listeners only on a full sync:
      // `off` first so a partial resync does not stack a second set, and never guard on a flag.
      // Attach before anything below can throw, or a broken file leaves dev deaf until restart.
      for (const event of FILE_EVENTS) {
        ctx.watcher?.off(event, onFile);
        ctx.watcher?.on(event, onFile);
      }

      for (const [id, entry] of [...ctx.store.entries()]) {
        if (!entry.filePath) continue;
        assertNotForged({ id, filePath: entry.filePath, data: entry.data });
        if ((entry.data as { openapi?: string }).openapi) await latest.expander.expand(id, true);
      }
    },
  };
}

export function groupsLoader(options: { base?: string; dir?: string } = {}): Loader {
  const base = options.base ?? 'content/docs';

  return {
    name: options.dir
      ? `@eqtylab/docs:groups:${path.basename(options.dir)}`
      : '@eqtylab/docs:groups',

    async load({ store, parseData, generateDigest, watcher, logger, config }: LoaderContext) {
      const rootDir = options.dir ?? fileURLToPath(new URL(`./${base}/`, config.srcDir));

      const files = globSync([GROUP_GLOB], { cwd: rootDir, absolute: false });
      const untouched = new Set(store.keys());

      for (const rel of files) {
        const dir = path.posix.dirname(rel.split(path.sep).join('/'));
        const id = dir === '.' ? ROOT_GROUP_ID : dir;
        const abs = path.join(rootDir, rel);

        let text: string;
        try {
          text = await readFile(abs, 'utf8');
        } catch (err) {
          logger.warn(`Could not read ${rel}: ${(err as Error).message}`);
          continue;
        }

        const digest = generateDigest(text);
        if (store.get(id)?.digest === digest) {
          untouched.delete(id);
          continue;
        }

        let raw: unknown;
        try {
          raw = rel.endsWith('.json') ? JSON.parse(text) : parseYaml(text);
        } catch (err) {
          throw new Error(`[@eqtylab/docs] Could not parse ${rel}: ${(err as Error).message}`);
        }

        const data = await parseData({
          id,
          data: (raw ?? {}) as Record<string, unknown>,
          filePath: path.relative(fileURLToPath(config.root), abs),
        });

        store.set({
          id,
          data,
          digest,
          filePath: path.relative(fileURLToPath(config.root), abs),
        });
        untouched.delete(id);
      }

      // Anything left was deleted on disk.
      for (const id of untouched) store.delete(id);

      if (watcher) {
        watcher.add(rootDir);
      }
    },
  };
}

/** Latest plus one pair per extracted version, ready to spread into `collections`. */
export function docsCollections(options: { base?: string } = {}) {
  const collections: Record<string, ReturnType<typeof defineCollection>> = {
    docs: defineCollection({
      loader: docsLoader(options),
      schema: docsSchema(),
    }),
    docsGroups: defineCollection({
      loader: groupsLoader(options),
      schema: groupSchema(),
    }),
  };
  for (const version of CONFIG.versionManifest ?? []) {
    collections[`docs_${version.suffix}`] = defineCollection({
      loader: docsLoader({ dir: version.dir }),
      schema: docsSchema(),
    });
    collections[`docsGroups_${version.suffix}`] = defineCollection({
      loader: groupsLoader({ dir: version.dir }),
      schema: groupSchema(),
    });
  }
  return collections;
}
