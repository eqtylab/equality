import { describe, expect, it } from 'vitest';

import { dayOf, endOfDay, startOfDay } from '@/lib/zoned-day';

describe('zoned days', () => {
  it('reads the day an instant falls on in the zone, not the runner’s', () => {
    expect(dayOf(new Date('2026-03-09T11:00:00Z'), 'Pacific/Auckland')).toEqual({
      year: 2026,
      month: 2,
      day: 10,
    });
    expect(dayOf(new Date('2026-03-09T11:00:00Z'), 'America/Los_Angeles')).toEqual({
      year: 2026,
      month: 2,
      day: 9,
    });
  });

  it('starts a day at its midnight in the zone, a part-hour offset included', () => {
    expect(startOfDay({ year: 2026, month: 2, day: 10 }, 'Pacific/Auckland').toISOString()).toBe(
      '2026-03-09T11:00:00.000Z'
    );
    expect(startOfDay({ year: 2026, month: 0, day: 1 }, 'Asia/Kathmandu').toISOString()).toBe(
      '2025-12-31T18:15:00.000Z'
    );
  });

  it('starts a day whose midnight a clock change skips at the first time after', () => {
    expect(startOfDay({ year: 2026, month: 2, day: 8 }, 'America/Havana').toISOString()).toBe(
      '2026-03-08T05:00:00.000Z'
    );
  });

  it('ends a day a millisecond before the next one starts', () => {
    expect(endOfDay({ year: 2026, month: 2, day: 12 }, 'Pacific/Auckland').toISOString()).toBe(
      '2026-03-12T10:59:59.999Z'
    );
    expect(endOfDay({ year: 2026, month: 2, day: 7 }, 'America/Havana').toISOString()).toBe(
      '2026-03-08T04:59:59.999Z'
    );
  });
});
