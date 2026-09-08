/**
 * Lifts each fenced code block's source and language onto its `<pre>` node.
 *
 * The bridge component needs the raw code as a string, because Equality's
 * `CodeBlock` takes `code` as a prop. Recovering it by rendering the slot to
 * HTML and re-parsing does not work: `Astro.slots.render()` returns
 * already-escaped markup in `astro dev` but raw markup in a production build,
 * so the fence rendered correctly when built and as literal escaped HTML in dev.
 *
 * Reading the hast directly removes the round-trip, so both paths are identical.
 */
import { visit } from 'unist-util-visit';

interface Node {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
  data?: { meta?: string };
}

/** Concatenate the text descendants of a node. */
function textOf(node: Node): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

function classNames(props: Record<string, unknown> | undefined): string[] {
  const raw = props?.className ?? props?.class;
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') return raw.split(/\s+/);
  return [];
}

/** ```ts title="button.tsx"  ->  "button.tsx" */
function titleFromMeta(meta: string | undefined): string | undefined {
  const match = meta?.match(/(?:^|\s)title=(?:"([^"]*)"|'([^']*)'|(\S+))/);
  return match ? (match[1] ?? match[2] ?? match[3]) : undefined;
}

export function rehypeCodeFence() {
  return function transformer(tree: unknown) {
    visit(tree as never, 'element', (node: Node) => {
      if (node.tagName !== 'pre') return;

      const code = (node.children ?? []).find(
        (child) => child.type === 'element' && child.tagName === 'code'
      );
      if (!code) return;

      const language = classNames(code.properties)
        .find((name) => name.startsWith('language-'))
        ?.slice('language-'.length);

      const title = titleFromMeta(code.data?.meta);

      node.properties = {
        ...node.properties,
        dataCode: textOf(code).replace(/\n$/, ''),
        ...(language ? { dataLanguage: language } : {}),
        ...(title ? { dataTitle: title } : {}),
      };
    });
  };
}
