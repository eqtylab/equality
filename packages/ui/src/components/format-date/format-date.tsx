import * as React from 'react';

import styles from '@/components/format-date/format-date.module.css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';

export type FormatDateDisplayMode = 'relative' | 'absolute';

export interface FormatDateProps extends Omit<
  React.TimeHTMLAttributes<HTMLTimeElement>,
  'dateTime' | 'children'
> {
  /** The date to display. Accepts an ISO 8601 string, epoch milliseconds, or a Date. */
  date: string | number | Date;
  /** Render relative ("2 weeks ago") or absolute ("Jun 9 2026, 18:42:03 UTC") time. */
  displayAs?: FormatDateDisplayMode;
  /** Time zone used for absolute formatting. Defaults to "UTC". */
  timeZone?: string;
  /** BCP 47 locale used for formatting. Defaults to "en-US". */
  locale?: string;
  /** When relative, show a tooltip with the absolute time on hover/focus. Defaults to true. */
  tooltip?: boolean;
  /** When relative, re-render on an interval so the value stays current. Defaults to true. */
  live?: boolean;
  /** Override the Intl options used for absolute formatting. */
  absoluteOptions?: Intl.DateTimeFormatOptions;
}

// BCP 47 locale used for all formatting. Explicit so server and client always agree
const DEFAULT_LOCALE = 'en-US';

const DEFAULT_ABSOLUTE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZoneName: 'short',
};

const RELATIVE_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
];

// Re-render relative time so values like "Just now" stay accurate without busy-looping
const LIVE_INTERVAL_MS = 30_000;

// Parse any date-like input into a Date, or null if missing/invalid
function toDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatAbsolute(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
  locale: string
): string {
  return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(date);
}

function formatRelative(date: Date, now: Date, locale: string): string {
  let duration = (date.getTime() - now.getTime()) / 1000;
  if (Math.abs(duration) < 45) return 'Just now';

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return 'Just now';
}

function FormatDate({
  date,
  displayAs = 'absolute',
  timeZone = 'UTC',
  locale = DEFAULT_LOCALE,
  tooltip = true,
  live = true,
  absoluteOptions,
  className,
  ...props
}: FormatDateProps) {
  const parsed = React.useMemo(() => toDate(date), [date]);
  const [now, setNow] = React.useState(() => new Date());

  const isRelative = displayAs === 'relative';

  React.useEffect(() => {
    if (!isRelative || !live) return;
    const id = setInterval(() => setNow(new Date()), LIVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isRelative, live]);

  if (!parsed) {
    return (
      <time className={cn(styles['format-date'], className)} {...props}>
        Invalid date
      </time>
    );
  }

  const machineValue = parsed.toISOString();
  const absolute = formatAbsolute(
    parsed,
    timeZone,
    absoluteOptions ?? DEFAULT_ABSOLUTE_OPTIONS,
    locale
  );

  if (!isRelative) {
    return (
      <time dateTime={machineValue} className={cn(styles['format-date'], className)} {...props}>
        {absolute}
      </time>
    );
  }

  const relative = formatRelative(parsed, now, locale);

  if (!tooltip) {
    return (
      <time dateTime={machineValue} className={cn(styles['format-date'], className)} {...props}>
        {relative}
      </time>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <time
            dateTime={machineValue}
            tabIndex={0}
            className={cn(styles['format-date'], styles['format-date--interactive'], className)}
            {...props}
          >
            {relative}
          </time>
        </TooltipTrigger>
        <TooltipContent>{absolute}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { FormatDate };
