import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/skeleton/skeleton.module.css');
}, 30_000);

// The dark fill sits in a rule nested under the dark variant, so the light one is the rule's first
function lightFill(): string | undefined {
  const rule = css.slice(css.indexOf('.skeleton {'));
  return /background-color:\s*([^;]+);/.exec(rule)?.[1];
}

describe('skeleton.module.css', () => {
  it('fills with greyscale-200 in light, a soft hint on a light surface', () => {
    expect(lightFill()).toMatch(/^var\(--color-greyscale-200\b/);
  });

  it('keeps greyscale-800 in dark', () => {
    expect(css).toMatch(/background-color:\s*var\(--color-greyscale-800\b/);
  });
});
