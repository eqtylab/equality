import { readFile } from 'node:fs/promises';
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

  it("hides the row line while a row shows its focus ring, so the ring's edge stays solid", () => {
    const hide =
      '.table-row--linked:has(:is(.table-row-link, .table-row-action):focus-visible)::after,\n.table-row--clickable[data-table-row-focusable]:focus-visible::after';
    expect(ruleBody(css, hide)).toMatch(/content:\s*none;/);
    expect(css.indexOf(`${hide} {`)).toBeGreaterThan(
      css.indexOf('.table-body > .table-row:not(:last-child)::after {')
    );
  });

  it('fills no rows: a line between them is the only row style', () => {
    expect(css).not.toMatch(/nth-child/);
    expect(css).not.toMatch(/table--striped/);
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

  const CELL_PADDING = (row: string, part: string) =>
    new RegExp(
      String.raw`--eq-table-cell-padding:\s*calc\(\(var\(--eq-control-${row}-height\)\s*-\s*var\(--eq-${part}\)\)\s*/\s*2\);`
    );

  const BUTTONS = "button, [role='button'], [data-slot='button'], [data-slot='icon-button']";
  const COMFORTABLE = '.table--comfortable > .table-inner >';
  const CELLS = ':is(.table-cell, .table-head)';
  const flatten = (text: string) =>
    text
      .replace(/\n\s+(?=[>[:\w)])/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/,?\s+\)/g, ')');

  it('pads every cell for a line of text, whatever it holds', () => {
    const row = ruleBody(css, '\n.table-row');
    expect(row).toMatch(/min-height:\s*var\(--eq-control-md-height\);/);
    expect(row).not.toMatch(/padding-block/);
    expect(ruleBody(flatten(css), CELLS)).toMatch(CELL_PADDING('md', 'type-body-line-height'));
    expect(css).not.toMatch(/\.table-(cell|head)[^{]*:has\(\s*>\s*:is\(button/);
  });

  it('pulls a button or a small title block at any depth in a cell into its padding, outside the layer, but not a switch, checkbox, radio or tab, or a button inside an excluded component within that cell', () => {
    const squash = (text: string) =>
      text.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/,? \)/g, ')');
    const flat = squash(css);
    const excluded = [
      'title-block',
      'empty-table-state',
      'segmented-controls',
      'pagination',
      'code-block',
      'motion-collapsible',
      'truncated-description',
    ]
      .map((slot) => `[data-slot='${slot}']`)
      .join(', ');
    const selector = `${CELLS} :is(${BUTTONS}, [data-slot='title-block'][data-size='sm']):not([role='switch'], [role='checkbox'], [role='radio'], [role='tab'], [data-sort-button], [data-table-row-action], ${CELLS} :is(${excluded}) *:not(${CELLS} :is(${excluded}) ${CELLS} *))`;
    expect(ruleBody(flat, selector)).toMatch(
      /margin-block: calc\(\(var\(--eq-control-sm-height\) - var\(--eq-type-body-line-height\)\) \/ 2 - var\(--eq-table-cell-padding\)\);/
    );
    const layer = flat.slice(flat.indexOf('@layer components {'), flat.indexOf(selector));
    expect(layer.split('{').length).toBe(layer.split('}').length);
  });

  it('pads a header or comfortable cell holding a switch, segmented control or a button the pull skips as a small control, as 6.5.0 did', () => {
    const flat = flatten(css);
    const held =
      "[role='switch'], [data-slot='segmented-controls'], :is([data-slot='pagination'], [data-slot='code-block'], [data-slot='motion-collapsible'], [data-slot='empty-table-state'], [data-slot='truncated-description']) :is(button, [role='button'])";
    const holds = `:has(${held}):not(:has(.table-inner :is(${held})))`;
    expect(ruleBody(flat, `.table-header > .table-row > .table-head${holds}`)).toMatch(
      CELL_PADDING('md', 'control-sm-height')
    );
    expect(ruleBody(flat, `${COMFORTABLE} * > .table-row > ${CELLS}${holds}`)).toMatch(
      CELL_PADDING('lg', 'control-sm-height')
    );
  });

  it('keeps a small button 4 inside a cell whatever --eq-table-cell-padding an app sets', () => {
    const flat = flatten(css);
    const margin = flat.slice(flat.indexOf('margin-block: calc(') + 'margin-block: '.length);
    const expression = margin.slice(0, margin.indexOf(';'));
    for (const padding of [4, 2, 8, 12]) {
      const value = expression
        .replace(/var\(--eq-control-sm-height\)/g, '28')
        .replace(/var\(--eq-type-body-line-height\)/g, '20')
        .replace(/var\(--eq-table-cell-padding\)/g, String(padding))
        .replace(/calc\(/g, '(');
      expect(value, expression).toMatch(/^[\d\s()+\-*/.]+$/);
      expect(padding + Number(new Function(`return ${value}`)())).toBe(4);
    }
  });

  it('pads a row at its sides by --eq-table-row-padding-inline, 16 unless an app sets it', () => {
    expect(ruleBody(css, '\n.table-row')).toMatch(
      /padding-inline:\s*var\(--eq-table-row-padding-inline,\s*calc\(0\.25rem \* 4\)\);/
    );
  });

  it('registers --eq-table-cell-padding as a length, so a bare 0 keeps the pull valid', () => {
    expect(ruleBody(css, '@property --eq-table-cell-padding')).toMatch(
      /syntax:\s*'<length>';\s*inherits:\s*true;\s*initial-value:\s*0px;/
    );
  });

  it('pads a header or comfortable cell by the size of a button the pull skips, as 6.5.0 did', () => {
    const flat = flatten(css);
    const excluded =
      "[data-slot='pagination'], [data-slot='code-block'], [data-slot='motion-collapsible'], [data-slot='empty-table-state'], [data-slot='truncated-description']";
    const held = `[role='switch'], [data-slot='segmented-controls'], :is(${excluded}) :is(button, [role='button'])`;
    const guard = `:not(:has(.table-inner :is(${held})))`;
    expect(
      ruleBody(
        flat,
        `.table-header > .table-row > .table-head:has(:is(${excluded}) :is([data-button='md'], [data-button='lg']))${guard}`
      )
    ).toMatch(/--eq-table-cell-padding:\s*0px;/);
    expect(
      ruleBody(
        flat,
        `${COMFORTABLE} * > .table-row > ${CELLS}:has(:is(${excluded}) [data-button='md'])${guard}`
      )
    ).toMatch(CELL_PADDING('lg', 'control-md-height'));
    expect(
      ruleBody(
        flat,
        `${COMFORTABLE} * > .table-row > ${CELLS}:has(:is(${excluded}) [data-button='lg'])${guard}`
      )
    ).toMatch(/--eq-table-cell-padding:\s*0px;/);
  });

  it("pads cells in a layer, so an app's padding utilities on a cell still win", () => {
    expect(flatten(css)).toMatch(/@layer components \{\s*:is\(\.table-cell, \.table-head\) \{/);
    expect(ruleBody(css, '\n.table-cell')).not.toMatch(/padding-block/);
    expect(ruleBody(css, '\n.table-head')).not.toMatch(/padding-block/);
  });

  it('makes body and footer rows the large control height in a comfortable table', () => {
    const selector =
      '.table--comfortable > .table-inner > .table-body > .table-row,\n.table--comfortable > .table-inner > .table-footer > .table-row';
    const body = ruleBody(css, selector);
    expect(body).toMatch(/min-height:\s*var\(--eq-control-lg-height\);/);
    expect(body).not.toMatch(/padding-block/);
  });

  it('pads a comfortable cell for a line of text', () => {
    expect(ruleBody(flatten(css), `${COMFORTABLE} * > .table-row > ${CELLS}`)).toMatch(
      CELL_PADDING('lg', 'type-body-line-height')
    );
  });

  it('makes the header row the large control height in a comfortable table', () => {
    expect(ruleBody(css, `${COMFORTABLE} .table-header > .table-row > .table-head`)).toMatch(
      /height:\s*var\(--eq-control-lg-height\);/
    );
  });

  it('pads a comfortable cell holding a medium title block 8, so a person row is 52 at either density', () => {
    const TB = "[data-slot='title-block'][data-size='md']";
    const selector = `${COMFORTABLE} * > .table-row > ${CELLS}:has(${TB}):not(:has(.table-inner ${TB}))`;
    expect(ruleBody(flatten(css), selector)).toMatch(CELL_PADDING('md', 'type-body-line-height'));
  });

  it('lets every row grow with what it holds', () => {
    const rowRules = [...css.matchAll(/([^{}]*\.table-row(?![\w-])[^{}]*)\{([^{}]*)\}/g)];
    expect(rowRules.length).toBeGreaterThan(0);
    for (const [, selector, body] of rowRules) {
      if (/\.table-head\b|\.table-cell\b|::after/.test(selector)) continue;
      expect(body, selector).not.toMatch(/(^|[^-])height:/);
    }
  });

  it('keeps the selected row on comfortable rows, which share its selector', () => {
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
