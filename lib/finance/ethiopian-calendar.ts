export type EthiopianDate = { year: number; month: number; day: number };

export type CalendarSystem = "gregorian" | "ethiopian";

export const ETHIOPIAN_MONTH_NAMES = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miyazya",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
] as const;

const ETHIOPIAN_EPOCH_JDN = 1723856;

function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/** Ethiopian date → JDN (matches PHP cal_ethiopian / Bahir Dar reference). */
function ethiopianToJdn(year: number, month: number, day: number): number {
  return (
    ETHIOPIAN_EPOCH_JDN +
    365 +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * month +
    day -
    31
  );
}

/** JDN → Ethiopian date (inverse of ethiopianToJdn). */
function jdnToEthiopian(jdn: number): EthiopianDate {
  const offset = jdn - ETHIOPIAN_EPOCH_JDN;
  const r = offset % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor(offset / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  return { year, month, day };
}

export function isEthiopianLeapYear(year: number): boolean {
  return year % 4 === 3;
}

export function daysInEthiopianMonth(year: number, month: number): number {
  if (month < 13) return 30;
  return isEthiopianLeapYear(year) ? 6 : 5;
}

export function gregorianPartsToEthiopian(
  year: number,
  month: number,
  day: number,
): EthiopianDate {
  return jdnToEthiopian(gregorianToJdn(year, month, day));
}

/** Convert YYYY-MM-DD (Gregorian) to Ethiopian date without timezone drift. */
export function gregorianDateKeyToEthiopian(dateKey: string): EthiopianDate {
  const [y, m, d] = dateKey.split("-").map(Number);
  return gregorianPartsToEthiopian(y, m, d);
}

export function gregorianToEthiopian(date: Date): EthiopianDate {
  return gregorianPartsToEthiopian(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
}

export function ethiopianToGregorianParts(
  year: number,
  month: number,
  day: number,
): { year: number; month: number; day: number } {
  return jdnToGregorian(ethiopianToJdn(year, month, day));
}

export function gregorianPartsToDateKey(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function ethiopianToGregorian(
  year: number,
  month: number,
  day: number,
): Date {
  const { year: gy, month: gm, day: gd } = ethiopianToGregorianParts(
    year,
    month,
    day,
  );
  return new Date(gy, gm - 1, gd, 12, 0, 0, 0);
}

export function getCurrentEthiopianPeriod(): EthiopianDate {
  const e = gregorianToEthiopian(new Date());
  return { year: e.year, month: e.month, day: e.day };
}

export function formatEthiopianPeriodLabel(year: number, month: number): string {
  const name = ETHIOPIAN_MONTH_NAMES[month - 1] ?? "";
  return `${name} ${year}`;
}

export function formatEthiopianDayLabel(date: EthiopianDate): string {
  const name = ETHIOPIAN_MONTH_NAMES[date.month - 1] ?? "";
  return `${name} ${date.day}, ${date.year}`;
}

export function getEthiopianMonthBounds(year: number, month: number) {
  const days = daysInEthiopianMonth(year, month);
  const first = ethiopianToGregorianParts(year, month, 1);
  const last = ethiopianToGregorianParts(year, month, days);
  const start = new Date(
    Date.UTC(first.year, first.month - 1, first.day, 0, 0, 0, 0),
  );
  const end = new Date(
    Date.UTC(last.year, last.month - 1, last.day + 1, 0, 0, 0, 0),
  );
  return { start, end, daysInMonth: days };
}

export function shiftEthiopianMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  let y = year;
  let m = month + delta;
  while (m < 1) {
    m += 13;
    y -= 1;
  }
  while (m > 13) {
    m -= 13;
    y += 1;
  }
  return { year: y, month: m };
}

/** Gregorian period used for monthly budget lookup when viewing an Ethiopian month. */
export function gregorianBudgetPeriodForEthiopianMonth(
  year: number,
  month: number,
): { year: number; month: number } {
  const start = ethiopianToGregorian(year, month, 1);
  return { year: start.getFullYear(), month: start.getMonth() + 1 };
}
