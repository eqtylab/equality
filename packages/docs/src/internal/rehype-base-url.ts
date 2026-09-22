/**
 * Prefixes root-relative URLs with Astro's `base`, which Astro does not do for authored
 * markdown links, and with the page's version segment when the file is an extracted copy.
 */
import path from 'node:path';
import { visit } from 'unist-util-visit';

interface ElementNode {
  type: string;
  properties?: Record<string, unknown>;
}

const URL_ATTRS = ['href', 'src', 'poster'];
const SRCSET_ATTRS = ['srcSet', 'srcset'];

function trimSlashes(s: string): string {
  return s.replace(/^\/+|\/+$/g, '');
}

/** `/site/` + `docs` + `v3.9` → `/site/docs/v3.9`. Empty parts vanish. Returns '' when nothing applies. */
function prefixOf(
  base: string,
  pathPrefix: string | undefined,
  version: string | undefined
): string {
  const parts = [base, pathPrefix, version].map((p) => (p ? trimSlashes(p) : '')).filter(Boolean);
  return parts.length ? '/' + parts.join('/') : '';
}

function shouldRewrite(value: string, prefix: string): boolean {
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//')) return false; // protocol-relative
  if (prefix && (value === prefix || value.startsWith(prefix + '/'))) return false;
  return true;
}

/**
 * When the URL already carries the path prefix (`/docs/x`), the version goes after it (`/docs/v3.9/x`),
 * matching the injected route `${pathPrefix}/[...slug]`.
 */
function rewrite(
  value: string,
  base: string,
  pathPrefix: string | undefined,
  version: string | undefined
): string {
  const full = prefixOf(base, pathPrefix, version);
  if (!full || !shouldRewrite(value, full)) return value;
  const pp = pathPrefix ? '/' + trimSlashes(pathPrefix) : '';
  if (pp && (value === pp || value.startsWith(pp + '/'))) {
    const rest = value.slice(pp.length);
    return prefixOf(base, pathPrefix, version) + rest;
  }
  return full + value;
}

function rewriteSrcset(value: string, base: string, pathPrefix?: string, version?: string): string {
  return value
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim();
      if (!trimmed) return candidate;
      const [url, ...descriptors] = trimmed.split(/\s+/);
      return [rewrite(url as string, base, pathPrefix, version), ...descriptors].join(' ');
    })
    .join(', ');
}

/** The version id when `filePath` sits under `<versionsDir>/<id>/`, else undefined. */
export function versionFromPath(
  filePath: string | undefined,
  versionsDir: string | undefined
): string | undefined {
  if (!filePath || !versionsDir) return undefined;
  const rel = path.relative(versionsDir, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return undefined;
  return rel.split(path.sep)[0] || undefined;
}

export function rehypeBaseUrl(options: {
  base: string;
  pathPrefix?: string;
  versionsDir?: string;
}) {
  const base = options.base || '/';

  return function transformer(tree: unknown, file?: { path?: string; history?: string[] }) {
    const version = versionFromPath(file?.path ?? file?.history?.[0], options.versionsDir);
    if (base === '/' && !version) return;

    visit(tree as never, 'element', (node: ElementNode) => {
      const props = node.properties;
      if (!props) return;

      for (const attr of URL_ATTRS) {
        const value = props[attr];
        if (typeof value === 'string') {
          props[attr] = rewrite(value, base, options.pathPrefix, version);
        }
      }

      for (const attr of SRCSET_ATTRS) {
        const value = props[attr];
        if (typeof value === 'string') {
          props[attr] = rewriteSrcset(value, base, options.pathPrefix, version);
        }
      }
    });
  };
}

/** Same, for authored HTML strings in frontmatter. */
export function rewriteHtmlBase(
  html: string,
  base: string,
  pathPrefix?: string,
  version?: string
): string {
  if ((!base || base === '/') && !version) return html;
  return html.replace(
    /\b(href|src)=("|')(\/(?!\/)[^"']*)\2/g,
    (_match, attr: string, quote: string, url: string) =>
      `${attr}=${quote}${rewrite(url, base, pathPrefix, version)}${quote}`
  );
}
