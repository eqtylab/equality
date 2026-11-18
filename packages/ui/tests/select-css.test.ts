import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/select/select.module.css');
}, 30_000);

// A zero length however Tailwind writes it: 0, 0px or calc(0.25rem * 0)
const ZERO = String.raw`(?:0(?:px)?|calc\([^)]*\*\s*0\))`;

describe('select.module.css', () => {
  it('draws an inline trigger with no box, in the surrounding font and line of text', () => {
    const body = ruleBody(css, '.select-trigger--inline');
    expect(body).toMatch(/display:\s*inline-flex;/);
    expect(body).toMatch(/height:\s*auto;/);
    expect(body).toMatch(/width:\s*auto;/);
    expect(body).toMatch(/justify-content:\s*flex-start;/);
    expect(body).toMatch(new RegExp(String.raw`border-width:\s*${ZERO};`));
    expect(body).toMatch(/background-color:\s*transparent;/);
    expect(body).toMatch(new RegExp(String.raw`padding:\s*${ZERO};`));
    expect(body).toMatch(/font-size:\s*inherit;/);
    expect(body).toMatch(/line-height:\s*inherit;/);
  });

  it('pads an inline value so descenders clear its one-line clamp, at the line height', () => {
    const body = ruleBody(css, '.select-trigger--inline');
    expect(body).toMatch(/&\s*>\s*span\s*\{[^}]*margin-block:\s*calc\(0\.05em \* -1\);/);
    expect(body).toMatch(/&\s*>\s*span\s*\{[^}]*padding-block:\s*0\.05em;/);
  });

  it('sizes an inline chevron to the surrounding font', () => {
    const body = ruleBody(css, '.select-trigger--inline .select-icon');
    expect(body).toMatch(/width:\s*0\.75em;/);
    expect(body).toMatch(/height:\s*0\.75em;/);
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
