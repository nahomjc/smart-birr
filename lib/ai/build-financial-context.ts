import { eq } from "drizzle-orm";
import { requireDb, users } from "@/lib/db";
import { listPlanningGoals } from "@/lib/data/planning-goals";
import { getBudgetAllocation } from "@/lib/finance/budget-service";
import {
  buildTodaySpendingContextForAI,
  getBudgetInsightSnapshot,
} from "@/lib/finance/budget-insights";
import { formatBirr, spendingSummary } from "@/lib/finance/budget-engine";
import { getMonthlyExpenses } from "@/lib/finance/expense-service";
import { getMonthlyIncomeTotal } from "@/lib/finance/income-service";
import { getCurrentPeriod, toDateKey } from "@/lib/finance/period";
import { getActiveRecurringExpenses } from "@/lib/finance/recurring-service";

function formatPeriodLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString("en-ET", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-ET", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Structured snapshot of the user's finances for the AI counselor system prompt.
 */
export async function buildFinancialContextForUser(
  userId: string,
): Promise<string> {
  const db = requireDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) return "";

  const period = getCurrentPeriod();
  const periodLabel = formatPeriodLabel(period.year, period.month);

  const [expenses, allocation, loggedIncome, recurring, planningGoals, snapshot] =
    await Promise.all([
      getMonthlyExpenses(userId),
      getBudgetAllocation(userId),
      getMonthlyIncomeTotal(userId),
      getActiveRecurringExpenses(userId),
      listPlanningGoals(userId, {
        status: ["active", "paused", "completed"],
      }),
      getBudgetInsightSnapshot(userId),
    ]);

  const summary = spendingSummary(expenses, allocation);
  const todayKey = toDateKey(new Date());
  const todayTransactions = expenses
    .filter((e) => toDateKey(new Date(e.date)) === todayKey)
    .map(
      (e) =>
        `  ${e.category.name}: ${formatBirr(Number(e.amount))}${e.description ? ` (${e.description})` : ""}`,
    );
  const budgetIncome = allocation?.monthlyIncome ?? null;
  const remaining =
    budgetIncome != null ? Math.max(0, budgetIncome - summary.total) : null;

  const sections: string[] = [];

  sections.push("=== Profile ===");
  sections.push(`Name: ${user.name ?? "User"}`);
  sections.push(`Currency: ${user.currency}`);
  if (user.income) {
    sections.push(`Stored monthly income (profile): ${user.income} ${user.currency}`);
  }

  sections.push("");
  sections.push(`=== Monthly budget (${periodLabel}) ===`);
  if (!allocation) {
    sections.push(
      "No budget saved for this month. User should set income and limits in Settings or say their income in chat.",
    );
  } else {
    sections.push(`Planned monthly income: ${formatBirr(allocation.monthlyIncome)}`);
    sections.push(`Monthly savings goal: ${formatBirr(allocation.savingsGoal)}`);
    sections.push(
      `Emergency fund target: ${formatBirr(allocation.emergencyFund)}`,
    );
    const limitLines = Object.entries(allocation.categoryLimits)
      .filter(([, limit]) => limit > 0)
      .map(([name, limit]) => {
        const spent = summary.byCategory[name] ?? 0;
        return `  ${name}: spent ${formatBirr(spent)} / limit ${formatBirr(limit)}`;
      });
    if (limitLines.length) {
      sections.push("Category limits (spent vs limit):");
      sections.push(...limitLines);
    }
  }

  sections.push("");
  sections.push(...buildTodaySpendingContextForAI(snapshot, todayTransactions));

  sections.push("");
  sections.push(`=== Spending this month (${periodLabel}) ===`);
  sections.push(`Total spent: ${formatBirr(summary.total)}`);
  if (loggedIncome > 0) {
    sections.push(`Income logged this month: ${formatBirr(loggedIncome)}`);
  }
  if (remaining != null) {
    sections.push(
      `Estimated remaining from planned income: ${formatBirr(remaining)}`,
    );
  }
  if (summary.warnings.length) {
    sections.push("Budget alerts:");
    for (const w of summary.warnings) {
      sections.push(`  - ${w}`);
    }
  }

  const activeGoals = planningGoals.filter((g) => g.status === "active");
  const pausedGoals = planningGoals.filter((g) => g.status === "paused");
  const completedGoals = planningGoals.filter((g) => g.status === "completed");

  sections.push("");
  sections.push("=== Planning vision (savings toward specific purchases) ===");
  if (planningGoals.length === 0) {
    sections.push(
      "No planning goals yet. User can add goals (e.g. laptop) under Planning.",
    );
  } else {
    const describeGoal = (g: (typeof planningGoals)[0]) => {
      const { savedTotal, percent, remaining: left } = g.progress;
      let line = `  "${g.title}": ${formatBirr(savedTotal)} / ${formatBirr(g.targetAmount)} (${percent}%)`;
      if (g.status !== "active") line += ` [${g.status}]`;
      if (g.targetDate) line += `, target by ${formatDate(g.targetDate)}`;
      if (left > 0) line += `, ${formatBirr(left)} left`;
      if (g.monthsLeftHint != null) {
        line += ` (~${g.monthsLeftHint} mo at current monthly savings goal)`;
      }
      if (g.description) line += ` — ${g.description}`;
      return line;
    };
    if (activeGoals.length) {
      sections.push("Active goals:");
      sections.push(...activeGoals.map(describeGoal));
    }
    if (pausedGoals.length) {
      sections.push("Paused goals:");
      sections.push(...pausedGoals.map(describeGoal));
    }
    if (completedGoals.length) {
      sections.push(
        `Completed goals: ${completedGoals.length} (${completedGoals.map((g) => g.title).join(", ")})`,
      );
    }
  }

  sections.push("");
  sections.push("=== Recurring bills (active) ===");
  if (recurring.length === 0) {
    sections.push("None scheduled.");
  } else {
    for (const r of recurring) {
      sections.push(
        `  ${r.category.name}: ${formatBirr(Number(r.amount))} ${r.frequency}, next due ${formatDate(r.nextDueAt)}${r.description ? ` (${r.description})` : ""}`,
      );
    }
  }

  sections.push("");
  sections.push("=== Recent expenses (this month, newest first) ===");
  if (expenses.length === 0) {
    sections.push("No expenses logged this month yet.");
  } else {
    for (const e of expenses.slice(0, 12)) {
      sections.push(
        `  ${formatDate(e.date)} — ${e.category.name}: ${formatBirr(Number(e.amount))}${e.description ? ` (${e.description})` : ""}`,
      );
    }
    if (expenses.length > 12) {
      sections.push(`  … and ${expenses.length - 12} more`);
    }
  }

  sections.push("");
  sections.push(
    "Use this data for personalized advice. Distinguish monthly budget savings from planning-vision goals. Be specific with ETB amounts when relevant. When the user asks about today's spending, answer from the Today section first, then give a clear judgment (on track / caution / over budget) using Coach judgment and category limits.",
  );

  return sections.join("\n");
}
