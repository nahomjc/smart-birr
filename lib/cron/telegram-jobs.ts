import { isNotNull } from "drizzle-orm";
import { requireDb, users } from "@/lib/db";
import { formatEthiopiaNow } from "@/lib/datetime/ethiopia";
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
import { startExpenseFlow } from "@/lib/telegram/expense-flow";
import { MAIN_REPLY_KEYBOARD } from "@/lib/telegram/keyboards";
import { generateMorningSpendingGuide } from "@/lib/telegram/morning-guide";

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

/** ~7:00 AM Ethiopia — AI daily spending guide (breakfast, lunch, coffee, etc.) */
export async function runMorningTelegramJobs() {
  const telegramUsers = await listTelegramUsers();
  const when = formatEthiopiaNow();
  let sent = 0;

  for (const user of telegramUsers) {
    const chatId = user.telegramId;
    if (!chatId) continue;

    try {
      let guide: string;
      try {
        guide = await generateMorningSpendingGuide(user.id);
      } catch {
        guide =
          "Set your monthly income and budget on the web app, then I can suggest daily amounts for food, transport, and coffee.";
      }

      const msg = `🌅 <b>Good morning</b> (${when} · Ethiopia)

${guide}

Tap <b>📝 Log expense</b> anytime to record spending.`;

      await sendTelegramMessage(chatId, msg, "HTML", MAIN_REPLY_KEYBOARD);
      await createNotification(user.id, {
        type: "morning_guide",
        title: "Morning spending guide",
        message: msg.replace(/<[^>]+>/g, "").slice(0, 500),
      });
      sent++;
    } catch (e) {
      console.error(`Morning job failed for user ${user.id}:`, e);
    }
  }

  return { users: telegramUsers.length, messagesSent: sent };
}

/** ~1:00 PM Ethiopia — lunch spend check-in with category keyboard */
export async function runLunchTelegramJobs() {
  const telegramUsers = await listTelegramUsers();
  const when = formatEthiopiaNow();
  let sent = 0;

  for (const user of telegramUsers) {
    const telegramId = user.telegramId;
    if (telegramId == null) continue;
    const chatId = telegramId;

    try {
      await startExpenseFlow(chatId, telegramId, user.id, {
        period: "lunch",
        intro: `🍽 <b>Lunch check-in</b> (${when} · Ethiopia)

How much have you spent so far today — especially for lunch?

Pick a category, then enter amount & description (same as dashboard):`,
      });
      await createNotification(user.id, {
        type: "lunch_checkin",
        title: "Lunch spending check-in",
        message: "Log what you spent today so far (lunch check-in).",
      });
      sent++;
    } catch (e) {
      console.error(`Lunch job failed for user ${user.id}:`, e);
    }
  }

  return { users: telegramUsers.length, messagesSent: sent };
}

/** ~9:00 PM Ethiopia — evening check-in + optional daily summary */
export async function runNightlyTelegramJobs() {
  const telegramUsers = await listTelegramUsers();
  const when = formatEthiopiaNow();
  let sent = 0;

  for (const user of telegramUsers) {
    const telegramId = user.telegramId;
    if (telegramId == null) continue;
    const chatId = telegramId;

    try {
      const snapshot = await getBudgetInsightSnapshot(user.id);

      await startExpenseFlow(chatId, telegramId, user.id, {
        period: "night",
        intro: `🌙 <b>Evening check-in</b> (${when} · Ethiopia)

How much did you spend today (including dinner, transport, snacks)?

Pick a category below:`,
      });
      sent++;

      if (snapshot.todaySpent > 0) {
        const summary = formatDailySummaryTelegram(snapshot);
        if (summary) {
          await sendTelegramMessage(chatId, summary, "HTML", MAIN_REPLY_KEYBOARD);
          sent++;
        }
      }

      const danger = formatDangerAlertTelegram(snapshot);
      if (danger && snapshot.dangerLevel !== "ok") {
        await sendTelegramMessage(chatId, danger, "HTML", MAIN_REPLY_KEYBOARD);
        await createNotification(user.id, {
          type: "budget_danger",
          title: "Budget warning",
          message: danger.replace(/<[^>]+>/g, "").slice(0, 500),
        });
        sent++;
      }

      await createNotification(user.id, {
        type: "night_checkin",
        title: "Evening spending check-in",
        message: "Log today's spending (evening check-in).",
      });
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
