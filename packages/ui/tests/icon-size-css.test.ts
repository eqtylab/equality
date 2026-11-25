import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

const READERS: [file: string, selector: string, size: 'sm' | 'md' | 'lg'][] = [
  ['src/components/button/button.module.css', '.button', 'md'],
  ['src/components/button/button.module.css', '.size--sm', 'sm'],
  ['src/components/button/button.module.css', '.size--lg', 'lg'],
  ['src/components/input/input.module.css', '.input-wrapper', 'md'],
  ['src/components/search-bar/search-bar.module.css', '.search-icon', 'md'],
  ['src/components/select/select.module.css', '.select-icon', 'md'],
  ['src/components/dropdown-menu/dropdown-menu.module.css', '.dropdown-menu-item', 'md'],
  ['src/components/command/command.module.css', '.command-item', 'md'],
  ['src/components/sort-button/sort-button.module.css', '.sort-button', 'md'],
  ['src/components/command/command.module.css', '.command-input-icon', 'md'],
  ['src/components/nav/nav.module.css', '.nav-switcher-icon', 'md'],
  ['src/components/date-range-picker/date-range-picker.module.css', '.calendar-icon', 'md'],
];

describe('the icon beside text', () => {
  it('names the icon size in small, default and large controls', async () => {
    const decisions = await readFile('src/theme/theme-decisions.css', 'utf8');
    expect(decisions).toMatch(/--eq-control-sm-icon-size:\s*--spacing\(4\);/);
    expect(decisions).toMatch(/--eq-control-md-icon-size:\s*--spacing\(4\);/);
    expect(decisions).toMatch(/--eq-control-lg-icon-size:\s*--spacing\(4\);/);
  });

  it('gives a list item a 16 icon, the same size as a default control icon', async () => {
    const decisions = await readFile('src/theme/theme-decisions.css', 'utf8');
    expect(decisions).toMatch(/--eq-list-item-icon-size:\s*var\(--eq-control-md-icon-size\);/);
  });

  it.each(READERS)(
    'is read from that name in %s %s',
    async (file, selector, size) => {
      const css = await compileCss(file);
      const body = ruleBody(css, selector);
      expect(body).toMatch(new RegExp(`width:\\s*var\\(--eq-control-${size}-icon-size\\)`));
      expect(body).toMatch(new RegExp(`height:\\s*var\\(--eq-control-${size}-icon-size\\)`));
    },
    30_000
  );

  it('is not yet read by the icon button, whose icons differ', async () => {
    const css = await compileCss('src/components/icon-button/icon-button.module.css');
    expect(css).not.toContain('icon-size');
  });
});
