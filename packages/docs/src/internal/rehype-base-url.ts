/**
 * Rewrites root-relative URLs in markdown/MDX to include Astro's `base`.
 *
 * Astro does not do this for authored markdown links, so without it every
 * `[text](/guides/)` in content 404s in any build served from a sub-path --
 * which is every versioned build, and every GitHub Pages project site.
 *
 * Applied to `markdown.rehypePlugins`; @astrojs/mdx inherits those by default
 * via `extendMarkdownConfig`, which is how it reaches MDX content.
 */
import { visit } from 'unist-util-visit';

interface ElementNode {
  type: string;
  properties?: Record<string, unknown>;
}

/**
 * Attributes whose value is a single URL, and those holding a candidate list.
 *
 * Matched on any element rather than per tag: a root-relative `href` or `src`
 * needs the base prefix wherever it appears, so a tag table would only be a
 * list of things to forget to add.
 */
const URL_ATTRS = ['href', 'src', 'poster'];
const SRCSET_ATTRS = ['srcSet', 'srcset'];

function shouldRewrite(value: string, base: string): boolean {
  if (!value.startsWith('/')) return false; // relative, fragment, query, or absolute URL
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
    // A root base means there is nothing to prefix.
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

/** Rewrites root-relative URLs in an authored HTML string (frontmatter fields). */
export function rewriteHtmlBase(html: string, base: string): string {
  if (!base || base === '/') return html;
  return html.replace(
    /\b(href|src)=("|')(\/(?!\/)[^"']*)\2/g,
    (_match, attr: string, quote: string, url: string) =>
      `${attr}=${quote}${rewrite(url, base)}${quote}`
  );
}
