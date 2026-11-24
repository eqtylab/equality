import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from '@/components/badge/badge';

const badge = (node: React.ReactElement) => render(node).container.firstElementChild!;

describe('Badge', () => {
  it('follows the line it sits in unless given a size', () => {
    expect(badge(<Badge>New</Badge>).className).toMatch(/badge--line/);
    expect(badge(<Badge variant={null}>New</Badge>).className).toMatch(/badge--line/);
  });

  it('keeps the fixed sizes when asked', () => {
    expect(badge(<Badge size="sm">New</Badge>).className).toMatch(/badge--sm/);
    expect(badge(<Badge size="md">New</Badge>).className).toMatch(/badge--md/);
  });

  it('puts its text in a label, apart from the root', () => {
    const root = badge(<Badge>New</Badge>);
    const label = root.querySelector('[class*="badge-label"]');
    expect(label?.textContent).toBe('New');
  });

  it('renders no empty label for an icon-only badge', () => {
    const root = badge(<Badge icon="Check" display="icon-only" aria-label="Done" />);
    expect(root.querySelector('[class*="badge-label"]')).toBeNull();
  });

  it('renders no empty label for a badge with only an icon', () => {
    const root = badge(<Badge icon="Check" aria-label="Done" />);
    expect(root.querySelector('[class*="badge-label"]')).toBeNull();
  });
});
