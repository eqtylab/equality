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
  it('has one named size per control size', async () => {
    const decisions = await readFile('src/theme/theme-decisions.css', 'utf8');
    expect(decisions).toMatch(/--eq-control-xs-icon-size:\s*--spacing\(3\.5\);/);
    expect(decisions).toMatch(/--eq-control-sm-icon-size:\s*--spacing\(4\);/);
    expect(decisions).toMatch(/--eq-control-md-icon-size:\s*--spacing\(4\);/);
    expect(decisions).toMatch(/--eq-control-lg-icon-size:\s*--spacing\(5\);/);
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

  it.each(['xs', 'sm', 'md', 'lg'])(
    'is read by a %s icon button',
    async (size) => {
      const css = await compileCss('src/components/icon-button/icon-button.module.css');
      expect(ruleBody(css, `.size--${size}`)).toMatch(
        new RegExp(`--icon-btn-icon-size:\\s*var\\(--eq-control-${size}-icon-size\\);`)
      );
    },
    30_000
  );

  it('outranks the icon rule of a Button the icon button sits in', async () => {
    const css = await compileCss('src/components/icon-button/icon-button.module.css');
    expect(css).toContain('.icon-btn.icon-btn svg {');
  });

  it('falls back to the small size when an icon button has no size', async () => {
    const css = await compileCss('src/components/icon-button/icon-button.module.css');
    const body = ruleBody(css, '.icon-btn.icon-btn svg');
    expect(body).toMatch(
      /width:\s*var\(--icon-btn-icon-size,\s*var\(--eq-control-sm-icon-size\)\);/
    );
    expect(body).toMatch(
      /height:\s*var\(--icon-btn-icon-size,\s*var\(--eq-control-sm-icon-size\)\);/
    );
  });
});
