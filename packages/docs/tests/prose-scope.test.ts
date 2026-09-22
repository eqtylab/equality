import assert from 'node:assert/strict';
import { test } from 'node:test';

import { rehypeProseScope } from '../src/internal/rehype-prose-scope.ts';

interface TestNode {
  type: string;
  tagName?: string;
  name?: string | null;
  properties?: Record<string, unknown>;
  attributes?: { type: string; name?: string | null; value?: unknown }[];
  children?: TestNode[];
}

const element = (tagName: string, children: TestNode[] = []): TestNode => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});

const jsx = (name: string | null, children: TestNode[] = []): TestNode => ({
  type: 'mdxJsxFlowElement',
  name,
  attributes: [],
  children,
});

const run = (tree: TestNode) => {
  rehypeProseScope()(tree);
  return tree;
};

const marked = (node: TestNode) =>
  node.type === 'element'
    ? node.properties?.dataEqMd === ''
    : (node.attributes ?? []).some((a) => a.name === 'data-eq-md');

test('markdown elements are marked', () => {
  const p = element('p');
  run({ type: 'root', children: [element('h2'), p] });
  assert.ok(marked(p));
});

test('markdown inside a component is left alone', () => {
  const p = element('p');
  run({ type: 'root', children: [jsx('Badge', [p])] });
  assert.equal(marked(p), false);
});

test('a dotted component name is a boundary too', () => {
  const p = element('p');
  run({ type: 'root', children: [jsx('Card.Content', [p])] });
  assert.equal(marked(p), false);
});

test('markdown inside authored HTML is still the page talking', () => {
  const p = element('p');
  const div = jsx('div', [p]);
  run({ type: 'root', children: [div] });
  assert.ok(marked(div));
  assert.ok(marked(p));
});

test('authored HTML below a component is not marked', () => {
  const span = jsx('span');
  run({ type: 'root', children: [jsx('Tooltip', [jsx('div', [span])])] });
  assert.equal(marked(span), false);
});

test('a fragment is transparent', () => {
  const p = element('p');
  const fragment = jsx(null, [p]);
  run({ type: 'root', children: [fragment] });
  assert.equal(fragment.attributes?.length, 0);
  assert.ok(marked(p));
});

test('existing properties and attributes survive', () => {
  const img = element('img');
  img.properties = { src: '/a.png' };
  const div = jsx('div', [img]);
  div.attributes = [{ type: 'mdxJsxAttribute', name: 'className', value: 'grid' }];
  run({ type: 'root', children: [div] });
  assert.deepEqual(img.properties, { src: '/a.png', dataEqMd: '' });
  assert.deepEqual(
    div.attributes.map((a) => a.name),
    ['className', 'data-eq-md']
  );
});

test('marking twice does not duplicate the attribute', () => {
  const div = jsx('div');
  const tree: TestNode = { type: 'root', children: [div] };
  run(tree);
  run(tree);
  assert.equal(div.attributes?.filter((a) => a.name === 'data-eq-md').length, 1);
});

test('markdown inside a Tabs container is the page talking', () => {
  const heading = element('h3');
  const tabs = jsx('Tabs', [jsx('TabItem', [heading])]);
  run(tabs);
  assert.equal(marked(heading), true);
});

test('a Tabs container tag never takes the marker itself', () => {
  const tabs = jsx('Tabs', [jsx('TabItem')]);
  run(tabs);
  assert.equal(marked(tabs), false);
  assert.equal(marked(tabs.children?.[0] as TestNode), false);
});

test('a component inside a TabItem is still a boundary', () => {
  const inner = element('span');
  const tabs = jsx('Tabs', [jsx('TabItem', [jsx('Badge', [inner])])]);
  run(tabs);
  assert.equal(marked(inner), false);
});
