/**
 * Not `astro-pagefind`: it ships TypeScript, and Node will not compile that under
 * node_modules when this integration reaches it from its own bundle.
 *
 * The build writes the index; dev serves that same index off disk, so it always
 * describes the last build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

const INDEX_DIR = 'pagefind';

/** Everything else Pagefind fetches is read as bytes, so the type never reaches a parser. */
const MIME: Record<string, string> = {
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
};

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

function indexRequest(url: string | undefined, base: string): string | null {
  if (!url) return null;
  const pathname = decodeURIComponent(url.split(/[?#]/)[0]);
  const prefix = `${base.replace(/\/+$/, '')}/${INDEX_DIR}/`;
  return pathname.startsWith(prefix) ? pathname.slice(prefix.length) : null;
}

export function pagefindIntegration(): AstroIntegration {
  let indexDir = '';

  return {
    name: '@eqtylab/docs/pagefind',
    hooks: {
      'astro:config:setup'({ config, logger }) {
        indexDir = path.join(fileURLToPath(config.outDir), INDEX_DIR);

        if (config.output === 'server') {
          logger.warn(
            'Output "server" emits no static HTML, so there is nothing for Pagefind to index.'
          );
        }
      },

      /** Runs ahead of Vite's static middleware and Astro's handler; move it and `/pagefind/*` 404s. */
      'astro:server:setup'({ server, logger }) {
        const base = server.config.base ?? '/';

        logger.info(
          fs.existsSync(indexDir)
            ? 'serving the search index from the last build; rebuild to pick up edits'
            : 'no search index yet — run `astro build` once to search in dev'
        );

        server.middlewares.use((req, res, next) => {
          const requested = indexRequest(req.url, base);
          if (requested === null) return next();

          const file = path.join(indexDir, requested);
          // The prefix check is what stops `..` climbing out of the index directory.
          if (!file.startsWith(indexDir + path.sep) || !fs.existsSync(file)) return next();

          res.setHeader('Content-Type', MIME[path.extname(file)] ?? 'application/octet-stream');
          // The next build rewrites these in place, and a cached fragment would outlive it.
          res.setHeader('Cache-Control', 'no-store');
          fs.createReadStream(file).pipe(res);
        });
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
