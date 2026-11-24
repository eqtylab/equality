import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar, AvatarFallback } from '@/components/avatar/avatar';

type Size = 'line' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const initials = (children: React.ReactNode, size?: Size) =>
  render(
    <Avatar size={size}>
      <AvatarFallback>{children}</AvatarFallback>
    </Avatar>
  ).container.textContent;

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
    ['👩‍🚀x', 'line', '👩‍🚀'],
    ['👩‍🚀👨‍🔬x', 'md', '👩‍🚀👨‍🔬'],
    ['éf', 'line', 'é'],
    ['', 'md', ''],
  ])('keeps %j whole at %s: %j', (given, size, shown) => {
    expect(initials(given, size)).toBe(shown);
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
