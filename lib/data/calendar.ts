import { and, desc, eq, gte, lt } from "drizzle-orm";
import { requireDb, expenses, incomeEntries, recurringExpenses } from "@/lib/db";
import { requireUserId } from "@/lib/auth/require-user";
import {
  getBudgetAllocation,
} from "@/lib/finance/budget-service";
import {
  ethiopianToGregorianParts,
  formatEthiopianPeriodLabel,
  getEthiopianMonthBounds,
  gregorianBudgetPeriodForEthiopianMonth,
  gregorianPartsToDateKey,
  gregorianDateKeyToEthiopian,
  type CalendarSystem,
} from "@/lib/finance/ethiopian-calendar";
import {
  dateKeyToGregorianPeriod,
  formatPeriodLabel,
  getMonthBounds,
  toDateKey,
  type BudgetPeriod,
} from "@/lib/finance/period";

export type CalendarExpenseItem = {
  id: string;
  amount: number;
  category: string;
  description: string | null;
};

export type CalendarIncomeItem = {
  id: string;
  amount: number;
  source: string;
  description: string | null;
};

export type CalendarDayData = {
  dateKey: string;
  day: number;
  expenseTotal: number;
  incomeTotal: number;
  expenses: CalendarExpenseItem[];
  income: CalendarIncomeItem[];
  recurringDue: { amount: number; category: string; description: string | null }[];
};

export type CalendarMonthData = {
  year: number;
  month: number;
  calendarSystem: CalendarSystem;
  periodLabel: string;
  budgetPeriodNote: string | null;
  budgetIncome: number | null;
  budgetSavingsGoal: number | null;
  monthExpenseTotal: number;
  monthIncomeTotal: number;
  daysInMonth: number;
  startWeekday: number;
  days: Record<string, CalendarDayData>;
  /** Days in calendar order (1..daysInMonth); avoids grid lookup bugs. */
  orderedDays: CalendarDayData[];
  selectedDateKey: string;
};

function emptyDay(dateKey: string, day: number): CalendarDayData {
  return {
    dateKey,
    day,
    expenseTotal: 0,
    incomeTotal: 0,
    expenses: [],
    income: [],
    recurringDue: [],
  };
}

export async function getCalendarMonthData(
  period: BudgetPeriod,
  selectedDateKey?: string,
  userId?: string,
  calendarSystem: CalendarSystem = "gregorian",
): Promise<CalendarMonthData> {
  const id = userId ?? (await requireUserId());
  const { year, month } = period;

  if (calendarSystem === "ethiopian") {
    return getEthiopianCalendarMonthData(
      period,
      selectedDateKey,
      id,
    );
  }

  const { start, end } = getMonthBounds(year, month);
  const db = requireDb();

  const [expenseRows, incomeRows, recurringRows, allocation] = await Promise.all([
    db.query.expenses.findMany({
      where: and(
        eq(expenses.userId, id),
        gte(expenses.date, start),
        lt(expenses.date, end),
      ),
      orderBy: [desc(expenses.date)],
      with: { category: true },
    }),
    db.query.incomeEntries.findMany({
      where: and(
        eq(incomeEntries.userId, id),
        gte(incomeEntries.date, start),
        lt(incomeEntries.date, end),
      ),
      orderBy: [desc(incomeEntries.date)],
    }),
    db.query.recurringExpenses.findMany({
      where: and(
        eq(recurringExpenses.userId, id),
        eq(recurringExpenses.isActive, true),
        gte(recurringExpenses.nextDueAt, start),
        lt(recurringExpenses.nextDueAt, end),
      ),
      with: { category: true },
    }),
    getBudgetAllocation(id, period),
  ]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = new Date(year, month - 1, 1).getDay();
  const days: Record<string, CalendarDayData> = {};
  const orderedDays: CalendarDayData[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const key = gregorianPartsToDateKey(year, month, d);
    const day = emptyDay(key, d);
    days[key] = day;
    orderedDays.push(day);
  }

  let monthExpenseTotal = 0;
  for (const row of expenseRows) {
    const key = toDateKey(new Date(row.date));
    const day = days[key];
    if (!day) continue;
    const amount = Number(row.amount);
    day.expenses.push({
      id: row.id,
      amount,
      category: row.category.name,
      description: row.description,
    });
    day.expenseTotal += amount;
    monthExpenseTotal += amount;
  }

  let monthIncomeTotal = 0;
  for (const row of incomeRows) {
    const key = toDateKey(new Date(row.date));
    const day = days[key];
    if (!day) continue;
    const amount = Number(row.amount);
    day.income.push({
      id: row.id,
      amount,
      source: row.source,
      description: row.description,
    });
    day.incomeTotal += amount;
    monthIncomeTotal += amount;
  }

  for (const row of recurringRows) {
    const key = toDateKey(new Date(row.nextDueAt));
    const day = days[key];
    if (!day) continue;
    day.recurringDue.push({
      amount: Number(row.amount),
      category: row.category.name,
      description: row.description,
    });
  }

  const todayKey = toDateKey(new Date());
  const todayPeriod = dateKeyToGregorianPeriod(todayKey);
  const defaultSelected =
    days[todayKey] &&
    year === todayPeriod.year &&
    month === todayPeriod.month
      ? todayKey
      : gregorianPartsToDateKey(year, month, 1);

  return {
    year,
    month,
    calendarSystem: "gregorian",
    periodLabel: formatPeriodLabel(year, month),
    budgetPeriodNote: null,
    budgetIncome: allocation?.monthlyIncome ?? null,
    budgetSavingsGoal: allocation?.savingsGoal ?? null,
    monthExpenseTotal,
    monthIncomeTotal,
    daysInMonth,
    startWeekday,
    days,
    orderedDays,
    selectedDateKey: selectedDateKey && days[selectedDateKey]
      ? selectedDateKey
      : defaultSelected,
  };
}

async function getEthiopianCalendarMonthData(
  period: BudgetPeriod,
  selectedDateKey: string | undefined,
  userId: string,
): Promise<CalendarMonthData> {
  const { year, month } = period;
  const { start, end, daysInMonth } = getEthiopianMonthBounds(year, month);
  const db = requireDb();

  const todayEth = gregorianDateKeyToEthiopian(toDateKey(new Date()));
  const budgetPeriod =
    year === todayEth.year && month === todayEth.month
      ? (() => {
          const g = ethiopianToGregorianParts(year, month, todayEth.day);
          return { year: g.year, month: g.month };
        })()
      : gregorianBudgetPeriodForEthiopianMonth(year, month);

  const [expenseRows, incomeRows, recurringRows, allocation] = await Promise.all([
    db.query.expenses.findMany({
      where: and(
        eq(expenses.userId, userId),
        gte(expenses.date, start),
        lt(expenses.date, end),
      ),
      orderBy: [desc(expenses.date)],
      with: { category: true },
    }),
    db.query.incomeEntries.findMany({
      where: and(
        eq(incomeEntries.userId, userId),
        gte(incomeEntries.date, start),
        lt(incomeEntries.date, end),
      ),
      orderBy: [desc(incomeEntries.date)],
    }),
    db.query.recurringExpenses.findMany({
      where: and(
        eq(recurringExpenses.userId, userId),
        eq(recurringExpenses.isActive, true),
        gte(recurringExpenses.nextDueAt, start),
        lt(recurringExpenses.nextDueAt, end),
      ),
      with: { category: true },
    }),
    getBudgetAllocation(userId, budgetPeriod),
  ]);

  const days: Record<string, CalendarDayData> = {};
  const orderedDays: CalendarDayData[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const g = ethiopianToGregorianParts(year, month, d);
    const key = gregorianPartsToDateKey(g.year, g.month, g.day);
    const day = emptyDay(key, d);
    days[key] = day;
    orderedDays.push(day);
  }

  const firstG = ethiopianToGregorianParts(year, month, 1);
  const startWeekday = new Date(
    firstG.year,
    firstG.month - 1,
    firstG.day,
  ).getDay();

  let monthExpenseTotal = 0;
  for (const row of expenseRows) {
    const key = toDateKey(new Date(row.date));
    const day = days[key];
    if (!day) continue;
    const amount = Number(row.amount);
    day.expenses.push({
      id: row.id,
      amount,
      category: row.category.name,
      description: row.description,
    });
    day.expenseTotal += amount;
    monthExpenseTotal += amount;
  }

  let monthIncomeTotal = 0;
  for (const row of incomeRows) {
    const key = toDateKey(new Date(row.date));
    const day = days[key];
    if (!day) continue;
    const amount = Number(row.amount);
    day.income.push({
      id: row.id,
      amount,
      source: row.source,
      description: row.description,
    });
    day.incomeTotal += amount;
    monthIncomeTotal += amount;
  }

  for (const row of recurringRows) {
    const key = toDateKey(new Date(row.nextDueAt));
    const day = days[key];
    if (!day) continue;
    day.recurringDue.push({
      amount: Number(row.amount),
      category: row.category.name,
      description: row.description,
    });
  }

  const defaultEthDay =
    year === todayEth.year && month === todayEth.month ? todayEth.day : 1;
  const defaultG = ethiopianToGregorianParts(year, month, defaultEthDay);
  const defaultSelected = gregorianPartsToDateKey(
    defaultG.year,
    defaultG.month,
    defaultG.day,
  );

  const budgetNote = `Budget from ${formatPeriodLabel(budgetPeriod.year, budgetPeriod.month)} (Gregorian month)`;

  return {
    year,
    month,
    calendarSystem: "ethiopian",
    periodLabel: formatEthiopianPeriodLabel(year, month),
    budgetPeriodNote: allocation ? budgetNote : null,
    budgetIncome: allocation?.monthlyIncome ?? null,
    budgetSavingsGoal: allocation?.savingsGoal ?? null,
    monthExpenseTotal,
    monthIncomeTotal,
    daysInMonth,
    startWeekday,
    days,
    orderedDays,
    selectedDateKey: selectedDateKey && days[selectedDateKey]
      ? selectedDateKey
      : defaultSelected,
  };
}
