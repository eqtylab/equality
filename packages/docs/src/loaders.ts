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

import { docsSchema, groupSchema } from './schema.ts';

const GROUP_GLOB = '**/_group.{yaml,yml,json}';

/** Sentinel id for the content root's own `_group.yaml`; '' is not a valid store key. */
export const ROOT_GROUP_ID = '~root';

/**
 * MDX only; stray `.md` files fail in `assertMdxOnly`. The `_*` negation is
 * required: the glob loader has no underscore skipping, so `_group.yaml` would become a page.
 * `dir` is an absolute path for an extracted version; `base` is relative to `src/` for latest.
 */
export function docsLoader(options: { base?: string; dir?: string } = {}): Loader {
  const base = options.dir ?? `./src/${options.base ?? 'content/docs'}`;
  return glob({
    base,
    pattern: ['**/*.mdx', '!**/_*', '!**/_*/**'],
  });
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
