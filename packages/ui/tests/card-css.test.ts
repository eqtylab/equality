import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/card/card.module.css');
}, 30_000);

// A rule of its own, not the shared tint rule that also lists the selector
const own = (selector: string) => `}\n${selector}`;
const SELECTED = '.card--selected,\n.card--selected:hover,\n.card--selected:active';
const TINTS = '.card--choice,\n.card--selected,\n.card--success,\n.card--warning,\n.card--danger';

describe('card.module.css', () => {
  it('draws every tint as an image over the elevation background, never in its place', () => {
    expect(ruleBody(css, TINTS)).toMatch(
      /background-image:\s*linear-gradient\(var\(--card-tint\), var\(--card-tint\)\)/
    );
    for (const rule of ['.card--choice', SELECTED, '.card--success']) {
      expect(ruleBody(css, own(rule))).not.toMatch(/background-color:/);
    }
  });

  it('registers the tint as a colour, so the choice hover transitions', () => {
    expect(css).toMatch(/@property --card-tint\s*\{\s*syntax:\s*'<color>'/);
    expect(ruleBody(css, own('.card--choice'))).toMatch(/transition-property:[^;]*--card-tint;/);
  });

  it('tints a choice card grey on hover and while pressed', () => {
    const body = ruleBody(css, own('.card--choice'));
    expect(body).toMatch(/&:hover\s*\{[^}]*--card-tint:\s*var\(--color-list-item-hover\)/);
    expect(body).toMatch(/&:active\s*\{\s*--card-tint:\s*var\(--color-list-item-hover\)/);
  });

  it('keeps a selected card on the current-item tint and a primary border while hovered or pressed', () => {
    const body = ruleBody(css, own(SELECTED));
    expect(body).toMatch(/--card-tint:\s*var\(--color-list-item-current\)/);
    expect(body).toMatch(/border-color:\s*var\(--color-text-primary\b/);
  });

  it.each(['success', 'warning', 'danger'])('tints a %s card with its badge colour', (status) => {
    const body = ruleBody(css, own(`.card--${status}`));
    expect(body).toMatch(
      new RegExp(
        `--card-tint:\\s*color-mix\\(in oklab, var\\(--color-badge-background-${status}\\) 20%`
      )
    );
    expect(body).toMatch(
      new RegExp(`border-color:\\s*var\\(--color-badge-background-${status}\\b`)
    );
  });

  it('comes after the elevations and the choice hover, so selection and status win at the same specificity', () => {
    const overlay = css.indexOf('.card--overlay {');
    for (const rule of [TINTS, own('.card--choice'), own('.card--danger')]) {
      expect(css.indexOf(rule)).toBeGreaterThan(overlay);
    }
    expect(css.indexOf(own(SELECTED))).toBeGreaterThan(css.indexOf(own('.card--choice')));
  });
});
