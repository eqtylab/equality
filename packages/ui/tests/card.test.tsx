import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Card } from '@/components/card/card';

const card = () => screen.getByTestId('card');

describe('Card', () => {
  it('draws a clickable choice with the grey hover, without the brand hover or its gradient', () => {
    render(<Card data-testid="card" selected={false} onClick={() => {}} />);

    expect(card().className).toMatch(/card--choice/);
    expect(card().className).not.toMatch(/card--hover/);
    expect(card().className).not.toMatch(/card--selected/);
    expect(card().querySelector('[class*="card-hover-gradient"]')).toBeNull();
  });

  it('marks the selected choice', () => {
    render(<Card data-testid="card" selected onClick={() => {}} />);

    expect(card().className).toMatch(/card--selected/);
  });

  it('gives a choice with no click handler no hover', () => {
    render(<Card data-testid="card" selected={false} />);

    expect(card().className).not.toMatch(/card--choice/);
  });

  it('keeps the brand hover and gradient on a clickable card that isn’t a choice', () => {
    render(<Card data-testid="card" onClick={() => {}} />);

    expect(card().className).toMatch(/card--hover/);
    expect(card().querySelector('[class*="card-hover-gradient"]')).not.toBeNull();
  });

  it('tints a status card, and leaves a default one untinted', () => {
    const { unmount } = render(<Card data-testid="card" variant="danger" />);
    expect(card().className).toMatch(/card--danger/);
    unmount();

    render(<Card data-testid="card" />);
    expect(card().className).not.toMatch(/card--(success|warning|danger)/);
  });
});
