export const getNowIso = (): string => new Date().toISOString();

export const getTodayLocalIso = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toLocalDateIso = (isoDate: string): string => {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isSameDay = (isoDate: string, localDateStr: string): boolean =>
  toLocalDateIso(isoDate) === localDateStr;

export const isAfterDays = (isoDate: string, days: number): boolean => {
  const localDate = toLocalDateIso(isoDate);
  const then = new Date(`${localDate}T00:00:00`);
  then.setDate(then.getDate() + days);
  return new Date() >= then;
};
