import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/pagination/pagination.module.css');
}, 30_000);

describe('pagination.module.css', () => {
  it('is a full-width container its narrow layout measures', () => {
    const body = ruleBody(css, '.pagination');
    expect(body).toMatch(/container-type:\s*inline-size;/);
    expect(body).toMatch(/container-name:\s*pagination;/);
    expect(body).toMatch(/width:\s*100%;/);
  });

  it('wraps the page buttons under the info line when the two do not fit, still on the right', () => {
    expect(ruleBody(css, '.pagination')).toMatch(/flex-wrap:\s*wrap;/);
    expect(ruleBody(css, '.page-navigation-container')).toMatch(/margin-left:\s*auto;/);
  });

  it('hides the spoken count visually', () => {
    expect(ruleBody(css, '.spoken-count')).toMatch(/clip-path:\s*inset\(50%\);|clip:\s*rect/);
  });

  it("hides the wide-only parts below 42rem, over a Button's own display", () => {
    expect(ruleBody(css, '.wide-only.wide-only')).toMatch(
      /@container pagination \(width < 42rem\)\s*\{\s*display:\s*none;/
    );
  });

  it('hides "per page" below 42rem', () => {
    expect(ruleBody(css, '.page-size-label')).toMatch(
      /^\s*@container pagination \(width < 42rem\)\s*\{\s*display:\s*none;/
    );
  });

  it.each([
    ['.page-size-label--short', '21rem'],
    ['.page-size-label--medium', '23rem'],
  ])('shows %s again from %s, where it fits', (selector, min) => {
    expect(ruleBody(css, selector)).toMatch(
      new RegExp(`^\\s*@container pagination \\(width >= ${min}\\)\\s*\\{\\s*display:\\s*inline;`)
    );
  });

  it('declares the label tiers after the base rule, so they win where both match', () => {
    expect(css.indexOf('.page-size-label {')).toBeLessThan(
      css.indexOf('.page-size-label--short {')
    );
    expect(css.indexOf('.page-size-label {')).toBeLessThan(
      css.indexOf('.page-size-label--medium {')
    );
  });
});
