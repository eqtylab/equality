import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/menu/menu.module.css');
}, 30_000);

function rule(selector: RegExp): string {
  const match = css.match(new RegExp(`${selector.source}\\s*\\{([^}]*)\\}`));
  return match?.[1] ?? '';
}

describe('menu.module.css', () => {
  it('sizes the row from the decisions', () => {
    const item = rule(/\n\.item/);
    expect(item).toMatch(/height:\s*var\(--list-item-height\)/);
    expect(item).toMatch(/min-height:\s*var\(--touch-target\)/);
  });

  it('sets the row text size as a length, not a colour', () => {
    expect(css).toMatch(/font-size:\s*var\(--list-item-font-size\)/);
    expect(css).not.toMatch(/color:\s*var\(--list-item-font-size\)/);
  });

  it('fills the current row, live or leaving, with the current colour', () => {
    const current = rule(
      /\.item\[aria-current=['"]page['"]\],\s*\.item\[data-current=['"]page['"]\]/
    );
    expect(current).toMatch(/background-color:\s*var\(--color-list-item-current\)/);
  });

  it('fills a hovered row with the hover colour', () => {
    expect(rule(/\.item:hover/)).toMatch(/background-color:\s*var\(--color-list-item-hover\)/);
  });
});
