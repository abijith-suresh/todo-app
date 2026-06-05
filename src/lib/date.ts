export const getNowIso = (): string => new Date().toISOString();

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayLocalIso = (): string => formatLocalDate(new Date());

export const toLocalDateIso = (isoDate: string): string => formatLocalDate(new Date(isoDate));

export const isSameDay = (isoDate: string, localDateStr: string): boolean =>
  toLocalDateIso(isoDate) === localDateStr;

export const isOlderThanDays = (isoDate: string, days: number): boolean => {
  const localDate = toLocalDateIso(isoDate);
  const then = new Date(`${localDate}T00:00:00`);
  then.setDate(then.getDate() + days);
  return new Date() >= then;
};
