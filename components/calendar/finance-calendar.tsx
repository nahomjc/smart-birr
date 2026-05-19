"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import type { CalendarMonthData } from "@/lib/data/calendar";
import { formatBirr } from "@/lib/finance/budget-engine";
import {
  formatEthiopianDayLabel,
  gregorianDateKeyToEthiopian,
  shiftEthiopianMonth,
} from "@/lib/finance/ethiopian-calendar";
import {
  buildCalendarUrl,
  dateKeyToGregorianPeriod,
  dateKeyToLocalDate,
  getTodayCalendarUrl,
  shiftMonth,
  toDateKey,
} from "@/lib/finance/period";
import { theme } from "@/lib/theme";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  data: CalendarMonthData;
};

function hasActivity(day: CalendarMonthData["days"][string]) {
  return (
    day.expenseTotal > 0 ||
    day.incomeTotal > 0 ||
    day.recurringDue.length > 0
  );
}

function gregorianDayLabel(date: Date) {
  return date.toLocaleDateString("en-ET", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function FinanceCalendar({ data }: Props) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState(data.selectedDateKey);

  useEffect(() => {
    setSelectedKey(data.selectedDateKey);
  }, [data.selectedDateKey]);

  const selected = data.days[selectedKey];
  const isEthiopian = data.calendarSystem === "ethiopian";
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const todayEthiopian = useMemo(
    () => gregorianDateKeyToEthiopian(todayKey),
    [todayKey],
  );

  const isTodayCell = (day: CalendarMonthData["days"][string]) =>
    isEthiopian
      ? data.year === todayEthiopian.year &&
        data.month === todayEthiopian.month &&
        day.day === todayEthiopian.day
      : day.dateKey === todayKey;
  const system = data.calendarSystem;

  const anchorDateKey =
    selectedKey && data.days[selectedKey] ? selectedKey : todayKey;

  const prev = isEthiopian
    ? shiftEthiopianMonth(data.year, data.month, -1)
    : shiftMonth(data.year, data.month, -1);
  const next = isEthiopian
    ? shiftEthiopianMonth(data.year, data.month, 1)
    : shiftMonth(data.year, data.month, 1);

  const monthHref = (y: number, m: number) =>
    buildCalendarUrl(system, { year: y, month: m }, anchorDateKey);

  const todayHref = getTodayCalendarUrl(system);

  const switchCalendarHref = (target: "gregorian" | "ethiopian") => {
    if (target === data.calendarSystem) {
      return buildCalendarUrl(
        system,
        { year: data.year, month: data.month },
        anchorDateKey,
      );
    }
    if (target === "ethiopian") {
      const e = gregorianDateKeyToEthiopian(anchorDateKey);
      return buildCalendarUrl(
        "ethiopian",
        { year: e.year, month: e.month },
        anchorDateKey,
      );
    }
    return buildCalendarUrl(
      "gregorian",
      dateKeyToGregorianPeriod(anchorDateKey),
      anchorDateKey,
    );
  };

  const cells: (CalendarMonthData["days"][string] | null)[] = [];
  for (let i = 0; i < data.startWeekday; i++) cells.push(null);
  for (const day of data.orderedDays) {
    cells.push(day);
  }

  const selectedGregorian = selected
    ? dateKeyToLocalDate(selected.dateKey)
    : null;
  const selectedEthiopian = selected
    ? gregorianDateKeyToEthiopian(selected.dateKey)
    : null;

  return (
    <div className="space-y-6">
      <div
        role="group"
        aria-label="Calendar system"
        className="inline-flex rounded-lg border border-emerald-900/40 p-0.5"
      >
        <Link
          href={switchCalendarHref("gregorian")}
          className={`rounded-md px-3 py-1.5 text-sm transition ${
            !isEthiopian
              ? "bg-emerald-950/80 text-emerald-300"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Gregorian
        </Link>
        <Link
          href={switchCalendarHref("ethiopian")}
          className={`rounded-md px-3 py-1.5 text-sm transition ${
            isEthiopian
              ? "bg-emerald-950/80 text-emerald-300"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Ethiopian
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href={monthHref(prev.year, prev.month)}
            className="rounded-lg border border-emerald-900/40 px-3 py-1.5 text-sm text-zinc-300 hover:bg-emerald-950/40"
          >
            Prev
          </Link>
          <h2 className="min-w-[10rem] text-center text-lg font-semibold text-zinc-100">
            {data.periodLabel}
          </h2>
          <Link
            href={monthHref(next.year, next.month)}
            className="rounded-lg border border-emerald-900/40 px-3 py-1.5 text-sm text-zinc-300 hover:bg-emerald-950/40"
          >
            Next
          </Link>
        </div>
        <button
          type="button"
          onClick={() => router.push(todayHref)}
          className="text-sm text-emerald-400 hover:underline"
        >
          Today
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className={`text-sm ${theme.subtext}`}>Spent this month</p>
          <p className="mt-1 text-xl font-semibold text-emerald-400">
            {formatBirr(data.monthExpenseTotal)}
          </p>
        </Card>
        <Card>
          <p className={`text-sm ${theme.subtext}`}>Income logged</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {formatBirr(data.monthIncomeTotal)}
          </p>
        </Card>
        <Card>
          <p className={`text-sm ${theme.subtext}`}>Budget (month)</p>
          <p className="mt-1 text-xl font-semibold text-zinc-100">
            {data.budgetIncome != null
              ? formatBirr(data.budgetIncome)
              : "Not set"}
          </p>
          {data.budgetSavingsGoal != null && (
            <p className={`mt-1 text-xs ${theme.subtext}`}>
              Savings goal {formatBirr(data.budgetSavingsGoal)}
            </p>
          )}
          {data.budgetPeriodNote && (
            <p className={`mt-1 text-xs ${theme.subtext}`}>
              {data.budgetPeriodNote}
            </p>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500">
          {WEEKDAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
            const active = hasActivity(day);
            const isSelected = day.dateKey === selectedKey;
            const isToday = isTodayCell(day);

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedKey(day.dateKey)}
                className={`aspect-square rounded-lg border p-1 text-left text-xs transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/60 ring-1 ring-emerald-500/50"
                    : "border-emerald-900/20 bg-[#0a1210] hover:border-emerald-700/40"
                } ${isToday ? "ring-2 ring-emerald-500/70" : ""}`}
              >
                <span
                  className={`font-medium ${isToday ? "text-emerald-400" : "text-zinc-300"}`}
                >
                  {day.day}
                </span>
                {active && (
                  <div className="mt-0.5 space-y-0.5">
                    {day.expenseTotal > 0 && (
                      <p className="truncate text-[10px] text-red-300/90">
                        -{day.expenseTotal.toLocaleString()}
                      </p>
                    )}
                    {day.incomeTotal > 0 && (
                      <p className="truncate text-[10px] text-emerald-400/90">
                        +{day.incomeTotal.toLocaleString()}
                      </p>
                    )}
                    {day.recurringDue.length > 0 && day.expenseTotal === 0 && (
                      <p className="text-[10px] text-amber-400/90">due</p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {selected && (
        <Card>
          <h3 className="mb-1 font-medium text-zinc-100">
            {isEthiopian && selectedEthiopian
              ? formatEthiopianDayLabel(selectedEthiopian)
              : selectedGregorian
                ? gregorianDayLabel(selectedGregorian)
                : null}
          </h3>
          {selectedGregorian && selectedEthiopian && (
            <p className={`mb-4 text-sm ${theme.subtext}`}>
              {isEthiopian
                ? gregorianDayLabel(selectedGregorian)
                : `${formatEthiopianDayLabel(selectedEthiopian)} (Ethiopian)`}
            </p>
          )}

          {selected.expenses.length === 0 &&
          selected.income.length === 0 &&
          selected.recurringDue.length === 0 ? (
            <p className={`text-sm ${theme.subtext}`}>
              Nothing logged for this day. Add an expense from{" "}
              <Link href="/dashboard/expenses" className="text-emerald-400 hover:underline">
                Expenses
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-6">
              {selected.expenses.length > 0 && (
                <section>
                  <h4 className="mb-2 text-sm font-medium text-red-300/90">
                    Expenses ({formatBirr(selected.expenseTotal)})
                  </h4>
                  <ul className="divide-y divide-emerald-900/30">
                    {selected.expenses.map((e) => (
                      <li
                        key={e.id}
                        className="flex justify-between gap-2 py-2 text-sm"
                      >
                        <span>
                          <span className="text-zinc-100">{e.category}</span>
                          {e.description && (
                            <span className={`ml-2 ${theme.subtext}`}>
                              {e.description}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-red-300/90">
                          {e.amount.toLocaleString()} ETB
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {selected.income.length > 0 && (
                <section>
                  <h4 className="mb-2 text-sm font-medium text-emerald-400">
                    Income ({formatBirr(selected.incomeTotal)})
                  </h4>
                  <ul className="divide-y divide-emerald-900/30">
                    {selected.income.map((e) => (
                      <li
                        key={e.id}
                        className="flex justify-between gap-2 py-2 text-sm"
                      >
                        <span className="text-zinc-100">{e.source}</span>
                        <span className="shrink-0 text-emerald-400">
                          +{e.amount.toLocaleString()} ETB
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {selected.recurringDue.length > 0 && (
                <section>
                  <h4 className="mb-2 text-sm font-medium text-amber-300">
                    Recurring due
                  </h4>
                  <ul className="divide-y divide-emerald-900/30">
                    {selected.recurringDue.map((r, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between gap-2 py-2 text-sm"
                      >
                        <span className="text-zinc-100">{r.category}</span>
                        <span className="text-amber-300/90">
                          {r.amount.toLocaleString()} ETB
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
