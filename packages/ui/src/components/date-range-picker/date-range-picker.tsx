import { useState } from 'react';
import * as React from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { Button } from '@/components/button/button';
import styles from '@/components/date-range-picker/date-range-picker.module.css';
import { IconButton } from '@/components/icon-button/icon-button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover/popover';
import { cn } from '@/lib/utils';

const CalendarDaysIcon = CalendarDays as React.ComponentType<{ className?: string }>;
const XIcon = X as React.ComponentType<{ className?: string }>;
const ChevronLeftIcon = ChevronLeft as React.ComponentType<{ className?: string }>;
const ChevronRightIcon = ChevronRight as React.ComponentType<{ className?: string }>;

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onSelect: (range: DateRange) => void;
  className?: string;
}

const DateRangePicker = ({ dateRange, onSelect, className }: DateRangePickerProps) => {
  const [selecting, setSelecting] = useState<'from' | 'to' | null>(null);
  const [displayedMonth, setDisplayedMonth] = useState(new Date().getMonth());
  const [displayedYear, setDisplayedYear] = useState(new Date().getFullYear());

  // Create a grid of dates for the displayed month
  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(displayedYear, displayedMonth, 1).getDay();
  const days = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(displayedYear, displayedMonth, i + 1)
  );
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, _i) => null);
  const hasSelection = dateRange.from || dateRange.to;

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

  const isDateSelected = (day: Date, dateRange: DateRange): boolean => {
    const matchesFrom =
      dateRange.from &&
      day.getDate() === dateRange.from.getDate() &&
      day.getMonth() === dateRange.from.getMonth() &&
      day.getFullYear() === dateRange.from.getFullYear();

    const matchesTo =
      dateRange.to &&
      day.getDate() === dateRange.to.getDate() &&
      day.getMonth() === dateRange.to.getMonth() &&
      day.getFullYear() === dateRange.to.getFullYear();

    return !!matchesFrom || !!matchesTo;
  };

  const checkIsToday = (day: Date): boolean => {
    const today = new Date();
    return (
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

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

  const isInRange = (date: Date) => {
    if (!dateRange.from || !dateRange.to) return false;
    return date >= dateRange.from && date <= dateRange.to;
  };

  const handleDateSelect = (selectedDate: Date) => {
    const startOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const endOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(23, 59, 59, 999);
      return d;
    };

    if (!selecting || !dateRange) {
      // Start new selection from 'from' date
      onSelect({ from: startOfDay(selectedDate), to: undefined });
      setSelecting('to');
      return;
    }

    if (selecting === 'to') {
      if (dateRange.from && selectedDate < dateRange.from) {
        // Swap if selected date is before 'from'
        onSelect({ from: startOfDay(selectedDate), to: endOfDay(dateRange.from) });
      } else {
        onSelect({ from: startOfDay(dateRange.from!), to: endOfDay(selectedDate) });
      }
      setSelecting(null);
    }
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
            className={cn(dateRange.from && dateRange.to && styles, className)}
          >
            <span className={styles['date-range']}>{formatRange(dateRange)}</span>
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
            const isSelected = isDateSelected(day, dateRange);
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
                {day.getDate()}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { DateRangePicker };
