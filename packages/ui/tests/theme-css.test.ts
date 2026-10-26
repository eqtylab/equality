import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/theme/theme.module.css');
}, 30_000);

// Top-level rules with their nested blocks: Tailwind adds `@supports` fallbacks inside each colour rule
function rulesDeclaring(name: string): { selector: string; body: string }[] {
  const rules: { selector: string; body: string }[] = [];
  let depth = 0;
  let start = 0;
  let open = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') {
      if (depth === 0) open = i;
      depth++;
    } else if (css[i] === '}') {
      depth--;
      if (depth === 0) {
        rules.push({ selector: css.slice(start, open).trim(), body: css.slice(open + 1, i) });
        start = i + 1;
      }
    }
  }
  return rules.filter((r) => new RegExp(`${name}\\s*:`).test(r.body));
}

describe('theme/decisions.css', () => {
  it('declares the list decisions on :root from the spacing scale', () => {
    expect(css).toMatch(/--list-item-height:\s*calc\(var\(--spacing\) \* 9\)/);
    expect(css).toMatch(/--list-gap:\s*calc\(var\(--spacing\) \* 0\.5\)/);
    expect(css).toMatch(/--list-item-font-size:\s*var\(--text-sm\)/);
    expect(css).toMatch(/--control-height:\s*calc\(var\(--spacing\) \* 10\)/);
    expect(css).toMatch(/--touch-target:\s*0px/);
  });

  it('has one row size, with no size variants', () => {
    expect(css).not.toMatch(/\[data-size/);
  });

  it('sets a 44px touch target under a coarse pointer', () => {
    expect(css).toMatch(
      /@media \(pointer: coarse\)\s*\{\s*:root\s*\{\s*--touch-target:\s*2\.75rem/
    );
  });
});

const flat = (css?: string) => css?.replace(/\s+/g, ' ').replace(/\( /g, '(').replace(/ \)/g, ')');

describe('list item colours', () => {
  it('declares the colours on html and .root, light and dark', () => {
    const current = rulesDeclaring('--color-list-item-current');
    const hover = rulesDeclaring('--color-list-item-hover');

    const light = current.find(
      (r) => /\bhtml\b/.test(r.selector) && /\.root\b/.test(r.selector) && !/dark/.test(r.selector)
    );
    expect(flat(light?.body)).toMatch(
      /--color-list-item-current:\s*color-mix\(in oklab, var\(--color-text-primary\) 10%, transparent\)/
    );
    expect(flat(light?.body)).toMatch(
      /--color-list-item-hover:\s*color-mix\(in oklab, var\(--color-text-primary\) 6%, transparent\)/
    );

    const dark = current.find(
      (r) =>
        r.selector.includes("html[data-equality-theme='dark']") &&
        r.selector.includes("[data-equality-theme='dark'] .root")
    );
    expect(flat(dark?.body)).toMatch(
      /--color-list-item-current:\s*color-mix\(in oklab, var\(--color-text-primary\) 14%, transparent\)/
    );
    expect(flat(dark?.body)).toMatch(
      /--color-list-item-hover:\s*color-mix\(in oklab, var\(--color-text-primary\) 8%, transparent\)/
    );
    expect(hover).toHaveLength(2);
  });

  it('never redeclares the colours on :root', () => {
    expect(css).not.toMatch(/:root[^{]*\{[^}]*--color-list-item-(current|hover)\s*:/);
  });
});
