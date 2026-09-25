/**
 * The Markdown twin and the copy payload start from the page's MDX source, where an imported
 * partial or a `?raw` sample is only a tag. This puts their content back, splicing by source
 * offset so everything it does not recognise stays byte-identical.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxFromMarkdown } from 'mdast-util-mdx';
import { mdxjs } from 'micromark-extension-mdxjs';
import { SKIP, visit } from 'unist-util-visit';

interface Point {
  offset?: number;
}

interface Node {
  type: string;
  name?: string | null;
  position?: { start: Point; end: Point };
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  children?: Node[];
  data?: { estree?: { body: EsmStatement[] } };
}

interface EsmStatement {
  type: string;
  start: number;
  end: number;
  source?: { value: string };
  specifiers?: Array<{ type: string; local: { name: string }; imported?: { name?: string } }>;
}

type Binding =
  | { kind: 'partial'; path: string; markdown: boolean }
  | { kind: 'raw'; path: string }
  /** `name` is the component's own name, whatever the page calls it. */
  | { kind: 'component'; name: string }
  /** A partial behind an alias or package path, which only Vite can resolve. */
  | { kind: 'unresolved' }
  | { kind: 'other' };

/** `skip` has no Markdown form by design, like a live demo; `failed` should have expanded. */
type Flattened = { text: string } | 'skip' | 'failed';

interface ExpandContext {
  /** Files being expanded, outermost first; one that reappears is a cycle. */
  stack: string[];
  unexpanded: Set<string>;
}

interface Edit {
  start: number;
  end: number;
  text: string;
}

export interface ExpandedSource {
  markdown: string;
  /**
   * Tags that should have expanded but could not: an unreadable partial, a CodeFence whose sample
   * did not resolve. Components with no Markdown form, like a live demo, are expected and absent.
   */
  unexpanded: string[];
}

class Expression {
  readonly source: string;
  constructor(source: string) {
    this.source = source.trim();
  }
}

type Attrs = Record<string, string | Expression | null | undefined>;

/** Components the twin can flatten, keyed by the component's own name. */
const MARKDOWN_FORMS: Record<string, (attrs: Attrs, raw: Map<string, string>) => string | null> = {
  CodeFence(attrs, raw) {
    const code = attrs.code instanceof Expression ? raw.get(attrs.code.source) : undefined;
    if (code === undefined) return null;
    const lang = literal(attrs.lang) ?? '';
    const title = literal(attrs.title);
    const info = title === undefined ? lang : `${lang} title=${JSON.stringify(title)}`;
    return fence(code.replace(/\r?\n$/, ''), info);
  },
};

const DOCS_COMPONENT = /^@eqtylab\/docs\/components(?:\/(\w+)\.astro)?$/;

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/;

export function expandMdxSource(source: string, filePath: string): ExpandedSource {
  const ctx: ExpandContext = { stack: [filePath], unexpanded: new Set() };
  const markdown = expand(source, filePath, ctx, false) ?? source;
  return { markdown, unexpanded: [...ctx.unexpanded] };
}

/**
 * The Markdown of a content entry. Archived copies stay as written: their imports point at
 * files the version cache does not hold, and their rendered page drops those tags anyway.
 */
export function entryMarkdown(
  entry: { body?: string; filePath?: string },
  projectRoot: string,
  version: string | null | undefined
): ExpandedSource {
  const body = entry.body ?? '';
  if (version || !entry.filePath) return { markdown: body, unexpanded: [] };
  return expandMdxSource(body, resolve(projectRoot, entry.filePath));
}

/** Null when a partial will not parse, so its caller can leave the tag and report it. */
function expand(
  source: string,
  filePath: string,
  ctx: ExpandContext,
  partial: boolean
): string | null {
  // micromark drops a BOM without counting it, which would shift every offset below by one.
  const text = source.replace(/^\uFEFF/, '');
  if (!partial && !text.includes('import')) return source;

  let tree: Node;
  try {
    tree = fromMarkdown(text, {
      extensions: [mdxjs()],
      mdastExtensions: [mdxFromMarkdown()],
    }) as Node;
  } catch {
    return partial ? null : source;
  }

  const bindings = new Map<string, Binding>();
  const imports: Array<{ statement: EsmStatement; names: string[]; node: Node }> = [];
  const esmNodes: Node[] = [];

  for (const node of tree.children ?? []) {
    if (node.type !== 'mdxjsEsm') continue;
    esmNodes.push(node);
    for (const statement of node.data?.estree?.body ?? []) {
      if (statement.type !== 'ImportDeclaration' || !statement.source) continue;
      const specifiers = statement.specifiers ?? [];
      imports.push({ statement, names: specifiers.map((s) => s.local.name), node });
      for (const s of specifiers) {
        bindings.set(s.local.name, classify(s, statement.source.value, filePath));
      }
    }
  }

  const raw = new Map<string, string>();
  for (const [name, binding] of bindings) {
    if (binding.kind !== 'raw') continue;
    const content = readText(binding.path);
    if (content !== null) raw.set(name, content);
  }

  const replacements: Edit[] = [];

  visit(tree as never, (node: Node) => {
    if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') return;
    const name = node.name ?? '';
    const binding = bindings.get(name);
    if (!binding) return;

    const result = flatten(node, binding, raw, ctx);
    if (result === 'skip') return;

    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    const place = start === undefined || end === undefined ? null : placement(text, start, end);
    if (result === 'failed' || node.type !== 'mdxJsxFlowElement' || !place) {
      ctx.unexpanded.add(name);
      return SKIP;
    }

    const body = reindent(result.text, place.indent);
    replacements.push({
      start: start!,
      end: end!,
      text: `${place.padBefore ? `\n${place.indent}` : ''}${body}${place.padAfter ? '\n' : ''}`,
    });
    return SKIP;
  });

  const removals: Edit[] = partial
    ? esmNodes.map((node) =>
        removal(text, node.position!.start.offset!, node.position!.end.offset!)
      )
    : importRemovals(text, imports, replacements);

  if (replacements.length === 0 && removals.length === 0) return partial ? text : source;

  const out = applyEdits(text, [...replacements, ...removals]);
  return partial ? out : out.replace(/^(?:\r?\n)+/, '');
}

function classify(
  specifier: { type: string; imported?: { name?: string } },
  from: string,
  filePath: string
): Binding {
  const component = DOCS_COMPONENT.exec(from);
  if (component) {
    const name =
      specifier.type === 'ImportDefaultSpecifier' ? component[1] : specifier.imported?.name;
    return name ? { kind: 'component', name } : { kind: 'other' };
  }
  const [path, query] = from.split('?');
  if (specifier.type !== 'ImportDefaultSpecifier') return { kind: 'other' };
  if (!from.startsWith('.')) {
    return query === undefined && /\.mdx?$/.test(path) ? { kind: 'unresolved' } : { kind: 'other' };
  }
  const abs = resolve(dirname(filePath), path);
  if (query === 'raw') return { kind: 'raw', path: abs };
  if (query === undefined && /\.mdx?$/.test(abs)) {
    return { kind: 'partial', path: abs, markdown: abs.endsWith('.md') };
  }
  return { kind: 'other' };
}

function flatten(
  node: Node,
  binding: Binding,
  raw: Map<string, string>,
  ctx: ExpandContext
): Flattened {
  if (binding.kind === 'component') {
    const form = MARKDOWN_FORMS[binding.name];
    if (!form) return 'skip';
    const text = form(attributes(node), raw);
    return text === null ? 'failed' : { text };
  }
  if (binding.kind === 'unresolved') return 'failed';
  if (binding.kind !== 'partial') return 'skip';

  if ((node.children ?? []).length > 0 || ctx.stack.includes(binding.path)) return 'failed';
  const content = readText(binding.path);
  if (content === null) return 'failed';

  const body = content.replace(/^\uFEFF/, '').replace(FRONTMATTER, '');
  const text = binding.markdown
    ? body
    : expand(body, binding.path, { ...ctx, stack: [...ctx.stack, binding.path] }, true);
  if (text === null) return 'failed';
  return { text: text.replace(/^(?:[ \t]*\r?\n)+/, '').trimEnd() };
}

function attributes(node: Node): Attrs {
  const attrs: Attrs = {};
  for (const attr of node.attributes ?? []) {
    if (attr.type !== 'mdxJsxAttribute' || !attr.name) continue;
    const value = attr.value as string | { value: string } | null | undefined;
    attrs[attr.name] = value && typeof value === 'object' ? new Expression(value.value) : value;
  }
  return attrs;
}

/** A plain string attribute, or one written as a string literal: `lang={'python'}`. */
function literal(value: Attrs[string]): string | undefined {
  if (typeof value === 'string') return value;
  if (!(value instanceof Expression)) return undefined;
  const quoted = /^(['"`])([^'"`$\\]*)\1$/.exec(value.source);
  return quoted?.[2];
}

function fence(code: string, info: string): string {
  const longest = Math.max(0, ...(code.match(/`+/g) ?? []).map((run) => run.length));
  const ticks = '`'.repeat(Math.max(3, longest + 1));
  return `${ticks}${info}\n${code}\n${ticks}`;
}

function readText(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Where a tag can take a block of Markdown: alone on its line, with blank lines added where it
 * touches prose, which would otherwise run on into the inlined block. Null when anything else
 * shares its line, like a `>` or a second tag.
 */
function placement(text: string, start: number, end: number) {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const indent = text.slice(lineStart, start);
  const newline = text.indexOf('\n', end);
  const rest = text.slice(end, newline === -1 ? text.length : newline);
  if (!/^[ \t]*$/.test(indent) || rest.trim()) return null;

  const previous = text.slice(
    text.lastIndexOf('\n', lineStart - 2) + 1,
    Math.max(lineStart - 1, 0)
  );
  const nextEnd = newline === -1 ? -1 : text.indexOf('\n', newline + 1);
  const next =
    newline === -1 ? '' : text.slice(newline + 1, nextEnd === -1 ? text.length : nextEnd);
  return {
    indent,
    padBefore: lineStart > 0 && previous.trim() !== '',
    padAfter: next.trim() !== '',
  };
}

function reindent(text: string, indent: string): string {
  if (!indent) return text;
  return text
    .split('\n')
    .map((line, i) => (i === 0 || line === '' ? line : indent + line))
    .join('\n');
}

/**
 * An import goes only when a tag it feeds was replaced and nothing else names it. When every
 * statement in an ESM block goes, the block goes whole, so its comments are not left as prose.
 */
function importRemovals(
  text: string,
  imports: Array<{ statement: EsmStatement; names: string[]; node: Node }>,
  replacements: Edit[]
): Edit[] {
  const removable = imports.filter(({ statement, names }) =>
    names.every(
      (name) =>
        mentionsWithin(text, name, replacements) > 0 &&
        mentionsWithin(text, name, [statement, ...replacements]) === mentions(text, name)
    )
  );
  const byNode = new Map<Node, EsmStatement[]>();
  for (const { statement, node } of removable) {
    byNode.set(node, [...(byNode.get(node) ?? []), statement]);
  }
  return [...byNode].flatMap(([node, statements]) =>
    statements.length === (node.data?.estree?.body ?? []).length
      ? [removal(text, node.position!.start.offset!, node.position!.end.offset!)]
      : statements.map((statement) => removal(text, statement.start, statement.end))
  );
}

function identifierPositions(text: string, name: string): number[] {
  const escaped = name.replace(/[$]/g, '\\$');
  return [...text.matchAll(new RegExp(`(?<![\\w$])${escaped}(?![\\w$])`, 'g'))].map((m) => m.index);
}

function mentions(text: string, name: string): number {
  return identifierPositions(text, name).length;
}

function mentionsWithin(text: string, name: string, spans: Array<{ start: number; end: number }>) {
  return identifierPositions(text, name).filter((at) =>
    spans.some((span) => at >= span.start && at < span.end)
  ).length;
}

/**
 * The whole line when the statement is alone on it, so no blank line is left behind. Otherwise
 * only the statement: a whole-line cut would take a neighbouring import on the same line with it.
 */
function removal(text: string, start: number, end: number): Edit {
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const newline = text.indexOf('\n', end);
  const lineEnd = newline === -1 ? text.length : newline + 1;
  const before = text.slice(lineStart, start);
  const after = text.slice(end, lineEnd);
  if (!before.trim() && !after.trim()) return { start: lineStart, end: lineEnd, text: '' };
  return { start, end: end + (/^[ \t]*/.exec(after)?.[0].length ?? 0), text: '' };
}

/** Removals can overlap each other; merging them first stops a later cut landing on shifted text. */
function applyEdits(text: string, edits: Edit[]): string {
  const merged: Edit[] = [];
  for (const edit of [...edits].sort((a, b) => a.start - b.start)) {
    const last = merged.at(-1);
    if (last && edit.start < last.end) {
      last.end = Math.max(last.end, edit.end);
      last.text += edit.text;
    } else {
      merged.push({ ...edit });
    }
  }
  let out = text;
  for (const edit of merged.reverse()) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  return out;
}
