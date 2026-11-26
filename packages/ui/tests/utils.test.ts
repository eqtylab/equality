import { describe, expect, it } from 'vitest';

import { cn as publicCn } from '@/index';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('keeps a text style beside a text colour', () => {
    expect(cn('text-caption text-text-secondary')).toBe('text-caption text-text-secondary');
    expect(cn('text-text-primary text-title-1')).toBe('text-text-primary text-title-1');
    expect(cn('text-text-primary text-title')).toBe('text-text-primary text-title');
    expect(cn('text-text-primary text-title-2')).toBe('text-text-primary text-title-2');
  });

  it('still lets one text style replace another', () => {
    expect(cn('text-body text-caption')).toBe('text-caption');
    expect(cn('text-title-1 text-title-2')).toBe('text-title-2');
  });
});

describe('the cn apps import', () => {
  it('is the same helper, so it keeps the text styles too', () => {
    expect(publicCn).toBe(cn);
  });
});
