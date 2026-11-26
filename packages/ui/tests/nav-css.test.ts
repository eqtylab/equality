import { readFile } from 'node:fs/promises';
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

  it('sizes the rail as its item plus 12 each side, on touch too', async () => {
    expect(ruleBody(css, '.nav-rail')).toMatch(/width:\s*var\(--eq-nav-rail-width\);/);
    const decisions = await readFile('src/theme/theme-decisions.css', 'utf8');
    expect(decisions).toMatch(
      /--eq-nav-rail-width:\s*calc\(\s*max\(var\(--eq-control-md-height\), var\(--eq-touch-target\)\) \+ --spacing\(6\)\s*\);/
    );
  });

  it('draws the rail and panel lines inside their width, so neither grows by a pixel', () => {
    const shared = ruleBody(css, '.nav-rail,\n.nav-panel');
    expect(shared).not.toMatch(/border-right-width/);
    expect(shared).toMatch(/position:\s*relative;/);
    expect(shared).toMatch(/isolation:\s*isolate;/);
    const line = ruleBody(css, '.nav-rail::after,\n.nav-panel::after');
    expect(line).toMatch(/border-right:\s*1px solid var\(--color-border-raised\);/);
    expect(line).not.toMatch(/background-color/);
    expect(line).toMatch(/inset:\s*0 0 0 auto;/);
  });

  it('starts the rail and the panel 8 below their top, so their first items line up', () => {
    expect(ruleBody(css, '.nav-rail .nav-scroller')).toMatch(
      /padding-block:\s*calc\(0\.25rem \* 2\);/
    );
    expect(ruleBody(css, '.nav-panel .nav-scroller')).toMatch(
      /padding-top:\s*calc\(0\.25rem \* 2\);/
    );
    expect(ruleBody(css, '.nav-panel-header:has(> .nav-switcher-heading)')).toMatch(
      /padding-top:\s*calc\(0\.25rem \* 2\);/
    );
    expect(ruleBody(css, '.nav-panel-header')).toMatch(
      /padding-top:\s*calc\(calc\(0\.25rem \* 2\) \+ var\(--nav-title-padding\)\);/
    );
  });

  it('draws rail icons at the default control icon size', () => {
    expect(ruleBody(css, '.nav-rail-item svg')).toMatch(
      /width:\s*var\(--eq-control-md-icon-size\);/
    );
  });

  it('draws the switcher outline inside it, so its name sits 8 in', () => {
    expect(ruleBody(css, '.nav-switcher-heading .nav-switcher')).toMatch(/border-width:\s*0px;/);
    expect(
      ruleBody(css, ".nav-switcher-heading .nav-switcher[data-state='open']:not(:disabled)")
    ).toMatch(/--tw-inset-ring-shadow:\s*inset 0 0 0 1px/);
    expect(
      ruleBody(css, ".nav-switcher-heading .nav-switcher[data-state='open']:not(:disabled)")
    ).toMatch(/@media \(forced-colors: active\)\s*\{\s*outline-style:/);
  });
});
