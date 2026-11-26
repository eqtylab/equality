import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CardContentHeader } from '@/components/card-content-header/card-content-header';

describe('CardContentHeader', () => {
  it('names its See All button by the heading, and puts it after the heading', () => {
    render(<CardContentHeader icon="Activity" heading="Activity Logs" onButtonClick={() => {}} />);

    const heading = screen.getByRole('heading', { name: 'Activity Logs' });
    const button = screen.getByRole('button', { name: 'See All Activity Logs' });
    expect(heading.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('leaves the button named by its label without a heading', () => {
    render(<CardContentHeader icon="Activity" onButtonClick={() => {}} />);

    const button = screen.getByRole('button', { name: 'See All' });
    expect(button.hasAttribute('aria-label')).toBe(false);
  });

  it('renders nothing with neither a heading nor a button', () => {
    const { container } = render(<CardContentHeader icon="Activity" />);

    expect(container.firstChild).toBeNull();
  });

  it('draws its icon in a small circle', () => {
    const { container } = render(<CardContentHeader icon="Activity" heading="Activity Logs" />);

    const mark = container.querySelector('[aria-hidden="true"]');
    expect(mark?.className).toMatch(/mark-sm/);
    expect(mark?.className).toMatch(/mark-round/);
  });
});
