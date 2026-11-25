import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let titleBlock: string;
let icon: string;
let metricCard: string;

beforeAll(async () => {
  [titleBlock, icon, metricCard] = await Promise.all([
    compileCss('src/components/title-block/title-block.module.css'),
    compileCss('src/components/icon/icon.module.css'),
    compileCss('src/components/metric-card/metric-card.module.css'),
  ]);
}, 30_000);

const weight = (selector: string) =>
  (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!not|is|where)[\w-]+/g) ?? []).length;

const rules = (css: string) =>
  [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/^([^@\s{}][^{}]*)\{([^{}]*)\}/gm)].flatMap(
    ([, selectors, body]) =>
      selectors.split(',').map((selector) => ({ selector: selector.trim(), body }))
  );

// The heaviest Icon rule that sets a property, which a mark has to out-rank
const iconWeight = (property: RegExp) =>
  Math.max(
    ...rules(icon)
      .filter((rule) => property.test(rule.body))
      .map((rule) => weight(rule.selector))
  );

describe('TitleBlockMark', () => {
  it('sizes a mark 28, 36 and 44 by its block', async () => {
    const options = await readFile('src/theme/theme-options.css', 'utf8');
    for (const [size, units] of [
      ['sm', 7],
      ['md', 9],
      ['lg', 11],
    ] as const) {
      expect(options).toMatch(new RegExp(`--eq-size-${size}:\\s*--spacing\\(${units}\\);`));
      const body = ruleBody(titleBlock, `.mark.mark.mark-${size}`);
      expect(body).toMatch(new RegExp(`width:\\s*var\\(--eq-size-${size}\\);`));
      expect(body).toMatch(new RegExp(`height:\\s*var\\(--eq-size-${size}\\);`));
    }
  });

  it("out-ranks Icon's padding, size, radius and glyph rules", () => {
    expect(ruleBody(titleBlock, '.mark.mark.mark.mark')).toMatch(
      /padding:\s*calc\(0\.25rem \* 0\);/
    );
    expect(weight('.mark.mark.mark.mark')).toBeGreaterThan(iconWeight(/padding:/));
    expect(weight('.mark.mark.mark-sm')).toBeGreaterThan(
      iconWeight(/(width|height|border-radius):/)
    );
    expect(weight('.mark.mark.mark-sm > *')).toBeGreaterThan(iconWeight(/width:/));
  });

  it('rounds a round mark after its size sets the corner, so the circle wins', () => {
    expect(ruleBody(titleBlock, '.mark.mark.mark-round')).toMatch(
      /border-radius:\s*calc\(infinity \* 1px\);/
    );
    expect(titleBlock.indexOf('.mark.mark.mark-round {')).toBeGreaterThan(
      titleBlock.indexOf('.mark.mark.mark-lg {')
    );
  });
});

describe('TitleBlock sizes', () => {
  it("reach only the block's own parts, so a block nested in another keeps its own size", () => {
    const sized = rules(titleBlock).filter(({ selector }) => /^\.size-/.test(selector));
    expect(sized.length).toBeGreaterThan(10);
    for (const { selector } of sized) {
      const parts = selector.replace(/\s*>\s*/g, '>').replace(/\([^)]*\)/g, '()');
      expect(parts, selector).not.toMatch(/\s/);
    }
  });
});

describe('MetricCard', () => {
  it("draws its icon as a 36 circle with a 16 glyph, over Icon's own sizes", () => {
    const circle = ruleBody(metricCard, '.icon.icon.icon.icon');
    expect(circle).toMatch(/width:\s*var\(--eq-control-md-height\);/);
    expect(circle).toMatch(/padding:\s*calc\(0\.25rem \* 0\);/);
    expect(ruleBody(metricCard, '.icon.icon.icon > *')).toMatch(
      /width:\s*var\(--eq-control-md-icon-size\);/
    );
    expect(weight('.icon.icon.icon.icon')).toBeGreaterThan(iconWeight(/padding:/));
    expect(weight('.icon.icon.icon > *')).toBeGreaterThan(iconWeight(/width:/));
  });
});
