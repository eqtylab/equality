import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/card/card.module.css');
}, 30_000);

const after = (selector: string, earlier: string) =>
  expect(css.indexOf(`${selector} {`)).toBeGreaterThan(css.indexOf(`${earlier} {`));

describe('card.module.css', () => {
  it('fills a selected card with the current-item colour and a primary border', () => {
    const body = ruleBody(css, '.card--selected');
    expect(body).toMatch(/border-color:\s*var\(--color-text-primary\b/);
    expect(body).toMatch(/background-color:\s*var\(--color-list-item-current\b/);
  });

  it('keeps a selected card filled while it is pressed, not the choice hover', () => {
    expect(ruleBody(css, '.card--selected')).toMatch(
      /&:active\s*\{\s*background-color:\s*var\(--color-list-item-current\b/
    );
  });

  it('tints a status card with its badge colour', () => {
    expect(ruleBody(css, '.card--success')).toMatch(
      /border-color:\s*var\(--color-badge-background-success\b/
    );
  });

  it('comes after the elevations, so selection and status win at the same specificity', () => {
    for (const rule of ['.card--choice', '.card--selected', '.card--danger']) {
      after(rule, '.card--overlay');
    }
  });
});
