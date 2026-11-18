import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/button/button.module.css');
}, 30_000);

describe('button.module.css', () => {
  it('draws a field button with the input’s border and background, full width, its label at the start', () => {
    const body = ruleBody(css, '.button--field');
    expect(body).toMatch(/border-color:\s*var\(--color-border\b/);
    expect(body).toMatch(/background-color:\s*var\(--color-background\b/);
    expect(body).toMatch(/width:\s*100%;/);
    expect(body).toMatch(/justify-content:\s*space-between;/);
    expect(body).toMatch(/font-weight:\s*400;/);
  });

  it('comes after the base rule, so it wins at the same specificity', () => {
    expect(css.indexOf('.button--field {')).toBeGreaterThan(css.indexOf('.button {'));
  });
});
