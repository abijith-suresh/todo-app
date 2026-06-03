export const getNowIso = (): string => new Date().toISOString();

export const getTodayLocalIso = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isSameDay = (isoDate: string, isoDate2: string): boolean =>
  isoDate.slice(0, 10) === isoDate2.slice(0, 10);

export const isBeforeToday = (isoDate: string, today?: string): boolean =>
  isoDate.slice(0, 10) < (today ?? getTodayLocalIso());

export const isAfterDays = (isoDate: string, days: number): boolean => {
  const then = new Date(isoDate.slice(0, 10) + "T00:00:00");
  const now = new Date();
  then.setDate(then.getDate() + days);
  return now >= then;
};
