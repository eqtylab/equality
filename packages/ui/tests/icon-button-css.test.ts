import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/icon-button/icon-button.module.css');
}, 30_000);

describe('icon-button.module.css', () => {
  it('draws an extra-small button at 24px, the WCAG 2.2 AA minimum target size', () => {
    const body = ruleBody(css, '.size--xs');
    expect(body).toMatch(/width:\s*calc\(0\.25rem \* 6\);/);
    expect(body).toMatch(/height:\s*calc\(0\.25rem \* 6\);/);
  });
});
