/**
 * Pagefind wired directly rather than through `astro-pagefind`. That wrapper does the same
 * job, but publishes TypeScript source, and Node cannot strip types under node_modules when
 * this integration reaches it from its own bundle. `pagefind` itself ships compiled JS.
 *
 * Indexing only, by choice. There is no dev-server middleware: Pagefind reads built HTML, so
 * an index served in `astro dev` could only ever describe the previous build. The palette
 * says search needs a build rather than answering with stale results.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

const INDEX_DIR = 'pagefind';

/**
 * Pagefind also writes four search widgets of its own, about 365 KB we never fetch because the
 * palette drives the headless API. Deleting them after the write was built and reversed: the
 * only thing that could catch an upgrade making one of them a dependency is a browser test,
 * and those do not run in CI. Weight nobody downloads beats search that breaks after deploy.
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
