import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { compileCss } from './compile-css';

const ROWS = [
  'src/components/table/table-components.module.css',
  'src/components/dropdown-menu/dropdown-menu.module.css',
  'src/components/select/select.module.css',
  'src/components/command/command.module.css',
];

describe('a row', () => {
  it.each(ROWS)(
    'pulls nothing it holds into its padding in %s, so a cell that hides overflow cuts nothing',
    async (file) => {
      const css = await compileCss(file);
      expect(css).not.toContain('[data-avatar');
      expect(css).not.toContain('[data-icon-button');
    },
    30_000
  );

  it('leaves no overhang utility behind', async () => {
    expect(await readFile('src/theme/theme-utilities.css', 'utf8')).not.toContain(
      'control-row-overhang'
    );
  });
});
