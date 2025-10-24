import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

import { cn } from '../lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onSelect: (range: DateRange) => void;
  className?: string;
}

export const DateRangePicker = ({ dateRange, onSelect, className }: DateRangePickerProps) => {
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
      <div className="relative w-auto">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start rounded-md px-10 text-base font-normal md:text-sm',
              dateRange.from && dateRange.to && 'text-foreground',
              className
            )}
          >
            <CalendarDays className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <span className="flex-1">{formatRange(dateRange)}</span>
          </Button>
        </PopoverTrigger>

        {hasSelection && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearClick}
            className="absolute right-2 top-1/2 size-6 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X />
          </Button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="space-y-4 p-4">
          {/* Header with month navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-foreground size-8 p-0"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft />
            </Button>

            <div className="flex-1 text-center">
              <div className="text-foreground text-sm font-semibold">
                {`${MONTHS[displayedMonth]} ${displayedYear}`}
              </div>
              {selecting && (
                <div className="text-muted-foreground mt-1 text-xs">
                  {selecting === 'from' ? 'Select start date' : 'Select end date'}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-foreground size-8 p-0"
              onClick={goToNextMonth}
            >
              <ChevronRight />
            </Button>
          </div>

          {/* Day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAY_HEADERS.map((day) => (
              <div
                key={day}
                className="text-muted-foreground flex h-4 items-center justify-center text-xs font-medium"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
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
                  variant="outline"
                  className={cn(
                    'size-9 rounded-md p-0 text-sm font-normal transition-colors',
                    isSelected && 'bg-lilac text-background hover:bg-lilac/90',
                    !isSelected && 'hover:bg-lilac/20',
                    isToday && !isSelected && 'border-lilac/30 text-lilac border font-semibold',
                    inRange && !isSelected && 'bg-lilac/10 text-lilac'
                  )}
                  onClick={() => handleDateSelect(day)}
                >
                  {day.getDate()}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
