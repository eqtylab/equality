/**
 * Runs `docs({ plugins })`.
 *
 * A plugin executes at config time, inside `astro:config:setup`, so through the raw Astro
 * params it can inject routes, add Vite plugins and watch files. Its sidebar groups ride into
 * the runtime config's `sidebar.extra`. MDX components are named by module specifier rather
 * than passed as objects: the runtime loads from node_modules through a virtual module, which
 * can carry an import path but not a component instance.
 */
import type { DocsPlugin, DocsPluginContext, NavNode } from '../types.ts';

export interface PluginContributions {
  navGroups: NavNode[];
  /** MDX component name -> module specifier whose default export is the component. */
  componentModules: Record<string, string>;
}

/** Fails loudly on a malformed entry: a plugin that silently does nothing is the worst outcome. */
export function assertPlugins(value: unknown): DocsPlugin[] {
  if (!Array.isArray(value)) throw new Error('[@eqtylab/docs] `plugins` must be an array.');
  return value.map((entry, index) => {
    const plugin = entry as Partial<DocsPlugin> | null;
    if (!plugin || typeof plugin.name !== 'string' || typeof plugin.setup !== 'function') {
      throw new Error(`[@eqtylab/docs] plugins[${index}] must be { name: string, setup(ctx) }.`);
    }
    return plugin as DocsPlugin;
  });
}

export async function runPlugins(
  plugins: DocsPlugin[],
  astro: unknown,
  logger?: { info(message: string): void }
): Promise<PluginContributions> {
  const navGroups: NavNode[] = [];
  const componentModules: Record<string, string> = {};

  for (const plugin of plugins) {
    const ctx: DocsPluginContext = {
      addNavGroup(group) {
        navGroups.push(group);
      },
      addMdxComponents(map) {
        for (const [name, specifier] of Object.entries(map)) {
          if (typeof specifier !== 'string') {
            throw new Error(
              `[@eqtylab/docs] plugin "${plugin.name}": component "${name}" must be a module ` +
                `specifier string; the runtime imports it, so a component object cannot be passed.`
            );
          }
          componentModules[name] = specifier;
        }
      },
      astro,
    };
    await plugin.setup(ctx);
    logger?.info(`plugin ${plugin.name} registered`);
  }

  return { navGroups, componentModules };
}

/** Source of `virtual:eqty-docs/plugin-components`: one default import per contributed name. */
export function pluginComponentsSource(componentModules: Record<string, string>): string {
  const entries = Object.entries(componentModules);
  const imports = entries.map(
    ([, specifier], i) => `import C${i} from ${JSON.stringify(specifier)};`
  );
  const map = entries.map(([name], i) => `  ${JSON.stringify(name)}: C${i},`);
  return [...imports, 'export default {', ...map, '};', ''].join('\n');
}
