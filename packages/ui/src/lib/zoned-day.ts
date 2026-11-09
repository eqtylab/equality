/**
 * Calendar days cut in an IANA time zone, for pickers that hand back instants. A day is the
 * wall-clock date a reader sees, so it never goes through the browser's own zone, whose clock
 * changes would move midnight under the reader.
 */

export type Day = { year: number; month: number; day: number };

const formatters = new Map<string, Intl.DateTimeFormat>();

const formatterFor = (timeZone: string | undefined) => {
  const key = timeZone ?? '';
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    formatters.set(key, formatter);
  }
  return formatter;
};

// The day an instant falls on in timeZone, or in the browser's zone when none is given
export const dayOf = (instant: Date, timeZone?: string): Day => {
  const parts = formatterFor(timeZone).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { year: part('year'), month: part('month') - 1, day: part('day') };
};

export const dayKey = ({ year, month, day }: Day) => year * 10000 + month * 100 + day;

// Calendar arithmetic in UTC, which has no clock changes
export const addDays = ({ year, month, day }: Day, count: number): Day => {
  const date = new Date(Date.UTC(year, month, day + count));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate() };
};

// Every zone sits within 14 hours of UTC, so a day starts within this window of its UTC midnight
const SEARCH_WINDOW = 15 * 60 * 60 * 1000;

// A day's first instant: its midnight, or where a clock change skips midnight, the first time after
export const startOfDay = (target: Day, timeZone?: string): Date => {
  const key = dayKey(target);
  const utcMidnight = Date.UTC(target.year, target.month, target.day);
  let low = utcMidnight - SEARCH_WINDOW;
  let high = utcMidnight + SEARCH_WINDOW;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (dayKey(dayOf(new Date(middle), timeZone)) < key) low = middle + 1;
    else high = middle;
  }
  return new Date(low);
};

export const endOfDay = (target: Day, timeZone?: string): Date =>
  new Date(startOfDay(addDays(target, 1), timeZone).getTime() - 1);
