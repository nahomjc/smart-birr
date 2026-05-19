import { isNotNull } from "drizzle-orm";
import { requireDb, users } from "@/lib/db";
import {
  formatBirr,
  spendingSummary,
} from "@/lib/finance/budget-engine";
import { getBudgetAllocation } from "@/lib/finance/budget-service";
import {
  formatDailySummaryTelegram,
  formatDangerAlertTelegram,
  getBudgetInsightSnapshot,
} from "@/lib/finance/budget-insights";
import { getMonthlyExpenses } from "@/lib/finance/expense-service";
import { formatPeriodLabel, getCurrentPeriod } from "@/lib/finance/period";
import { createNotification } from "@/lib/notifications/create-notification";
import { sendTelegramMessage } from "@/lib/telegram/bot";

async function listTelegramUsers() {
  const db = requireDb();
  return db.query.users.findMany({
    where: isNotNull(users.telegramId),
    columns: {
      id: true,
      telegramId: true,
      name: true,
    },
  });
}

export async function runNightlyTelegramJobs() {
  const telegramUsers = await listTelegramUsers();
  let sent = 0;

  for (const user of telegramUsers) {
    const chatId = user.telegramId;
    if (!chatId) continue;

    try {
      const snapshot = await getBudgetInsightSnapshot(user.id);

      if (snapshot.todaySpent === 0) {
        const reminder = `📝 <b>Daily reminder</b>\n\nDon't forget to log today's expenses.\n\nTracking spending daily helps me improve your plan and savings tips.\n\nExample: <i>Spent 500 birr on lunch</i>`;
        await sendTelegramMessage(chatId, reminder);
        await createNotification(user.id, {
          type: "expense_reminder",
          title: "Log today's expenses",
          message: reminder.replace(/<[^>]+>/g, ""),
        });
        sent++;
        continue;
      }

      const summary = formatDailySummaryTelegram(snapshot);
      if (summary) {
        await sendTelegramMessage(chatId, summary);
        await createNotification(user.id, {
          type: "daily_summary",
          title: "Daily budget summary",
          message: summary.replace(/<[^>]+>/g, "").slice(0, 500),
        });
        sent++;
      }

      const danger = formatDangerAlertTelegram(snapshot);
      if (danger && snapshot.dangerLevel !== "ok") {
        await sendTelegramMessage(chatId, danger);
        await createNotification(user.id, {
          type: "budget_danger",
          title: "Budget warning",
          message: danger.replace(/<[^>]+>/g, "").slice(0, 500),
        });
        sent++;
      }
    } catch (e) {
      console.error(`Nightly job failed for user ${user.id}:`, e);
    }
  }

  return { users: telegramUsers.length, messagesSent: sent };
}

export async function runWeeklyTelegramReports() {
  const telegramUsers = await listTelegramUsers();
  const period = getCurrentPeriod();
  let sent = 0;

  for (const user of telegramUsers) {
    const chatId = user.telegramId;
    if (!chatId) continue;

    try {
      const monthExpenses = await getMonthlyExpenses(user.id);
      const allocation = await getBudgetAllocation(user.id);
      const { total, byCategory, warnings } = spendingSummary(
        monthExpenses,
        allocation,
      );

      let msg = `📊 <b>Weekly check-in</b> (${formatPeriodLabel(period.year, period.month)})\n\nMonth to date: ${formatBirr(total)}\n\n`;
      for (const [cat, amt] of Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)) {
        msg += `• ${cat}: ${formatBirr(amt)}\n`;
      }
      if (warnings.length) {
        msg += `\n⚠️ ${warnings.slice(0, 2).join(" ")}`;
      }
      msg += "\n\nKeep logging daily — type /report anytime for details.";

      await sendTelegramMessage(chatId, msg);
      await createNotification(user.id, {
        type: "weekly_report",
        title: "Weekly financial report",
        message: msg.replace(/<[^>]+>/g, "").slice(0, 500),
      });
      sent++;
    } catch (e) {
      console.error(`Weekly job failed for user ${user.id}:`, e);
    }
  }

  return { users: telegramUsers.length, messagesSent: sent };
}

export async function runMonthlyTelegramAnalysis() {
  const telegramUsers = await listTelegramUsers();
  const period = getCurrentPeriod();
  let sent = 0;

  for (const user of telegramUsers) {
    const chatId = user.telegramId;
    if (!chatId) continue;

    try {
      const snapshot = await getBudgetInsightSnapshot(user.id);
      const allocation = await getBudgetAllocation(user.id);

      let msg = `📅 <b>Monthly snapshot</b> — ${formatPeriodLabel(period.year, period.month)}\n\n`;
      msg += `Total spent: ${formatBirr(snapshot.monthSpent)}\n`;
      if (allocation) {
        msg += `Budget income: ${formatBirr(allocation.monthlyIncome)}\n`;
        msg += `Savings goal: ${formatBirr(allocation.savingsGoal)}\n`;
        const remaining = Math.max(
          0,
          allocation.monthlyIncome - snapshot.monthSpent,
        );
        msg += `Rough remaining: ${formatBirr(remaining)}\n`;
      }
      msg += `\nDownload your full Excel report from the dashboard (Export button).\n\nReview planning goals and set next month's budget.`;

      await sendTelegramMessage(chatId, msg);
      await createNotification(user.id, {
        type: "monthly_analysis",
        title: "Monthly savings analysis",
        message: msg.replace(/<[^>]+>/g, "").slice(0, 500),
      });
      sent++;
    } catch (e) {
      console.error(`Monthly job failed for user ${user.id}:`, e);
    }
  }

  return { users: telegramUsers.length, messagesSent: sent };
}
