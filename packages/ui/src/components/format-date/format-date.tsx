import * as React from 'react';

import styles from '@/components/format-date/format-date.module.css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { cn } from '@/lib/utils';

export type FormatDateDisplayMode = 'relative' | 'absolute' | 'until' | 'since';

export interface FormatDateProps extends Omit<
  React.TimeHTMLAttributes<HTMLTimeElement>,
  'dateTime' | 'children'
> {
  /** The date to display. Accepts an ISO 8601 string, epoch milliseconds, or a Date. A missing value (null, undefined, or empty string) renders a placeholder. */
  date: string | number | Date | null | undefined;
  /**
   * How to render the date:
   * - `absolute` — the full date and time ("Jun 09 2026, 18:42:03 UTC")
   * - `relative` — idiomatic distance from now, in either direction ("2 weeks ago", "next week")
   * - `until` — exact countdown to a future date ("10 days"), a placeholder once it has passed
   * - `since` — exact time elapsed since a past date ("10 days ago"), a placeholder until it arrives
   */
  displayAs?: FormatDateDisplayMode;
  /** Time zone used for absolute formatting. Defaults to "UTC". */
  timeZone?: string;
  /** BCP 47 locale used for formatting. Defaults to "en-US". */
  locale?: string;
  /** Unless absolute, show a tooltip with the absolute time on hover/focus. Defaults to true. */
  tooltip?: boolean;
  /** Unless absolute, re-render on an interval so the value stays current. Defaults to true. */
  live?: boolean;
  /** Override the Intl options used for absolute formatting. */
  absoluteOptions?: Intl.DateTimeFormatOptions;
}

// BCP 47 locale used for all formatting. Explicit so server and client always agree
const DEFAULT_LOCALE = 'en-US';

const DEFAULT_ABSOLUTE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
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

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const YEAR_MS = 365.25 * DAY_MS;
const MONTH_MS = YEAR_MS / 12;

// Below this a span is too short to put a number on
const JUST_NOW_MS = 45_000;

// Beyond a quarter an exact day count reads as noise rather than as a deadline
const COARSE_AFTER_MS = 90 * DAY_MS;

// Shown when no date is provided, as distinct from a date that fails to parse
const NO_DATE_PLACEHOLDER = '---';

// A missing value (null, undefined, or empty/whitespace string) is "no date",
// as opposed to a present-but-unparseable value, which is "Invalid date"
function isMissing(value: string | number | Date | null | undefined): value is null | undefined {
  return value == null || (typeof value === 'string' && value.trim() === '');
}

// Parse any date-like input into a Date, or null if invalid
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
  if (Math.abs(date.getTime() - now.getTime()) < JUST_NOW_MS) return 'Just now';

  let duration = (date.getTime() - now.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return 'Just now';
}

function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

// The largest whole unit of a span, e.g. "10 days". Intl's relative units collapse everything
// from 7 to 10 days into "next week", losing the precision a deadline or a staleness check needs
function formatSpan(spanMs: number, toWhole: (value: number) => number): string {
  if (spanMs < HOUR_MS) return pluralize(toWhole(spanMs / MINUTE_MS), 'minute');
  if (spanMs < DAY_MS) return pluralize(toWhole(spanMs / HOUR_MS), 'hour');
  if (spanMs < COARSE_AFTER_MS) return pluralize(toWhole(spanMs / DAY_MS), 'day');

  const months = Math.round(spanMs / MONTH_MS);
  if (months < 12) return pluralize(months, 'month');

  return pluralize(Math.round(spanMs / YEAR_MS), 'year');
}

// A countdown rounds up, so a date keeps its day count for the whole day leading up to it, while
// elapsed time rounds down, since "10 days ago" should mean at least ten days have gone by
function formatDirected(date: Date, now: Date, mode: 'until' | 'since'): string {
  const spanMs = mode === 'until' ? date.getTime() - now.getTime() : now.getTime() - date.getTime();

  // A date on the wrong side of now has nothing to count, so it reads as absent
  if (spanMs <= 0) return NO_DATE_PLACEHOLDER;
  if (spanMs < JUST_NOW_MS) return 'Just now';

  const span = formatSpan(spanMs, mode === 'until' ? Math.ceil : Math.floor);
  return mode === 'until' ? span : `${span} ago`;
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
  const missing = isMissing(date);
  const parsed = React.useMemo(() => (isMissing(date) ? null : toDate(date)), [date]);
  const [now, setNow] = React.useState(() => new Date());
  const [mounted, setMounted] = React.useState(false);

  // Every mode but absolute is measured from now, so it goes stale as the clock moves
  const isAbsolute = displayAs === 'absolute';

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (isAbsolute || !live) return;
    const id = setInterval(() => setNow(new Date()), LIVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isAbsolute, live]);

  if (missing) {
    return (
      <span className={cn(styles['format-date'], className)} aria-label="No date" {...props}>
        {NO_DATE_PLACEHOLDER}
      </span>
    );
  }

  if (!parsed) {
    return (
      <span className={cn(styles['format-date'], className)} {...props}>
        Invalid date
      </span>
    );
  }

  const machineValue = parsed.toISOString();
  const absolute = formatAbsolute(
    parsed,
    timeZone,
    absoluteOptions ?? DEFAULT_ABSOLUTE_OPTIONS,
    locale
  );

  if (displayAs === 'absolute') {
    return (
      <time dateTime={machineValue} className={cn(styles['format-date'], className)} {...props}>
        {absolute}
      </time>
    );
  }

  // Until mounted, show the absolute string so SSR and first client render match
  const measured = !mounted
    ? absolute
    : displayAs === 'relative'
      ? formatRelative(parsed, now, locale)
      : formatDirected(parsed, now, displayAs);

  if (!tooltip) {
    return (
      <time dateTime={machineValue} className={cn(styles['format-date'], className)} {...props}>
        {measured}
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
            {measured}
          </time>
        </TooltipTrigger>
        <TooltipContent>{absolute}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { FormatDate };
