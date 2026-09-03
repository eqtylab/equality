/**
 * Annotates each markdown table with its column count.
 *
 * Equality's `TableContainer` is `display: grid` with
 * `grid-template-columns: var(--table-columns)`, and every part below it uses
 * `subgrid` -- so it needs an explicit track list or the whole table collapses
 * into one column. Markdown has no syntax for that, so the count is derived
 * here, at build time, from the first row.
 *
 * Runs on `markdown.rehypePlugins`; @astrojs/mdx inherits those by default via
 * `extendMarkdownConfig`, which is how it reaches MDX content.
 */
import { visit } from 'unist-util-visit';

interface ElementNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: ElementNode[];
}

/** First `tr` in document order, searching thead before tbody. */
function firstRow(table: ElementNode): ElementNode | undefined {
  let found: ElementNode | undefined;
  visit(table as never, 'element', (node: ElementNode) => {
    if (found) return false;
    if (node.tagName === 'tr') {
      found = node;
      return false;
    }
    return undefined;
  });
  return found;
}

function countCells(row: ElementNode): number {
  return (row.children ?? []).reduce((total, child) => {
    if (child.type !== 'element') return total;
    if (child.tagName !== 'th' && child.tagName !== 'td') return total;
    // Respect colspan so a spanning header still yields the right track count.
    const span = Number(child.properties?.colSpan ?? child.properties?.colspan ?? 1);
    return total + (Number.isFinite(span) && span > 0 ? span : 1);
  }, 0);
}

export function rehypeTableColumns() {
  return function transformer(tree: unknown) {
    visit(tree as never, 'element', (node: ElementNode) => {
      if (node.tagName !== 'table') return;
      const row = firstRow(node);
      const count = row ? countCells(row) : 0;
      if (count <= 0) return;
      node.properties = { ...node.properties, dataColumnCount: String(count) };
    });
  };
}
