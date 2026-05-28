import { addDays, format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";

const formatLocalDateIso = (value: Date): string => format(value, "yyyy-MM-dd");

export const getTodayIso = (value: Date = new Date()): string => formatLocalDateIso(value);

export const getTomorrowIso = (value: Date = new Date()): string =>
  formatLocalDateIso(addDays(value, 1));

export const getNowIso = (): string => new Date().toISOString();

export const compareIsoDate = (left: string, right: string): number =>
  left === right ? 0 : left < right ? -1 : 1;

export const formatDateLabel = (value: string): string => {
  const parsed = parseISO(value);

  if (isToday(parsed)) {
    return "Today";
  }

  if (isTomorrow(parsed)) {
    return "Tomorrow";
  }

  if (isYesterday(parsed)) {
    return "Yesterday";
  }

  return format(parsed, "EEE, MMM d");
};

export const formatLongDateLabel = (value: string): string =>
  format(parseISO(value), "EEEE, MMMM d");

export const isBeforeToday = (value: string, today: string = getTodayIso()): boolean =>
  compareIsoDate(value, today) < 0;

export const isAfterToday = (value: string, today: string = getTodayIso()): boolean =>
  compareIsoDate(value, today) > 0;

export const isTodayDate = (value: string, today: string = getTodayIso()): boolean =>
  compareIsoDate(value, today) === 0;
