import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/nav/nav.module.css');
}, 30_000);

describe('nav.module.css', () => {
  it('registers --eq-nav-offset as a length defaulting to 0px, so a bare 0 keeps the scroller valid', () => {
    const body = ruleBody(css, '@property --eq-nav-offset');
    expect(body).toMatch(/syntax:\s*'<length>'/);
    expect(body).toMatch(/inherits:\s*true/);
    expect(body).toMatch(/initial-value:\s*0px/);
  });

  it('pins the scroller --eq-nav-offset down and shortens it by as much', () => {
    const body = ruleBody(css, '.nav-scroller');
    expect(body).toMatch(/top:\s*var\(--eq-nav-offset\);/);
    expect(body).toMatch(/max-height:\s*min\(calc\(100dvh - var\(--eq-nav-offset\)\), 100%\);/);
  });

  it("draws the switcher heading as tall as the rail's first item, with a mouse and on touch", () => {
    for (const selector of ['.nav-rail-item', '.nav-switcher-heading']) {
      const body = ruleBody(css, selector);
      expect(body).toMatch(/[;{\s]height:\s*var\(--eq-control-md-height\);/);
      expect(body).toMatch(/min-height:\s*var\(--eq-touch-target\);/);
    }
  });

  it('pins the panel header and keeps a long list from squashing it', () => {
    const body = ruleBody(css, '.nav-panel-header');
    expect(body).toMatch(/position:\s*sticky;/);
    expect(body).toMatch(/top:\s*calc\(0\.25rem \* 0\);/);
    expect(body).toMatch(/flex-shrink:\s*0;/);
    expect(body).toMatch(/background-color:\s*inherit;/);
  });

  it('moves the scroller top padding into the header, so nothing shows above it once pinned', () => {
    expect(ruleBody(css, '.nav-panel .nav-scroller:has(> .nav-panel-header)')).toMatch(
      /padding-top:/
    );
  });
});
