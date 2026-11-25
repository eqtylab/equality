import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn', () => {
  it('keeps a text style beside a text colour', () => {
    expect(cn('text-caption text-text-secondary')).toBe('text-caption text-text-secondary');
    expect(cn('text-text-primary text-title')).toBe('text-text-primary text-title');
  });

  it('still lets one text style replace another', () => {
    expect(cn('text-body text-caption')).toBe('text-caption');
  });
});
