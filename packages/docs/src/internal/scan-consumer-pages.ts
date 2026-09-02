/**
 * Works out which routes the consumer's own `src/pages` files already claim.
 *
 * This exists because Astro does NOT de-duplicate injected routes against
 * file-based ones. Route *priority* correctly prefers a consumer's static page
 * over our catch-all when matching, but the static build's route list is
 * `[...fileBasedRoutes, ...injectedRoutes, ...redirects]` with no de-dup -- so
 * a page claimed by both gets emitted twice and the winner is a write-order
 * accident. Yielding therefore has to be explicit on our side.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'tinyglobby';

const PAGE_EXTENSIONS = ['astro', 'md', 'mdx', 'html', 'ts', 'js'];

export interface ConsumerPages {
  /** Concrete route paths the consumer's pages generate, normalised without trailing slash. */
  ownedPaths: string[];
  /** Route patterns claimed by consumer pages, e.g. '/[...slug]' or '/404'. */
  claimedPatterns: Set<string>;
}

/** `index.astro` -> '', `a/b.astro` -> '/a/b', `[...slug].astro` -> '/[...slug]' */
function toRoutePath(relative: string): string {
  const withoutExt = relative.replace(/\.[^./]+$/, '');
  const segments = withoutExt.split(path.sep).join('/').split('/').filter(Boolean);
  if (segments.at(-1) === 'index') segments.pop();
  return '/' + segments.join('/');
}

export function scanConsumerPages(srcDir: URL): ConsumerPages {
  const pagesDir = fileURLToPath(new URL('./pages/', srcDir));

  let files: string[] = [];
  try {
    files = globSync([`**/*.{${PAGE_EXTENSIONS.join(',')}}`], {
      cwd: pagesDir,
      absolute: false,
    });
  } catch {
    // No src/pages at all is the expected case for a docs-only site.
    return { ownedPaths: [], claimedPatterns: new Set() };
  }

  const ownedPaths: string[] = [];
  const claimedPatterns = new Set<string>();

  for (const file of files) {
    // Astro ignores files and directories prefixed with `_`.
    if (file.split(path.sep).some((segment) => segment.startsWith('_'))) continue;

    const routePath = toRoutePath(file);
    claimedPatterns.add(routePath === '' ? '/' : routePath);

    // Only static routes reserve a concrete path; a dynamic one claims a pattern.
    if (!/[[\]]/.test(file)) {
      ownedPaths.push(routePath.replace(/\/+$/, '') || '/');
    }
  }

  return { ownedPaths, claimedPatterns };
}
