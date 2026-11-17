import { beforeAll, describe, expect, it } from 'vitest';

import { compileCss, ruleBody } from './compile-css';

let timeline: string;
let button: string;
let badge: string;
let icon: string;

beforeAll(async () => {
  [timeline, button, badge, icon] = await Promise.all(
    ['timeline/timeline', 'button/button', 'badge/badge', 'icon/icon'].map((name) =>
      compileCss(`src/components/${name}.module.css`)
    )
  );
}, 30_000);

// The base rule, which a size's `.timeline--sm .timeline-marker` would otherwise match first
const baseRule = (selector: string): string => ruleBody(timeline, `\n${selector}`);

const declared = (body: string, property: string): string => {
  const value = new RegExp(`(?:^|[;{\\s])${property}:\\s*([^;]+);`).exec(body)?.[1];
  if (!value) throw new Error(`no ${property} in ${body}`);
  return value;
};

describe('timeline.module.css', () => {
  it('draws an md marker as tall as an md Button', () => {
    const marker = ruleBody(timeline, '.timeline--md .timeline-marker');
    const height = declared(ruleBody(button, '.size--md:not(.button--link)'), 'height');
    expect(declared(marker, 'height')).toBe(height);
    expect(declared(marker, 'width')).toBe(height);
  });

  it('draws an sm marker as an icon-only Badge, glyph included', () => {
    const marker = ruleBody(timeline, '.timeline--sm .timeline-marker');
    const height = declared(ruleBody(badge, '.badge--md'), 'min-height');
    expect(declared(marker, 'height')).toBe(height);
    expect(declared(marker, 'width')).toBe(height);

    const glyph = ruleBody(timeline, '.timeline--sm .timeline-marker > *');
    expect(declared(glyph, 'height')).toBe(declared(ruleBody(icon, '.size--xs .icon'), 'height'));
  });

  it('pins the marker below --eq-timeline-offset, registered as a length that defaults to 0px', () => {
    expect(declared(baseRule('.timeline-marker'), 'top')).toMatch(
      /^calc\(var\(--eq-timeline-offset\) \+ var\(--timeline-pin-inset\)\)$/
    );
    const property = ruleBody(timeline, '@property --eq-timeline-offset');
    expect(property).toMatch(/syntax:\s*'<length>';/);
    expect(property).toMatch(/initial-value:\s*0px;/);
  });

  it('lets --eq-timeline-marker-background recolour the marker and its connector', () => {
    for (const selector of ['.timeline-marker', '.timeline-connector']) {
      expect(declared(baseRule(selector), 'background-color')).toBe(
        'var(--eq-timeline-marker-background, var(--timeline-marker-bg))'
      );
    }
    expect(declared(baseRule('.timeline-marker'), 'color')).toBe(
      'var(--eq-timeline-marker-color, var(--timeline-marker-fg))'
    );
  });

  it('leaves no gap after the last section', () => {
    expect(timeline).toMatch(
      /\.timeline-section:not\(:last-child\) > \.timeline-rail,\s*\.timeline-section:not\(:last-child\) > \.timeline-items \{\s*padding-bottom: var\(--timeline-gap\);/
    );
    expect(timeline).not.toMatch(/margin-bottom/);
  });
});
