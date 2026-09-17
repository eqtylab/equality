/**
 * Marks the content a page authored as markdown or as plain HTML, so
 * `prose.css` can typeset it without reaching inside a component.
 *
 * MDX parses a component's children as markdown whenever they sit on their own
 * lines, so `<Badge icon="Shield">\n  Primary\n</Badge>` renders a `<p>` inside
 * the badge — and prettier puts them there. Authoring discipline cannot fix it;
 * the boundary has to be drawn here. Everything below a capitalised JSX tag is
 * that component's business, `<div>` and friends are the page's own.
 */
import { SKIP, visit } from 'unist-util-visit';

const MARKER = 'data-eq-md';

interface Attribute {
  type: string;
  name?: string | null;
}

interface Node {
  type: string;
  name?: string | null;
  properties?: Record<string, unknown>;
  attributes?: Attribute[];
}

/** Capitalised or dotted JSX names are components; `div`, `span` and friends are not. */
function isComponent(node: Node): boolean {
  if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return false;
  const name = node.name;
  return typeof name === 'string' && (/^[A-Z]/.test(name) || name.includes('.'));
}

export function rehypeProseScope() {
  return function transformer(tree: unknown) {
    visit(tree as never, (node: Node) => {
      if (isComponent(node)) return SKIP;

      if (node.type === 'element') {
        node.properties = { ...node.properties, dataEqMd: '' };
        return undefined;
      }

      // Authored HTML. A JSX fragment has no name and nothing to mark.
      if ((node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name) {
        const attributes = node.attributes ?? [];
        if (!attributes.some((a) => a.type === 'mdxJsxAttribute' && a.name === MARKER)) {
          attributes.push({ type: 'mdxJsxAttribute', name: MARKER, value: '' } as Attribute);
        }
        node.attributes = attributes;
      }

      return undefined;
    });
  };
}
