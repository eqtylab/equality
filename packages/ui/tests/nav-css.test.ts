import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/nav/nav.module.css');
}, 30_000);

// The switcher's top padding in px, for a rail item and touch target of the given sizes
function switcherPadding(controlHeight: number, touchTarget: number): number {
  const body = ruleBody(
    css,
    '.nav-rail + .nav-panel .nav-panel-header:has(> .nav-switcher-heading)'
  );
  const value = /padding-top:\s*([^;]+);/.exec(body)![1];
  const expression = value
    .replaceAll('var(--eq-control-height)', String(controlHeight))
    .replaceAll('var(--eq-touch-target)', String(touchTarget))
    .replaceAll('0.25rem', '4')
    .replaceAll('max(', 'Math.max(')
    .replaceAll('calc(', '(');
  return new Function(`return ${expression}`)() as number;
}

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

  it("centres the switcher on the rail's first item with a mouse and on touch", () => {
    expect(switcherPadding(40, 0)).toBe(4);
    expect(switcherPadding(40, 44)).toBe(0);
  });
});
