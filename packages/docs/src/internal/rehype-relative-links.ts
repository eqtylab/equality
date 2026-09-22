/**
 * Resolves authored relative links between content files - `./usage.mdx`,
 * `../guides/index.md#anchor` - into the public URL of the page they name.
 * Markdown's own convention is a path on disk; the browser needs a route.
 *
 * Only files inside the content root are resolved, and only targets that land
 * inside it: a link out of the collection is someone else's URL to own.
 */
import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';

import { docsHref, isExternalHref, type PathContext } from '../paths.ts';

interface ElementNode {
  type: string;
  properties?: Record<string, unknown>;
}

interface VFile {
  path?: string;
}

export interface RelativeLinkOptions extends PathContext {
  /** Absolute path of the docs content directory. */
  contentRoot: string;
  /** Called with the resolved-but-missing target, so a typo fails loudly. */
  onMissing?: (href: string, filePath: string) => void;
}

const CONTENT_EXTENSIONS = ['.mdx', '.md'];

/** True once the id names a file Astro will have turned into a page. */
function hasEntry(contentRoot: string, id: string): boolean {
  const stem = path.join(contentRoot, id);
  return CONTENT_EXTENSIONS.some(
    (ext) => fs.existsSync(stem + ext) || fs.existsSync(path.join(stem, `index${ext}`))
  );
}

/** A content-relative link, split into the file part and any `#hash` / `?query`. */
function splitTarget(href: string): { target: string; suffix: string } | undefined {
  if (!href || isExternalHref(href)) return undefined;
  // Site-absolute, fragment-only and query-only links are already URLs.
  if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) return undefined;
  const match = /^([^#?]*)([#?].*)?$/.exec(href);
  const target = match?.[1];
  if (!target || !/\.mdx?$/i.test(target)) return undefined;
  return { target, suffix: match?.[2] ?? '' };
}

export function rehypeRelativeLinks(options: RelativeLinkOptions) {
  const { contentRoot, onMissing, ...ctx } = options;

  return function transformer(tree: unknown, file?: VFile) {
    const filePath = file?.path;
    if (!filePath) return;

    // Content files only. A page elsewhere in the project has its own notion of "here".
    const fromRoot = path.relative(contentRoot, filePath);
    if (!fromRoot || fromRoot.startsWith('..') || path.isAbsolute(fromRoot)) return;

    visit(tree as never, 'element', (node: ElementNode) => {
      const props = node.properties;
      const href = props?.href;
      if (!props || typeof href !== 'string') return;

      const split = splitTarget(href);
      if (!split) return;

      const absolute = path.resolve(path.dirname(filePath), split.target);
      const relative = path.relative(contentRoot, absolute);
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return;

      // Astro's ids are extensionless and drop a folder's `index`, except at the root.
      const id = relative
        .split(path.sep)
        .join('/')
        .replace(/\.mdx?$/i, '')
        .replace(/\/index$/, '');

      if (!hasEntry(contentRoot, id)) onMissing?.(href, filePath);

      props.href = docsHref(id, ctx) + split.suffix;
    });
  };
}
