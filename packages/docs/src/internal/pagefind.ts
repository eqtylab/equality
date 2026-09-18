/**
 * Not `astro-pagefind`: it ships TypeScript, and Node will not compile that under
 * node_modules when this integration reaches it from its own bundle.
 *
 * Indexing only. A dev-server middleware could serve nothing but the previous build, so
 * `astro dev` has no index and the palette says so.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

const INDEX_DIR = 'pagefind';

/**
 * Pagefind also writes ~365 KB of its own search widgets, which the headless API never fetches.
 * Deleting them was built and reversed: only a browser test could catch an upgrade making one
 * a dependency, and those do not run in CI. Weight nobody downloads beats search that breaks.
 */

/** Pagefind collects errors per step and carries on; any of them means no usable index. */
function failOn(
  errors: string[],
  logger: { error: (message: string) => void },
  what: string
): void {
  if (!errors.length) return;
  errors.forEach((error) => logger.error(error));
  throw new Error(`[@eqtylab/docs] Pagefind could not ${what}.`);
}

export function pagefindIntegration(): AstroIntegration {
  return {
    name: '@eqtylab/docs/pagefind',
    hooks: {
      'astro:config:setup'({ config, logger }) {
        if (config.output === 'server') {
          logger.warn(
            'Output "server" emits no static HTML, so there is nothing for Pagefind to index.'
          );
        }
      },

      /** The last hook of the build, and the first moment every page exists on disk to read. */
      async 'astro:build:done'({ dir, logger }) {
        const outDir = fileURLToPath(dir);
        const { createIndex } = await import('pagefind');

        const { index, errors } = await createIndex();
        failOn(errors, logger, 'create an index');
        if (!index) throw new Error('[@eqtylab/docs] Pagefind returned no index.');

        const { page_count, errors: addErrors } = await index.addDirectory({ path: outDir });
        failOn(addErrors, logger, 'index the built output');

        const { outputPath, errors: writeErrors } = await index.writeFiles({
          outputPath: path.join(outDir, INDEX_DIR),
        });
        failOn(writeErrors, logger, 'write the index');

        logger.info(`indexed ${page_count} pages to ${outputPath}`);
      },
    },
  };
}
