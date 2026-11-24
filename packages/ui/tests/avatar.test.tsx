import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar, AvatarFallback } from '@/components/avatar/avatar';

describe('Avatar', () => {
  it('names its size in data-avatar, which rows read to keep their height', () => {
    const { container } = render(
      <>
        <Avatar>
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>BS</AvatarFallback>
        </Avatar>
      </>
    );
    const sizes = [...container.querySelectorAll('[data-avatar]')].map((el) =>
      el.getAttribute('data-avatar')
    );
    expect(sizes).toEqual(['md', 'lg']);
  });
});
