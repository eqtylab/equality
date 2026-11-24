import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let css: string;

beforeAll(async () => {
  css = await compileCss('src/components/avatar/avatar.module.css');
}, 30_000);

describe('avatar.module.css', () => {
  it('makes a line avatar as tall as its line, falling back to 20 where lh is unsupported', () => {
    const body = ruleBody(css, '.avatar.size-line');
    for (const side of ['width', 'height']) {
      const fallback = body.search(new RegExp(`(^|[^-])${side}:\\s*20px;`));
      const line = body.search(new RegExp(`(^|[^-])${side}:\\s*1lh;`));
      expect(fallback, side).toBeGreaterThan(-1);
      expect(line, side).toBeGreaterThan(fallback);
    }
  });

  it.each(['xs', 'sm', 'md', 'lg'])('makes a %s avatar as tall as that control size', (size) => {
    const body = ruleBody(css, `.avatar.size-${size}`);
    expect(body).toMatch(new RegExp(`width:\\s*var\\(--eq-control-${size}-height\\);`));
    expect(body).toMatch(new RegExp(`height:\\s*var\\(--eq-control-${size}-height\\);`));
  });

  it('keeps text sizes off every avatar root, so a line avatar measures the line around it', () => {
    const roots = [...css.matchAll(/(^|\n)(\.avatar(?:\.[\w-]+)*)\s*\{([^{}]*)\}/g)];
    expect(roots.length).toBeGreaterThan(0);
    for (const [, , selector, body] of roots) {
      expect(body, selector).not.toMatch(/font-size|line-height|--tw-leading/);
    }
  });

  it.each([
    ['line', '0.625rem'],
    ['xs', '0.75rem'],
    ['sm', '0.875rem'],
    ['md', '0.875rem'],
    ['lg', '1rem'],
    ['xl', '1.125rem'],
  ])('sets %s initials at %s on the fallback', (size, rem) => {
    expect(ruleBody(css, `.avatar.size-${size} .avatar-fallback`)).toMatch(
      new RegExp(`font-size:\\s*${rem.replace('.', '\\.')};`)
    );
  });

  it('fills the avatar with its image at every size', () => {
    const body = ruleBody(css, '.avatar-image');
    expect(body).toMatch(/width:\s*100%;/);
    expect(body).toMatch(/height:\s*100%;/);
    expect(body).toMatch(/object-fit:\s*cover;/);
    expect(ruleBody(css, '.avatar')).toMatch(/overflow:\s*hidden;/);
  });

  it('rounds a square line avatar in proportion', () => {
    expect(
      ruleBody(css, '.avatar.square.size-line,\n.avatar.square.size-line .avatar-fallback')
    ).toMatch(/border-radius:\s*0\.25rem;/);
  });

  it('drops the sizes outside the scale', () => {
    expect(css).not.toMatch(/\.size-(2xl|3xl)\b/);
    expect(css).not.toMatch(/\.avatar\.(sm|md|lg|xl)\b/);
  });
});
