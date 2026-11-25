import path from 'node:path';
import tailwindcss from '@tailwindcss/postcss';
import postcss from 'postcss';
import { beforeAll, describe, expect, it } from 'vitest';

import { ruleBody } from './compile-css';

const roles = ['title', 'section', 'body', 'caption'];
const weighted = ['title', 'section'];

const source = '@source inline("text-title text-section text-body text-caption");';
const entries = {
  global: `@import 'tailwindcss/theme.css';\n@import '../src/theme/global-theme-config.css';\n${source}`,
  scoped: `@import '../src/theme/theme.module.css';\n${source}`,
};

const css: Record<string, string> = {};

beforeAll(async () => {
  const from = path.resolve(process.cwd(), 'tests/type-utilities.fixture.css');
  for (const [name, fixture] of Object.entries(entries)) {
    css[name] = (await postcss([tailwindcss()]).process(fixture, { from })).css;
  }
}, 30_000);

describe.each(Object.keys(entries))('a consumer build of the %s theme', (entry) => {
  it.each(['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl'])('declares --eq-size-%s', (step) => {
    expect(css[entry]).toMatch(new RegExp(`--eq-size-${step}:\\s*calc\\(`));
  });

  it.each(roles)('text-%s emits the decision, and an explicit class still wins', (role) => {
    const body = ruleBody(css[entry], `.text-${role}`);
    expect(body).toContain(`font-size: var(--eq-type-${role}-font-size)`);
    expect(body).toContain(`line-height: var(--tw-leading, var(--eq-type-${role}-line-height))`);
    if (weighted.includes(role)) {
      expect(body).toContain(
        `font-weight: var(--tw-font-weight, var(--eq-type-${role}-font-weight))`
      );
    }
    expect(body).not.toContain('var(--text-');
  });
});
