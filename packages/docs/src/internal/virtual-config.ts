/**
 * Serves the resolved config to runtime components as `virtual:eqty-docs/config`.
 *
 * Runtime components ship from node_modules and so cannot reach the consumer's
 * project by relative path. A virtual module is the clean way across that gap.
 */
import type { Plugin } from 'vite';

const MODULE_ID = 'virtual:eqty-docs/config';
const RESOLVED_ID = '\0' + MODULE_ID;

export function virtualConfigPlugin(getPayload: () => Record<string, unknown>): Plugin {
  return {
    name: 'eqty-docs:virtual-config',
    resolveId(id) {
      return id === MODULE_ID ? RESOLVED_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_ID) return null;
      return `export default ${JSON.stringify(getPayload())};`;
    },
  };
}
