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

  it('overhangs a small icon button into the row padding', () => {
    expect(ruleBody(css, ".table-cell [data-icon-button='sm']")).toMatch(
      /margin-block:\s*calc\(0\.25rem \* -1\);/
    );
  });

  it('names one row line colour: the border at 60%', async () => {
    const decisions = await readFile('src/theme/theme-decisions.css', 'utf8');
    expect(decisions).toMatch(
      /--eq-table-row-divider-color:\s*color-mix\(in oklab, var\(--color-border\) 60%, transparent\);/
    );
  });

  it('draws a line inside each body row but the last, so the row stays its height', () => {
    expect(ruleBody(css, '.table-body > .table-row')).toMatch(/position:\s*relative;/);
    const line = ruleBody(css, '.table-body > .table-row:not(:last-child)::after');
    expect(line).toMatch(/border-bottom:\s*1px solid var\(--eq-table-row-divider-color\);/);
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

  const ROW_PADDING = (row: string) =>
    new RegExp(
      String.raw`padding-block:\s*calc\(\(var\(--eq-control-${row}-height\)\s*-\s*var\(--eq-control-sm-height\)\)\s*/\s*2\);`
    );

  const CELL_PADDING = (row: string, part: string) =>
    new RegExp(
      String.raw`padding-block:\s*calc\(\(var\(--eq-control-${row}-height\)\s*-\s*var\(--eq-${part}\)\)\s*/\s*2\);`
    );

  const BUTTON = ":has(button, [role='button'], [data-icon-button])";
  const COMFORTABLE = '.table--comfortable > .table-inner >';
  const COMFORTABLE_CELLS = (suffix = '') =>
    `${COMFORTABLE} :is(.table-body, .table-footer) > .table-row > :is(.table-cell, .table-head)${suffix}`;
  const flatten = (text: string) => text.replace(/\n\s+(?=[>[:])/g, ' ');

  it('makes body and footer rows the large control height in a comfortable table', () => {
    const selector =
      '.table--comfortable > .table-inner > .table-body > .table-row,\n.table--comfortable > .table-inner > .table-footer > .table-row';
    const body = ruleBody(css, selector);
    expect(body).toMatch(/min-height:\s*var\(--eq-control-lg-height\);/);
    expect(body).toMatch(/padding-block:\s*calc\(0\.25rem \* 0\);/);
  });

  it('pads a comfortable cell of text to the row, and one holding a button to a small control', () => {
    const flat = flatten(css);
    expect(ruleBody(flat, COMFORTABLE_CELLS())).toMatch(
      CELL_PADDING('lg', 'type-body-line-height')
    );
    expect(ruleBody(flat, COMFORTABLE_CELLS(BUTTON))).toMatch(ROW_PADDING('lg'));
  });

  it('pulls no icon button into a comfortable cell, however deep it sits', () => {
    expect(
      ruleBody(
        flatten(css),
        `${COMFORTABLE} :is(.table-body, .table-footer) > .table-row > .table-cell [data-icon-button='sm']`
      )
    ).toMatch(/margin-block:\s*calc\(0\.25rem \* 0\);/);
  });

  it('makes the header row the large control height in a comfortable table', () => {
    const flat = flatten(css);
    const head = ruleBody(flat, `${COMFORTABLE} .table-header > .table-row > .table-head`);
    expect(head).toMatch(/height:\s*var\(--eq-control-lg-height\);/);
    expect(head).toMatch(CELL_PADDING('lg', 'type-body-line-height'));
    expect(
      ruleBody(flat, `${COMFORTABLE} .table-header > .table-row > .table-head${BUTTON}`)
    ).toMatch(ROW_PADDING('lg'));
  });

  it('pads a regular header cell, so wrapped header text is not flush', () => {
    expect(ruleBody(css, '.table-header > .table-row > .table-head')).toMatch(
      CELL_PADDING('md', 'type-body-line-height')
    );
    expect(ruleBody(css, `.table-header > .table-row > .table-head${BUTTON}`)).toMatch(
      ROW_PADDING('md')
    );
  });

  it('lets every row grow with what it holds', () => {
    const rowRules = [...css.matchAll(/([^{}]*\.table-row(?![\w-])[^{}]*)\{([^{}]*)\}/g)];
    expect(rowRules.length).toBeGreaterThan(0);
    for (const [, selector, body] of rowRules) {
      if (/\.table-head\b|\.table-cell\b|::after/.test(selector)) continue;
      expect(body, selector).not.toMatch(/(^|[^-])height:/);
    }
  });

  it('keeps stripes and the selected row on comfortable rows, which share their selectors', () => {
    expect(css).not.toMatch(/\.table--comfortable[^{]*nth-child/);
    expect(css).not.toMatch(/\.table--comfortable[^{]*data-state/);
    expect(css).not.toMatch(/\.table--comfortable[^{]*background/);
    const comfortable = ruleBody(
      css,
      '.table--comfortable > .table-inner > .table-body > .table-row,\n.table--comfortable > .table-inner > .table-footer > .table-row'
    );
    expect(comfortable).not.toMatch(/background|margin/);
  });

  it('lets the header row grow when its text wraps', () => {
    const headerRules = [
      ...css.matchAll(/([^{}]*\.table-(?:header|head)(?![\w-])[^{}]*)\{([^{}]*)\}/g),
    ];
    expect(headerRules.length).toBeGreaterThan(0);
    for (const [, selector, body] of headerRules) {
      expect(body, selector).not.toMatch(/(^|[^-])height:/);
    }
    expect(ruleBody(css, '\n.table-head')).toMatch(/min-height:\s*var\(--eq-control-md-height\);/);
  });
});
