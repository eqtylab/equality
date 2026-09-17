/**
 * Route-level MDX component map. Entries here OVERRIDE a page's own
 * `export const components`, so keep it small.
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

  // An explicit import of Alert from @eqtylab/equality still wins.
  Alert: AlertBridge,

  // All hook-free, so they render statically with no client directive.
  table: TableBridge,
  thead: TableHeader,
  tbody: TableBody,
  tfoot: TableFooter,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
  caption: TableCaption,
};

// With 'shiki', Astro has already rendered the block.
if (CONFIG.code?.highlighter === 'codeblock') {
  base.pre = CodeFenceBridge;
}

export const mdxComponents = base;
