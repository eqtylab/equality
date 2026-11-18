import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/sheet/sheet.module.css');
}, 30_000);

describe('sheet.module.css', () => {
  it('lights the header from beyond its top-left corner, not with a fade across it', () => {
    const body = ruleBody(css, '.sheet-header');
    expect(body).toMatch(/background-image:\s*radial-gradient\(\s*ellipse 760px 210px at -6% -40%/);
    expect(body).not.toMatch(/linear-gradient/);
  });

  it('takes the link purple in light mode and the brand purple in dark', () => {
    const body = ruleBody(css, '.sheet-header');
    expect(body).toMatch(
      /--sheet-header-glow-color:\s*color-mix\(in oklab, var\(--color-text-link\) 8%, transparent\);/
    );
    expect(body).toMatch(
      /--sheet-header-glow-color:\s*color-mix\(in oklab, var\(--color-brand-primary\) 13%, transparent\);/
    );
  });
});
