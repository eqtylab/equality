import { describe, expect, it } from 'vitest';

import { cn as publicCn } from '@/index';
import { cn } from '@/lib/utils';

describe('cn', () => {
  it('keeps a text style beside a text colour', () => {
    expect(cn('text-caption text-text-secondary')).toBe('text-caption text-text-secondary');
    expect(cn('text-text-primary text-title-1')).toBe('text-text-primary text-title-1');
    expect(cn('text-text-primary text-title')).toBe('text-text-primary text-title');
    expect(cn('text-text-primary text-title-2')).toBe('text-text-primary text-title-2');
    expect(cn('text-text-primary text-display')).toBe('text-text-primary text-display');
    expect(cn('text-text-primary text-display-lg')).toBe('text-text-primary text-display-lg');
  });

  it('still lets one text style replace another', () => {
    expect(cn('text-body text-caption')).toBe('text-caption');
    expect(cn('text-title-1 text-title-2')).toBe('text-title-2');
    expect(cn('text-display', 'text-display-lg')).toBe('text-display-lg');
  });

  it('lets a Tailwind 4 variable size replace a fixed one', () => {
    expect(cn('size-4', 'size-(--eq-size-sm)')).toBe('size-(--eq-size-sm)');
    expect(cn('h-9', 'h-(--eq-control-md-height)')).toBe('h-(--eq-control-md-height)');
  });

  it('lets one important class with a trailing ! replace another', () => {
    expect(cn('p-4!', 'p-2!')).toBe('p-2!');
  });
});

describe('the cn apps import', () => {
  it('is the same helper, so it keeps the text styles too', () => {
    expect(publicCn).toBe(cn);
  });
});
