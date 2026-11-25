import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar, AvatarFallback } from '@/components/avatar/avatar';

type Size = 'line' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const renderFallback = (children: React.ReactNode, size?: Size) =>
  render(
    <Avatar size={size}>
      <AvatarFallback>{children}</AvatarFallback>
    </Avatar>
  ).container;

const initials = (children: React.ReactNode, size?: Size) => {
  const container = renderFallback(children, size);
  const drawn = container.querySelector('[aria-hidden="true"]');
  return (drawn ?? container).textContent;
};

describe('Avatar', () => {
  it('carries no size attribute, since nothing reads it', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
    );
    expect(container.querySelector('[data-avatar]')).toBeNull();
  });
});

describe('AvatarFallback', () => {
  it.each<[Size | undefined, string]>([
    [undefined, 'A'],
    ['line', 'A'],
    ['xs', 'A'],
    ['sm', 'A'],
    ['md', 'AC'],
    ['lg', 'AC'],
    ['xl', 'AC'],
  ])('shows %s initials for Alice Cooper as %j', (size, shown) => {
    expect(initials('AC', size)).toBe(shown);
  });

  it.each<[string, Size, string]>([
    ['  ac', 'line', 'a'],
    ['Éa', 'line', 'É'],
    ['e\u0301f', 'line', 'e\u0301'],
    ['', 'md', ''],
    ['A C', 'md', 'AC'],
    ['A C', 'line', 'A'],
  ])('keeps the first letter of %j whole at %s: %j', (given, size, shown) => {
    expect(initials(given, size)).toBe(shown);
  });

  it.each<[string, Size]>([
    ['+3', 'line'],
    ['99+', 'md'],
    ['👩‍🚀x', 'line'],
  ])('shows %j whole at %s, since it is a count or a symbol, not initials', (given, size) => {
    expect(initials(given, size)).toBe(given);
  });

  it('gives screen readers the full initials while drawing the first', () => {
    const container = renderFallback('AC', 'line');
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('A');
    const spoken = [...container.querySelectorAll('span')].find(
      (el) =>
        el.textContent === 'AC' && !el.closest('[aria-hidden="true"]') && el.children.length === 0
    );
    expect(spoken).toBeDefined();
  });

  it('leaves an element child as it is', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>
          <svg data-testid="icon" />
        </AvatarFallback>
      </Avatar>
    );
    expect(container.querySelector('[data-testid="icon"]')).not.toBeNull();
  });
});
