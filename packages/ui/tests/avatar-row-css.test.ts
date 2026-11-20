import { describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

const OVERHANG =
  /margin-block:\s*calc\(\(var\(--eq-control-md-line-height\)\s*-\s*[^;]+\)\s*\/\s*2\);/;

const ROWS: Record<string, string[]> = {
  'src/components/table/table-components.module.css': ['.table-cell'],
  'src/components/dropdown-menu/dropdown-menu.module.css': [
    '.dropdown-menu-trigger',
    '.dropdown-menu-item',
    '.dropdown-menu-checkbox-item',
    '.dropdown-menu-radio-item',
  ],
  'src/components/select/select.module.css': ['.select-item'],
  'src/components/command/command.module.css': ['.command-item'],
};

describe('a default avatar in a row', () => {
  it.each(Object.entries(ROWS))(
    'overhangs into the row padding in %s',
    async (file, rows) => {
      const css = await compileCss(file);
      const selector = rows.map((row) => `${row} [data-avatar='md']`).join(',\n');
      expect(ruleBody(css, selector)).toMatch(OVERHANG);
    },
    30_000
  );
});
