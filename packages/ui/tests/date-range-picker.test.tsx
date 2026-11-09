import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DateRangePicker } from '@/components/date-range-picker/date-range-picker';

const ZONE = 'Pacific/Auckland';

describe('DateRangePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date('2026-03-15T12:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('hands back a range cut at the zone’s midnights', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { rerender } = render(
      <DateRangePicker dateRange={{}} onSelect={onSelect} timeZone={ZONE} />
    );

    await user.click(screen.getByRole('button', { name: 'Select Date Range' }));
    await user.click(await screen.findByRole('button', { name: '10' }));
    const from = new Date('2026-03-09T11:00:00.000Z');
    expect(onSelect).toHaveBeenLastCalledWith({ from, to: undefined });

    rerender(<DateRangePicker dateRange={{ from }} onSelect={onSelect} timeZone={ZONE} />);
    await user.click(screen.getByRole('button', { name: '12' }));
    expect(onSelect).toHaveBeenLastCalledWith({
      from,
      to: new Date('2026-03-12T10:59:59.999Z'),
    });
  });

  it('labels the range with its days in the zone', () => {
    render(
      <DateRangePicker
        dateRange={{
          from: new Date('2026-03-09T11:00:00.000Z'),
          to: new Date('2026-03-12T10:59:59.999Z'),
        }}
        onSelect={vi.fn()}
        timeZone={ZONE}
      />
    );

    expect(screen.getByText('03/10/2026 - 03/12/2026')).toBeTruthy();
  });
});
