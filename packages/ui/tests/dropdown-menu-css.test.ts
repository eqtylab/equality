import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/dropdown-menu/dropdown-menu.module.css');
}, 30_000);

function declarationsFor(selector: string): string[] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selectors]) => selectors.includes(selector))
    .map(([, , body]) => body);
}

describe('dropdown-menu.module.css', () => {
  it('draws no ring around a radio item, chosen or not', () => {
    expect(declarationsFor('.dropdown-menu-item-indicator-radio').join('')).not.toMatch(
      /\bborder(-[a-z]+)?\s*:/
    );
  });

  it('keeps the box around a checkbox item', () => {
    expect(declarationsFor('.dropdown-menu-item-indicator-checkbox').join('')).toMatch(
      /\bborder-width\s*:/
    );
  });
});
