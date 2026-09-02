/**
 * The route-level MDX component map.
 *
 * Kept deliberately small. @astrojs/mdx builds the map as
 * `{ Fragment, ...fileComponents, ...props.components }`, so entries here
 * OVERRIDE a page's own `export const components`. Anything richer is provided
 * as an explicit import from '@eqtylab/docs/components' instead, which keeps
 * per-page overrides possible.
 */
import CONFIG from 'virtual:eqty-docs/config';

import CodeFenceBridge from '../components/CodeFenceBridge.astro';
import Link from '../components/Link.astro';

const base: Record<string, unknown> = { a: Link };

// With highlighter: 'codeblock', markdown.syntaxHighlight is off, so fences
// arrive as a plain <pre><code> and this override routes them through
// Equality's CodeBlock. With 'shiki', Astro has already rendered the block.
if (CONFIG.code?.highlighter === 'codeblock') {
  base.pre = CodeFenceBridge;
}

export const mdxComponents = base;
