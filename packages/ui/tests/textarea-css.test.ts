import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/textarea/textarea.module.css');
}, 30_000);

describe('textarea.module.css', () => {
  it('draws a bare textarea with no border, background or radius', () => {
    const body = ruleBody(css, '.textarea--bare');
    expect(body).toMatch(/border-width:\s*0px;/);
    expect(body).toMatch(/background-color:\s*transparent;/);
    expect(body).toMatch(/border-radius:\s*0;/);
  });

  it('drops the focus ring and its offset, which would otherwise still draw a 2px ring', () => {
    const body = ruleBody(css, '.textarea--bare');
    expect(body).toMatch(/&:focus-visible\s*\{\s*--tw-ring-shadow:[^;]*calc\(0px \+/);
    expect(body).toMatch(/&:focus-visible\s*\{\s*--tw-ring-offset-width:\s*0px;/);
  });

  it('comes after the base rule, so it wins at the same specificity', () => {
    expect(css.indexOf('.textarea--bare {')).toBeGreaterThan(css.indexOf('.textarea {'));
  });
});
