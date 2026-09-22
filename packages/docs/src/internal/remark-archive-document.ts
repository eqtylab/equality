/**
 * Strips every MDX-specific node from an archived page, leaving headings, prose, lists, tables
 * and code fences.
 *
 * A versioned docsite freezes content, not code. An archived page's imports bind it to whatever
 * the library and the demo scaffolding look like today, so a removed export or a deleted widget
 * breaks a page nobody can edit. Dropping the imports and the elements they feed turns the page
 * back into what it was always a record of: the words and the samples.
 *
 * Remark, not rehype: the failure is Rollup refusing an import that no longer resolves, which
 * happens after MDX has compiled to JavaScript. The node has to be gone at the mdast stage.
 */
import { versionFromPath } from './rehype-base-url.ts';

interface Node {
  type: string;
  children?: Node[];
}

const MDX_NODES = new Set([
  'mdxjsEsm',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxFlowExpression',
  'mdxTextExpression',
]);

function prune(node: Node): void {
  if (!Array.isArray(node.children)) return;
  node.children = node.children.filter((child) => !MDX_NODES.has(child.type));
  for (const child of node.children) prune(child);
}

export function remarkArchiveDocument(options: { versionsDir?: string }) {
  return function transformer(tree: unknown, file?: { path?: string; history?: string[] }): void {
    const version = versionFromPath(file?.path ?? file?.history?.[0], options.versionsDir);
    if (!version) return;
    prune(tree as Node);
  };
}
