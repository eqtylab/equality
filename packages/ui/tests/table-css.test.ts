import { readFile } from 'node:fs/promises';
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

  it('highlights a hovered clickable row wherever the pointer is on it', () => {
    expect(ruleBody(css, ".table-row--clickable:not([data-state='selected']):hover")).toMatch(
      /background-color:\s*var\(--color-list-item-hover\)/
    );
    expect(css).not.toContain(':has(button:hover');
  });

  it('names one row line colour: the border at 60%', async () => {
    const decisions = await readFile('src/theme/theme-decisions.css', 'utf8');
    expect(decisions).toMatch(
      /--eq-row-divider-color:\s*color-mix\(in oklab, var\(--color-border\) 60%, transparent\);/
    );
  });

  it('draws a line inside each body row but the last, so the row stays its height', () => {
    expect(ruleBody(css, '.table-body > .table-row')).toMatch(/position:\s*relative;/);
    const line = ruleBody(css, '.table-body > .table-row:not(:last-child)::after');
    expect(line).toMatch(/border-bottom:\s*1px solid var\(--eq-row-divider-color\);/);
    expect(line).toMatch(/position:\s*absolute;/);
    expect(line).not.toMatch(/background-color/);
  });

  it('stripes no rows unless the table asks', () => {
    expect(css).not.toMatch(/(^|\n)\.table-body \.table-row:nth-child\(even\)/);
  });

  it('lets a selected row in a striped table show over its stripe', () => {
    const selected = ".table-body .table-row--clickable[data-state='selected']";
    const stripe = css.indexOf('.table--striped > .table-inner');
    expect(stripe).toBeGreaterThan(-1);
    expect(css.indexOf(selected)).toBeGreaterThan(stripe);
  });

  it('brings back the stripes, and drops the lines, on a striped table', () => {
    expect(
      ruleBody(
        css,
        '.table--striped > .table-inner > .table-body > :where(.table-row:nth-child(even))'
      )
    ).toMatch(
      /background-color:\s*color-mix\(in oklch, var\(--color-text-primary\) 3%, transparent\);/
    );
    expect(css).toMatch(
      /@media not \(forced-colors: active\)\s*\{\s*\.table--striped > \.table-inner > \.table-body > \.table-row::after\s*\{\s*content:\s*none;/
    );
  });

  it('keeps striped rules off a table nested inside a striped one', () => {
    expect(css).not.toMatch(/\.table--striped \.table-body/);
  });

  it('draws the header line inside its row, so the header stays its height', () => {
    expect(ruleBody(css, '.table-header')).not.toMatch(/border-bottom-width/);
    expect(ruleBody(css, '.table-header > .table-row')).toMatch(/position:\s*relative;/);
    expect(ruleBody(css, '.table-header > .table-row::after')).toMatch(
      /border-bottom:\s*1px solid var\(--color-border\);/
    );
  });

  it('keeps no border rule for body rows, which draw no border', () => {
    expect(ruleBody(css, '.table-body')).not.toMatch(/last-child/);
  });
});
