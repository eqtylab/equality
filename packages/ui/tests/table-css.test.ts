import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/table/table-components.module.css');
}, 30_000);

describe('table-components.module.css', () => {
  it('draws a focused linked row in the focus-ring colour', () => {
    expect(
      ruleBody(css, '.table-row--linked:has(:is(.table-row-link, .table-row-action):focus-visible)')
    ).toMatch(/outline-color:\s*var\(--color-focus-ring\b/);
  });

  it('draws a focused clickable row in the focus-ring colour', () => {
    expect(ruleBody(css, '.table-row--clickable[data-table-row-focusable]:focus-visible')).toMatch(
      /outline-color:\s*var\(--color-focus-ring\b/
    );
  });

  it("draws no outline on the row's stretched link, so focus shows as one line", () => {
    expect(ruleBody(css, '.table-row-link')).toMatch(/outline-style:\s*none;/);
  });

  it('highlights a hovered clickable row wherever the pointer is on it', () => {
    expect(ruleBody(css, ".table-row--clickable:not([data-state='selected']):hover")).toMatch(
      /background-color:\s*var\(--color-list-item-hover\)/
    );
    expect(css).not.toContain(':has(button:hover');
  });

  it("stretches a row's action over the whole row", () => {
    expect(ruleBody(css, '.table-row-action::after')).toMatch(/inset:\s*calc\(0\.25rem \* 0\);/);
  });

  it("draws no outline on the row's action, so focus shows as one line", () => {
    expect(ruleBody(css, '.table-row-action')).toMatch(/outline-style:\s*none;/);
  });

  it('highlights a selected row whether or not it is clickable', () => {
    expect(ruleBody(css, ".table-body .table-row[data-state='selected']")).toMatch(
      /background-color:\s*var\(--color-list-item-current\b/
    );
  });

  it('overhangs a small icon button into the row padding', () => {
    expect(ruleBody(css, ".table-cell [data-icon-button='sm']")).toMatch(
      /margin-block:\s*calc\(0\.25rem \* -1\);/
    );
  });
});
