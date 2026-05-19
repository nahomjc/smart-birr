import {
  gregorianDateKeyToEthiopian,
  type CalendarSystem,
} from "./ethiopian-calendar";

export type BudgetPeriod = { year: number; month: number };

export function getCurrentPeriod(date = new Date()): BudgetPeriod {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function getMonthStart(date = new Date()): Date {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
}

export function formatPeriodLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-ET", {
    month: "long",
    year: "numeric",
  });
}

/** App timezone for expense/calendar dates (Ethiopia). */
export const APP_TIMEZONE = "Africa/Addis_Ababa";

export function toDateKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
}

export function dateKeyToLocalDate(dateKey: string): Date {
  const { year, month, day } = parseDateKey(dateKey);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function isValidDateKey(day?: string): day is string {
  return !!day && /^\d{4}-\d{2}-\d{2}$/.test(day);
}

export function parseDateKey(dateKey: string): {
  year: number;
  month: number;
  day: number;
} {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

export function dateKeyToGregorianPeriod(dateKey: string): BudgetPeriod {
  const { year, month } = parseDateKey(dateKey);
  return { year, month };
}

export function parseCalendarSystem(
  cal?: string,
): CalendarSystem {
  return cal === "ethiopian" ? "ethiopian" : "gregorian";
}

export type CalendarSearchParams = {
  year?: string;
  month?: string;
  /** Ethiopian calendar year (use with cal=ethiopian) */
  ey?: string;
  /** Ethiopian calendar month 1–13 (use with cal=ethiopian) */
  em?: string;
  cal?: string;
  day?: string;
};

function parseGregorianPeriod(params: CalendarSearchParams): BudgetPeriod {
  if (isValidDateKey(params.day)) {
    return dateKeyToGregorianPeriod(params.day);
  }
  const current = getCurrentPeriod();
  const year = Number(params.year);
  const month = Number(params.month);
  if (!year || !month || month < 1 || month > 12) {
    return current;
  }
  return { year, month };
}

function getTodayEthiopianPeriod(): BudgetPeriod {
  const e = gregorianDateKeyToEthiopian(toDateKey(new Date()));
  return { year: e.year, month: e.month };
}

function parseEthiopianPeriod(params: CalendarSearchParams): BudgetPeriod {
  const today = getTodayEthiopianPeriod();
  const current = { year: today.year, month: today.month };

  // Selected day is authoritative (fixes toggle with stale ey/year in URL)
  if (isValidDateKey(params.day)) {
    const e = gregorianDateKeyToEthiopian(params.day);
    return { year: e.year, month: e.month };
  }

  const ey = Number(params.ey);
  const em = Number(params.em);
  if (ey && em && em >= 1 && em <= 13) {
    return { year: ey, month: em };
  }

  return current;
}

export function parseCalendarMonth(params: CalendarSearchParams): BudgetPeriod {
  const system = parseCalendarSystem(params.cal);
  return system === "ethiopian"
    ? parseEthiopianPeriod(params)
    : parseGregorianPeriod(params);
}

/** Build calendar URL with the correct year/month params per calendar system. */
export function buildCalendarUrl(
  system: CalendarSystem,
  period: BudgetPeriod,
  day?: string,
): string {
  const q = new URLSearchParams();
  if (system === "ethiopian") {
    q.set("cal", "ethiopian");
    q.set("ey", String(period.year));
    q.set("em", String(period.month));
  } else {
    q.set("year", String(period.year));
    q.set("month", String(period.month));
  }
  if (day) {
    q.set("day", day);
  }
  return `/dashboard/calendar?${q.toString()}`;
}

export function getTodayCalendarUrl(system: CalendarSystem = "gregorian"): string {
  const day = toDateKey(new Date());
  if (system === "ethiopian") {
    const e = gregorianDateKeyToEthiopian(day);
    return buildCalendarUrl("ethiopian", { year: e.year, month: e.month }, day);
  }
  const g = getCurrentPeriod();
  return buildCalendarUrl("gregorian", g, day);
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): BudgetPeriod {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export function advanceDueDate(
  due: Date,
  frequency: "monthly" | "weekly",
): Date {
  const next = new Date(due);
  if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}
