/** Prefixes root-relative URLs with Astro's `base`, which Astro does not do for authored markdown links. */
import { visit } from 'unist-util-visit';

interface ElementNode {
  type: string;
  properties?: Record<string, unknown>;
}

const URL_ATTRS = ['href', 'src', 'poster'];
const SRCSET_ATTRS = ['srcSet', 'srcset'];

function shouldRewrite(value: string, base: string): boolean {
  if (!value.startsWith('/')) return false;
  if (value.startsWith('//')) return false; // protocol-relative
  if (base !== '/' && (value === base.replace(/\/$/, '') || value.startsWith(base))) return false;
  return true;
}

function rewrite(value: string, base: string): string {
  return shouldRewrite(value, base) ? base.replace(/\/$/, '') + value : value;
}

function rewriteSrcset(value: string, base: string): string {
  return value
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim();
      if (!trimmed) return candidate;
      const [url, ...descriptors] = trimmed.split(/\s+/);
      return [rewrite(url as string, base), ...descriptors].join(' ');
    })
    .join(', ');
}

export function rehypeBaseUrl(options: { base: string }) {
  const base = options.base || '/';

  return function transformer(tree: unknown) {
    if (base === '/') return;

    visit(tree as never, 'element', (node: ElementNode) => {
      const props = node.properties;
      if (!props) return;

      for (const attr of URL_ATTRS) {
        const value = props[attr];
        if (typeof value === 'string') props[attr] = rewrite(value, base);
      }

      for (const attr of SRCSET_ATTRS) {
        const value = props[attr];
        if (typeof value === 'string') props[attr] = rewriteSrcset(value, base);
      }
    });
  };
}

/** Same, for authored HTML strings in frontmatter. */
export function rewriteHtmlBase(html: string, base: string): string {
  if (!base || base === '/') return html;
  return html.replace(
    /\b(href|src)=("|')(\/(?!\/)[^"']*)\2/g,
    (_match, attr: string, quote: string, url: string) =>
      `${attr}=${quote}${rewrite(url, base)}${quote}`
  );
}
