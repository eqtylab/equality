/** Serves the resolved config to runtime components, which ship from node_modules and cannot reach the consumer's project by path. */
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
