import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/command/command.module.css');
}, 30_000);

describe('command.module.css', () => {
  it('lights the item cmdk selects, from the keyboard or the pointer, and not on hover alone', () => {
    const body = ruleBody(css, '.command-item');
    expect(body).toMatch(
      /&\[data-selected="true"\]\s*\{\s*background-color:\s*var\(--color-list-item-hover\);/
    );
    expect(body).not.toMatch(/:hover/);
  });
});
