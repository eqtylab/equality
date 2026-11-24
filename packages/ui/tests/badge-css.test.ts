import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/badge/badge.module.css');
}, 30_000);

describe('badge.module.css', () => {
  it('makes a line badge as tall as its line, falling back to 20 where lh is unsupported', () => {
    const body = ruleBody(css, '.badge--line');
    const fallback = body.search(/height:\s*20px;/);
    const line = body.search(/height:\s*1lh;/);
    expect(fallback).toBeGreaterThan(-1);
    expect(line).toBeGreaterThan(fallback);
  });

  it('measures the line it sits in, so the line badge root sets no text size', () => {
    for (const selector of ['.badge', '.badge--line']) {
      const body = ruleBody(css, selector);
      expect(body, selector).not.toMatch(/font-size|line-height|--tw-leading/);
    }
  });

  it('sets the badge text size on its label', () => {
    expect(ruleBody(css, '.badge-label')).toMatch(/font-size:\s*0\.75rem;/);
  });
});
