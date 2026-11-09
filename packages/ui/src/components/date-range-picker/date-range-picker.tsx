import * as React from 'react';
import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/button/button';
import styles from '@/components/date-range-picker/date-range-picker.module.css';
import { IconButton } from '@/components/icon-button/icon-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover/popover';
import { cn } from '@/lib/utils';
import { dayKey, dayOf, endOfDay, startOfDay, type Day } from '@/lib/zoned-day';

const CalendarDaysIcon = CalendarDays as React.ComponentType<{ className?: string }>;
const ChevronLeftIcon = ChevronLeft as React.ComponentType<{ className?: string }>;
const ChevronRightIcon = ChevronRight as React.ComponentType<{ className?: string }>;

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  /** The selected range; either end may be unset */
  dateRange: DateRange;
  /** Called with the new range when a day is picked or the range is cleared */
  onSelect: (range: DateRange) => void;
  /** Additional classes on the trigger button */
  className?: string;
  /** IANA time zone the days follow, such as `Europe/Paris`. @default the browser's zone */
  timeZone?: string;
}

const validDate = (date?: Date) => (date && !Number.isNaN(date.getTime()) ? date : undefined);

const DateRangePicker = ({ dateRange, onSelect, className, timeZone }: DateRangePickerProps) => {
  const today = dayOf(new Date(), timeZone);
  const [selecting, setSelecting] = useState<'from' | 'to' | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState(today.month);
  const [displayedYear, setDisplayedYear] = useState(today.year);
  const from = validDate(dateRange.from);
  const to = validDate(dateRange.to);

  const daysInMonth = new Date(Date.UTC(displayedYear, displayedMonth + 1, 0)).getUTCDate();
  const firstDayOfMonth = new Date(Date.UTC(displayedYear, displayedMonth, 1)).getUTCDay();
  const days = Array.from(
    { length: daysInMonth },
    (_, i): Day => ({ year: displayedYear, month: displayedMonth, day: i + 1 })
  );
  const fromKey = from && dayKey(dayOf(from, timeZone));
  const toKey = to && dayKey(dayOf(to, timeZone));
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, _i) => null);
  const hasSelection = from || to;

  const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Format date to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Format range for display
  const formatRange = (range: DateRange): string => {
    if (!range.from && !range.to) return 'Select Date Range';
    if (!range.to) return `From ${formatDate(range.from!)}`;
    if (!range.from) return `Until ${formatDate(range.to)}`;
    return `${formatDate(range.from)} - ${formatDate(range.to)}`;
  };

  const isDateSelected = (day: Day): boolean => dayKey(day) === fromKey || dayKey(day) === toKey;

  const todayKey = dayKey(today);
  const checkIsToday = (day: Day): boolean => dayKey(day) === todayKey;

  const goToPreviousMonth = () => {
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear(displayedYear - 1);
    } else {
      setDisplayedMonth(displayedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear(displayedYear + 1);
    } else {
      setDisplayedMonth(displayedMonth + 1);
    }
  };

  const isInRange = (day: Day) => {
    if (fromKey === undefined || toKey === undefined) return false;
    return dayKey(day) >= fromKey && dayKey(day) <= toKey;
  };

  const handleDateSelect = (selectedDay: Day) => {
    if (!selecting || !from) {
      // Start new selection from 'from' date
      onSelect({ from: startOfDay(selectedDay, timeZone), to: undefined });
      setSelecting('to');
      return;
    }

    const fromDay = dayOf(from, timeZone);
    if (dayKey(selectedDay) < dayKey(fromDay)) {
      // Swap if selected date is before 'from'
      onSelect({ from: startOfDay(selectedDay, timeZone), to: endOfDay(fromDay, timeZone) });
    } else {
      onSelect({ from: startOfDay(fromDay, timeZone), to: endOfDay(selectedDay, timeZone) });
    }
    setSelecting(null);
  };

  const clearSelection = () => {
    onSelect({ from: undefined, to: undefined });
    setSelecting(null);
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSelection();
  };

  return (
    <Popover>
      <div className={styles['popover-header']}>
        <PopoverTrigger asChild>
          <Button
            variant="tertiary"
            prefix={<CalendarDaysIcon />}
            suffix={
              hasSelection && (
                <IconButton
                  name="X"
                  size="sm"
                  onClick={handleClearClick}
                  label="Clear dates"
                ></IconButton>
              )
            }
            className={className}
          >
            <span className={styles['date-range']}>{formatRange({ from, to })}</span>
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className={styles['popover-content']} align="end">
        {/* Header with month navigation */}
        <div className={styles['month-navigation']}>
          <Button
            variant="tertiary"
            size="sm"
            className={styles['month-navigation-btn']}
            onClick={goToPreviousMonth}
          >
            <ChevronLeftIcon />
          </Button>

          <div className={styles['month-date-display']}>
            <div className={styles['month-date-display-title']}>
              {`${MONTHS[displayedMonth]} ${displayedYear}`}
            </div>
            {selecting && (
              <div className={styles['month-date-display-subtitle']}>
                {selecting === 'from' ? 'Select start date' : 'Select end date'}
              </div>
            )}
          </div>

          <Button
            variant="tertiary"
            size="sm"
            className={styles['month-navigation-btn']}
            onClick={goToNextMonth}
          >
            <ChevronRightIcon />
          </Button>
        </div>

        {/* Day headers */}
        <div className={styles['day-headers']}>
          {DAY_HEADERS.map((day) => (
            <div key={day} className={styles['day-headers-inner']}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={styles['calendar-grid']}>
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} />
          ))}
          {days.map((day, index) => {
            const isSelected = isDateSelected(day);
            const isToday = checkIsToday(day);
            const inRange = isInRange(day);

            return (
              <Button
                key={index}
                variant="tertiary"
                className={cn(
                  styles['calendar-day-btn'],
                  isSelected && styles['calendar-day-btn--selected'],
                  isToday && !isSelected && styles['calendar-day-btn--today'],
                  inRange && !isSelected && styles['calendar-day-btn--in-range']
                )}
                onClick={() => handleDateSelect(day)}
              >
                {day.day}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { DateRangePicker };
