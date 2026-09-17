/**
 * Lifts each fence's source, language and title onto its `<pre>`. Do not recover
 * the source from the rendered slot: `Astro.slots.render()` escapes in dev but not in build.
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
