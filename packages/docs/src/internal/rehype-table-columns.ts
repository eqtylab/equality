/**
 * Annotates each markdown table with its column count. Equality's `TableContainer`
 * is a CSS grid and collapses to one column without an explicit track list.
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
