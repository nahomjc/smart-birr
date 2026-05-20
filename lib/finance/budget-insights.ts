import { getBudgetAllocation } from "./budget-service";
import { formatBirr, spendingSummary } from "./budget-engine";
import { getMonthlyExpenses } from "./expense-service";
import { APP_TIMEZONE, toDateKey } from "./period";

export type ExpenseWithCategory = {
  amount: string;
  date: Date | string;
  category: { name: string };
  description?: string | null;
};

export type BudgetInsightSnapshot = {
  hasBudget: boolean;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  dailyBudgetGuide: number;
  weeklyBudgetGuide: number;
  todaySpent: number;
  todayByCategory: Record<string, number>;
  dailyBudgetUsedPercent: number | null;
  weekSpent: number;
  weekByCategory: Record<string, number>;
  weeklyBudgetUsedPercent: number | null;
  monthSpent: number;
  monthByCategory: Record<string, number>;
  monthWarnings: string[];
  dangerLevel: "ok" | "caution" | "danger";
  dangerReasons: string[];
  topWeekCategories: { name: string; amount: number }[];
};

function expenseDateKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return toDateKey(d);
}

function startOfWeekKey(todayKey: string): string {
  const d = new Date(`${todayKey}T12:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return toDateKey(d);
}

function sumByCategory(
  rows: ExpenseWithCategory[],
  predicate: (key: string) => boolean,
): { total: number; byCategory: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  let total = 0;
  for (const row of rows) {
    const key = expenseDateKey(row.date);
    if (!predicate(key)) continue;
    const amt = Number(row.amount);
    total += amt;
    const cat = row.category.name;
    byCategory[cat] = (byCategory[cat] ?? 0) + amt;
  }
  return { total, byCategory };
}

export async function getBudgetInsightSnapshot(
  userId: string,
): Promise<BudgetInsightSnapshot> {
  const allocation = await getBudgetAllocation(userId);
  const monthExpenses = await getMonthlyExpenses(userId);
  const monthSummary = spendingSummary(monthExpenses, allocation);

  const todayKey = toDateKey(new Date());
  const weekStartKey = startOfWeekKey(todayKey);

  const today = sumByCategory(monthExpenses, (k) => k === todayKey);
  const week = sumByCategory(
    monthExpenses,
    (k) => k >= weekStartKey && k <= todayKey,
  );

  const monthlyIncome = allocation?.monthlyIncome ?? 0;
  const monthlySavingsGoal = allocation?.savingsGoal ?? 0;
  const hasBudget = allocation != null && monthlyIncome > 0;

  const dailyBudgetGuide = hasBudget ? Math.round(monthlyIncome / 30) : 0;
  const weeklyBudgetGuide = hasBudget
    ? Math.round((monthlyIncome / 30) * 7)
    : 0;

  const dailyBudgetUsedPercent =
    dailyBudgetGuide > 0
      ? Math.min(100, Math.round((today.total / dailyBudgetGuide) * 100))
      : null;

  const weeklyBudgetUsedPercent =
    weeklyBudgetGuide > 0
      ? Math.min(100, Math.round((week.total / weeklyBudgetGuide) * 100))
      : null;

  const dangerReasons: string[] = [];
  let dangerLevel: BudgetInsightSnapshot["dangerLevel"] = "ok";

  if (dailyBudgetUsedPercent != null && dailyBudgetUsedPercent >= 100) {
    dangerReasons.push(
      `Today's spending (${formatBirr(today.total)}) exceeds your daily guide (${formatBirr(dailyBudgetGuide)}).`,
    );
    dangerLevel = "caution";
  }

  if (weeklyBudgetUsedPercent != null && weeklyBudgetUsedPercent >= 85) {
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    if (dayOfWeek <= 5) {
      dangerReasons.push(
        `You've used ${weeklyBudgetUsedPercent}% of your weekly spending guide with several days left.`,
      );
      dangerLevel = "danger";
    }
  }

  for (const w of monthSummary.warnings) {
    dangerReasons.push(w);
    dangerLevel = dangerLevel === "danger" ? "danger" : "caution";
  }

  const topWeekCategories = Object.entries(week.byCategory)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return {
    hasBudget,
    monthlyIncome,
    monthlySavingsGoal,
    dailyBudgetGuide,
    weeklyBudgetGuide,
    todaySpent: today.total,
    todayByCategory: today.byCategory,
    dailyBudgetUsedPercent,
    weekSpent: week.total,
    weekByCategory: week.byCategory,
    weeklyBudgetUsedPercent,
    monthSpent: monthSummary.total,
    monthByCategory: monthSummary.byCategory,
    monthWarnings: monthSummary.warnings,
    dangerLevel,
    dangerReasons,
    topWeekCategories,
  };
}

/** Plain-text block for the AI counselor (today + budget judgment). */
export function buildTodaySpendingContextForAI(
  snapshot: BudgetInsightSnapshot,
  todayTransactions: string[],
): string[] {
  const todayKey = toDateKey(new Date());
  const lines: string[] = [];

  lines.push(`=== Today (${todayKey}, timezone: ${APP_TIMEZONE}) ===`);
  lines.push(`Total spent today: ${formatBirr(snapshot.todaySpent)}`);

  if (snapshot.hasBudget) {
    lines.push(
      `Daily spending guide (monthly income ÷ 30): ${formatBirr(snapshot.dailyBudgetGuide)}`,
    );
    if (snapshot.dailyBudgetUsedPercent != null) {
      lines.push(
        `Today vs daily guide: ${snapshot.dailyBudgetUsedPercent}% of guide used`,
      );
    }
    lines.push(
      `This week: ${formatBirr(snapshot.weekSpent)} spent (guide ${formatBirr(snapshot.weeklyBudgetGuide)}${snapshot.weeklyBudgetUsedPercent != null ? `, ${snapshot.weeklyBudgetUsedPercent}% used` : ""})`,
    );
    lines.push(
      `Month so far: ${formatBirr(snapshot.monthSpent)} of ${formatBirr(snapshot.monthlyIncome)} planned income`,
    );
    if (snapshot.monthlySavingsGoal > 0) {
      lines.push(`Monthly savings goal: ${formatBirr(snapshot.monthlySavingsGoal)}`);
    }
  } else {
    lines.push("No monthly budget set — user should add income in Settings.");
  }

  if (Object.keys(snapshot.todayByCategory).length > 0) {
    lines.push("Today by category:");
    for (const [cat, amt] of Object.entries(snapshot.todayByCategory).sort(
      (a, b) => b[1] - a[1],
    )) {
      lines.push(`  ${cat}: ${formatBirr(amt)}`);
    }
  }

  if (todayTransactions.length > 0) {
    lines.push("Today's transactions (newest first):");
    lines.push(...todayTransactions);
  } else if (snapshot.todaySpent === 0) {
    lines.push("No expenses logged today yet.");
  }

  lines.push("Coach judgment (use these facts; do not invent numbers):");
  if (!snapshot.hasBudget) {
    lines.push(
      "  Ask user to set monthly income so you can judge daily/weekly pace.",
    );
  } else if (snapshot.todaySpent === 0) {
    lines.push(
      "  On track today — nothing spent yet. Encourage staying within the daily guide.",
    );
  } else if (snapshot.dangerLevel === "danger") {
    for (const r of snapshot.dangerReasons) {
      lines.push(`  - ${r}`);
    }
    lines.push(
      "  Verdict: spending pace is too high. Suggest pausing non-essential buys for 2–3 days.",
    );
  } else if (snapshot.dangerLevel === "caution") {
    for (const r of snapshot.dangerReasons) {
      lines.push(`  - ${r}`);
    }
    lines.push(
      "  Verdict: be careful — close to or over guide. Suggest smaller spending tomorrow.",
    );
  } else if (
    snapshot.dailyBudgetUsedPercent != null &&
    snapshot.dailyBudgetUsedPercent >= 70
  ) {
    lines.push(
      `  Verdict: moderate — ${snapshot.dailyBudgetUsedPercent}% of daily guide used. Watch discretionary categories.`,
    );
  } else {
    lines.push(
      "  Verdict: on track today relative to daily guide and monthly budget.",
    );
  }

  if (snapshot.monthWarnings.length > 0) {
    lines.push("Monthly category alerts:");
    for (const w of snapshot.monthWarnings) {
      lines.push(`  - ${w}`);
    }
  }

  return lines;
}

export function formatDailySummaryTelegram(
  snapshot: BudgetInsightSnapshot,
): string {
  if (snapshot.todaySpent === 0) {
    return "";
  }

  let msg = `🌙 <b>Daily Budget Summary</b>\n\nToday you spent ${formatBirr(snapshot.todaySpent)}.\n\n<b>Breakdown:</b>\n`;
  for (const [cat, amt] of Object.entries(snapshot.todayByCategory).sort(
    (a, b) => b[1] - a[1],
  )) {
    msg += `• ${cat}: ${formatBirr(amt)}\n`;
  }

  if (
    snapshot.dailyBudgetUsedPercent != null &&
    snapshot.dailyBudgetUsedPercent >= 70
  ) {
    msg += `\n⚠️ <b>Budget note</b>\nYou've used ${snapshot.dailyBudgetUsedPercent}% of today's spending guide.`;
    if (snapshot.weeklyBudgetUsedPercent != null && snapshot.weeklyBudgetUsedPercent >= 70) {
      msg += ` Weekly pace is also high (${snapshot.weeklyBudgetUsedPercent}%).`;
    }
    msg +=
      "\n\nTry to reduce non-essential purchases tomorrow and focus on priority expenses.";
  }

  return msg;
}

export function formatDangerAlertTelegram(
  snapshot: BudgetInsightSnapshot,
): string | null {
  if (snapshot.dangerLevel === "ok" || snapshot.dangerReasons.length === 0) {
    return null;
  }

  let msg = "⚠️ <b>Your budget needs attention</b>\n\n";
  for (const r of snapshot.dangerReasons.slice(0, 4)) {
    msg += `• ${r}\n`;
  }
  if (snapshot.topWeekCategories.length) {
    msg += "\n<b>High spending this week:</b>\n";
    for (const c of snapshot.topWeekCategories) {
      msg += `• ${c.name}: ${formatBirr(c.amount)}\n`;
    }
  }
  msg +=
    "\n<b>Suggested action:</b>\nPause unnecessary expenses for the next 2–3 days to recover your balance.";
  return msg;
}

export function formatExpenseLoggedTelegram(
  category: string,
  amount: number,
  snapshot: BudgetInsightSnapshot,
): string {
  let msg = `✅ <b>Expense logged</b>

📂 <b>Category:</b> ${category}
💵 <b>Amount:</b> ${formatBirr(amount)}`;

  if (snapshot.dailyBudgetUsedPercent != null) {
    msg += `

📊 <b>Today&apos;s pace</b>
• Used <b>${snapshot.dailyBudgetUsedPercent}%</b> of your daily guide
• <code>${formatBirr(snapshot.todaySpent)}</code> / <code>${formatBirr(snapshot.dailyBudgetGuide)}</code>`;
  }

  if (snapshot.monthlySavingsGoal > 0 && snapshot.hasBudget) {
    const remaining = Math.max(0, snapshot.monthlyIncome - snapshot.monthSpent);
    if (remaining < snapshot.monthlySavingsGoal) {
      msg += `

💡 <b>Tip</b>
• Stay mindful — your savings goal is <code>${formatBirr(snapshot.monthlySavingsGoal)}</code> this month`;
    }
  }

  return msg;
}
