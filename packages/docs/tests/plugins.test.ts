import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assertPlugins, pluginComponentsSource, runPlugins } from '../src/internal/run-plugins.ts';
import type { DocsPlugin, NavNode } from '../src/types.ts';

const group: NavNode = { kind: 'group', name: 'api', label: 'API', children: [] };

test('a plugin receives the raw astro params and its contributions are collected', async () => {
  const seen: unknown[] = [];
  const plugin: DocsPlugin = {
    name: 'test',
    setup(ctx) {
      seen.push(ctx.astro);
      ctx.addNavGroup(group);
      ctx.addMdxComponents({ Endpoint: '/abs/Endpoint.astro' });
    },
  };
  const astro = { injectRoute() {} };
  const logged: string[] = [];

  const result = await runPlugins([plugin], astro, { info: (m) => logged.push(m) });

  assert.deepEqual(seen, [astro]);
  assert.deepEqual(result.navGroups, [group]);
  assert.deepEqual(result.componentModules, { Endpoint: '/abs/Endpoint.astro' });
  assert.deepEqual(logged, ['plugin test registered']);
});

test('plugins run in order and a later plugin can replace a component name', async () => {
  const order: string[] = [];
  const plugins: DocsPlugin[] = [
    {
      name: 'a',
      async setup(ctx) {
        order.push('a');
        ctx.addMdxComponents({ Shared: 'a/Shared.astro' });
      },
    },
    {
      name: 'b',
      setup(ctx) {
        order.push('b');
        ctx.addMdxComponents({ Shared: 'b/Shared.astro' });
      },
    },
  ];
  const result = await runPlugins(plugins, {});
  assert.deepEqual(order, ['a', 'b']);
  assert.deepEqual(result.componentModules, { Shared: 'b/Shared.astro' });
});

test('a component object cannot be passed; the runtime needs a specifier to import', async () => {
  const plugin: DocsPlugin = {
    name: 'bad',
    setup(ctx) {
      ctx.addMdxComponents({ Thing: {} as never });
    },
  };
  await assert.rejects(runPlugins([plugin], {}), /component "Thing" must be a module specifier/);
});

test('a malformed plugin entry fails at config time, naming its index', () => {
  assert.throws(() => assertPlugins([{ name: 'x' }]), /plugins\[0\] must be/);
  assert.throws(() => assertPlugins('nope'), /must be an array/);
  assert.equal(assertPlugins([]).length, 0);
});

test('the virtual module imports each component and exports the map', () => {
  const source = pluginComponentsSource({ Endpoint: '/abs/Endpoint.astro', Alert: '@x/alert' });
  assert.match(source, /import C0 from "\/abs\/Endpoint\.astro";/);
  assert.match(source, /import C1 from "@x\/alert";/);
  assert.match(source, /"Endpoint": C0,/);
  assert.match(source, /"Alert": C1,/);
  assert.equal(pluginComponentsSource({}), 'export default {\n};\n');
});
