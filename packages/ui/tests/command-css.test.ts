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

  it('sets the input in 16px text below md, ending text that does not fit in an ellipsis', () => {
    const body = ruleBody(css, '.command-input-input');
    expect(body).toMatch(/^\s*font-size:\s*1rem;/);
    expect(body).toMatch(/text-overflow:\s*ellipsis;/);
    expect(body).toMatch(/@media \(width >= 48rem\)\s*\{\s*font-size:\s*0\.875rem;/);
  });

  it('keeps the item icon rule in the dialog, so 6.2.0 moves nothing there', () => {
    expect(ruleBody(css, '.command-dialog-content-inner')).toMatch(/\[cmdk-item\] svg/);
  });
});
