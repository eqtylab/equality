import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/select/select.module.css');
}, 30_000);

describe('select.module.css', () => {
  it('draws an inline trigger with no box, in the surrounding font and line of text', () => {
    const body = ruleBody(css, '.select-trigger--inline');
    expect(body).toMatch(/display:\s*inline-flex;/);
    expect(body).toMatch(/height:\s*auto;/);
    expect(body).toMatch(/width:\s*auto;/);
    expect(body).toMatch(/justify-content:\s*flex-start;/);
    expect(body).toMatch(/border-style:\s*var\(--tw-border-style\);\s*border-width:\s*0px;/);
    expect(body).toMatch(/background-color:\s*transparent;/);
    expect(body).toMatch(/padding:\s*calc\(0\.25rem \* 0\);/);
    expect(body).toMatch(/font-size:\s*inherit;/);
    expect(body).toMatch(/line-height:\s*inherit;/);
  });

  it('comes after the base trigger rule, so it wins at the same specificity', () => {
    expect(css.indexOf('.select-trigger--inline {')).toBeGreaterThan(
      css.indexOf('.select-trigger {')
    );
  });

  it('pins a trigger-width list to exactly its trigger', () => {
    expect(ruleBody(css, '.select-content--trigger-width')).toMatch(
      /width:\s*var\(--radix-select-trigger-width\);/
    );
  });
});
