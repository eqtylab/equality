import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/nav/nav.module.css');
}, 30_000);

function rule(selector: RegExp): string {
  const match = css.match(new RegExp(`${selector.source}\\s*\\{([^}]*)\\}`));
  return match?.[1] ?? '';
}

describe('nav.module.css', () => {
  it('gives the rail item, switcher and switcher heading the touch target', () => {
    expect(rule(/\n\.rail-item/)).toMatch(/min-height:\s*var\(--touch-target\)/);
    expect(rule(/\n\.rail-item/)).toMatch(/min-width:\s*var\(--touch-target\)/);
    expect(rule(/\n\.switcher-heading/)).toMatch(/min-height:\s*var\(--touch-target\)/);
    expect(rule(/\n\.switcher-heading \.switcher/)).toMatch(/min-height:\s*var\(--touch-target\)/);
  });

  it('sizes the rail item from --control-height', () => {
    expect(rule(/\n\.rail-item/)).toMatch(/width:\s*var\(--control-height\)/);
    expect(rule(/\n\.rail-item/)).toMatch(/height:\s*var\(--control-height\)/);
  });

  it('tightens the header over a live ‹ only', () => {
    const drilled = rule(
      /\.scroller:has\(\[data-slot=['"]nav-drill-back['"]\]:not\(\[inert\] \*\)\) > \.panel-header/
    );
    expect(drilled).toMatch(/padding-bottom:\s*calc\(0\.25rem \* 0\)/);
  });

  it('lets the drill levels inherit the panel surface', () => {
    expect(rule(/\n\.scroller/)).toMatch(/background-color:\s*inherit/);
  });
});
