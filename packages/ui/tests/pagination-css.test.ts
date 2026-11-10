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

  it('wraps the page buttons under the info line when the two do not fit', () => {
    expect(ruleBody(css, '.pagination')).toMatch(/flex-wrap:\s*wrap;/);
  });

  it("hides the wide-only parts below 42rem, over a Button's own display", () => {
    expect(ruleBody(css, '.wide-only.wide-only')).toMatch(
      /@container pagination \(width < 42rem\)\s*\{\s*display:\s*none;/
    );
  });

  it('shows the narrow-only parts only below 42rem', () => {
    const body = ruleBody(css, '.narrow-only');
    expect(body).toMatch(/^\s*display:\s*none;/);
    expect(body).toMatch(/@container pagination \(width < 42rem\)\s*\{\s*display:\s*inline;/);
  });
});
