import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar, AvatarFallback } from '@/components/avatar/avatar';

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
