import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/table/table-components.module.css');
}, 30_000);

describe('table-components.module.css', () => {
  it('draws a focused linked row in the focus-ring colour', () => {
    expect(ruleBody(css, '.table-row--linked:has(.table-row-link:focus-visible)')).toMatch(
      /outline-color:\s*var\(--color-focus-ring\b/
    );
  });

  it("draws no outline on the row's stretched link, so focus shows as one line", () => {
    expect(ruleBody(css, '.table-row-link')).toMatch(/outline-style:\s*none;/);
  });
});
