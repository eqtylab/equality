/**
 * The route-level MDX component map.
 *
 * Kept deliberately small. @astrojs/mdx builds the map as
 * `{ Fragment, ...fileComponents, ...props.components }`, so entries here
 * OVERRIDE a page's own `export const components`. Anything richer is provided
 * as an explicit import from '@eqtylab/docs/components' instead, which keeps
 * per-page overrides possible.
 */
import {
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@eqtylab/equality';
import CONFIG from 'virtual:eqty-docs/config';

import AlertBridge from '../components/AlertBridge.astro';
import CodeFenceBridge from '../components/CodeFenceBridge.astro';
import Link from '../components/Link.astro';
import TableBridge from '../components/TableBridge.astro';

const base: Record<string, unknown> = {
  a: Link,

  // Named components are provided here too, not just element overrides, so an
  // author writes <Alert> with no import and never meets a docs-specific
  // wrapper. An explicit import of Alert from @eqtylab/equality still wins, and
  // yields the raw component.
  Alert: AlertBridge,

  // Markdown tables render through Equality's Table rather than bespoke prose
  // CSS, so docs tables and product tables cannot drift apart. Every one of
  // these is hook-free, so they render statically with no client directive.
  table: TableBridge,
  thead: TableHeader,
  tbody: TableBody,
  tfoot: TableFooter,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
  caption: TableCaption,
};

// With highlighter: 'codeblock', markdown.syntaxHighlight is off, so fences
// arrive as a plain <pre><code> and this override routes them through
// Equality's CodeBlock. With 'shiki', Astro has already rendered the block.
if (CONFIG.code?.highlighter === 'codeblock') {
  base.pre = CodeFenceBridge;
}

export const mdxComponents = base;
