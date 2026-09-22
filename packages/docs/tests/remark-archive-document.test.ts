import assert from 'node:assert/strict';
import { test } from 'node:test';

import { remarkArchiveDocument } from '../src/internal/remark-archive-document.ts';

const VERSIONS_DIR = '/p/.astro/eqty-docs/versions';
const ARCHIVED = `${VERSIONS_DIR}/v3.9/components/button.mdx`;
const LATEST = '/p/src/content/docs/components/button.mdx';

interface Node {
  type: string;
  children?: Node[];
  value?: string;
}

function page(): Node {
  return {
    type: 'root',
    children: [
      { type: 'mdxjsEsm', value: "import { ButtonDemo } from '@demo/components/demo/button';" },
      { type: 'heading', children: [{ type: 'text', value: 'Button' }] },
      { type: 'paragraph', children: [{ type: 'text', value: 'A button.' }] },
      { type: 'mdxJsxFlowElement', children: [] },
      { type: 'mdxFlowExpression', value: '{1 + 1}' },
      { type: 'code', value: '<Button />' },
    ],
  };
}

function types(node: Node): string[] {
  return (node.children ?? []).map((c) => c.type);
}

function run(tree: Node, path: string, versionsDir: string | undefined) {
  remarkArchiveDocument({ versionsDir })(tree, { path });
}

test('an archived page keeps prose, headings and code, and loses every MDX node', () => {
  const tree = page();
  run(tree, ARCHIVED, VERSIONS_DIR);
  assert.deepEqual(types(tree), ['heading', 'paragraph', 'code']);
});

test('a page outside the versions dir is untouched', () => {
  const tree = page();
  run(tree, LATEST, VERSIONS_DIR);
  assert.deepEqual(types(tree), [
    'mdxjsEsm',
    'heading',
    'paragraph',
    'mdxJsxFlowElement',
    'mdxFlowExpression',
    'code',
  ]);
});

test('no versionsDir means no page is archived, whatever its path', () => {
  const tree = page();
  run(tree, ARCHIVED, undefined);
  assert.deepEqual(types(tree), [
    'mdxjsEsm',
    'heading',
    'paragraph',
    'mdxJsxFlowElement',
    'mdxFlowExpression',
    'code',
  ]);
});

test('inline MDX nodes go while their text siblings stay', () => {
  const tree: Node = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'before ' },
          { type: 'mdxJsxTextElement', children: [] },
          { type: 'text', value: ' middle ' },
          { type: 'mdxTextExpression', value: '{x}' },
          { type: 'text', value: ' after' },
        ],
      },
    ],
  };
  run(tree, ARCHIVED, VERSIONS_DIR);
  assert.deepEqual(types(tree), ['paragraph']);
  assert.deepEqual(
    tree.children![0]!.children!.map((c) => c.value),
    ['before ', ' middle ', ' after']
  );
});

test('a code fence survives, which is what archived pages exist to preserve', () => {
  const tree: Node = {
    type: 'root',
    children: [{ type: 'code', value: '<Button variant="primary" />' }],
  };
  run(tree, ARCHIVED, VERSIONS_DIR);
  assert.deepEqual(types(tree), ['code']);
  assert.equal(tree.children![0]!.value, '<Button variant="primary" />');
});
