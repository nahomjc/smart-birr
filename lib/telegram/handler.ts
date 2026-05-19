import {
  formatBirr,
  generateBudgetPlan,
  spendingSummary,
} from "../finance/budget-engine";
import {
  getOrCreateTelegramUser,
  upsertBudgetFromIncome,
  getMonthlyExpenses,
  updateUserIncome,
} from "../users/service";
import { getBudgetAllocation, getCurrentBudget } from "../finance/budget-service";
import { processFinancialMessage } from "../services/financial-message";
import { HELP_TEXT, sendTelegramMessage, START_TEXT } from "./bot";

export async function handleTelegramMessage(
  chatId: number,
  telegramUserId: number,
  text: string,
  displayName?: string,
) {
  const user = await getOrCreateTelegramUser(telegramUserId, displayName);
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "/start") {
    await sendTelegramMessage(chatId, START_TEXT);
    return;
  }
  if (lower === "/help") {
    await sendTelegramMessage(chatId, HELP_TEXT);
    return;
  }
  if (lower === "/budget") {
    await handleBudgetCommand(chatId, user.id, user.income);
    return;
  }
  if (lower === "/savings") {
    await handleSavingsCommand(chatId, user.id);
    return;
  }
  if (lower === "/report") {
    await handleReportCommand(chatId, user.id);
    return;
  }
  if (lower === "/expense") {
    await sendTelegramMessage(
      chatId,
      "📝 Log expenses in plain language:\n\n• <i>Spent 500 birr on lunch</i>\n• <i>Paid 3000 for rent</i>\n• <i>1200 birr shopping today</i>\n\nI'll extract the amount and category automatically.",
    );
    return;
  }
  if (lower === "/chatid") {
    await sendTelegramMessage(
      chatId,
      `🆔 <b>Your Telegram IDs</b>

<b>Chat ID:</b> <code>${chatId}</code>
<i>Used to send you messages in this chat.</i>

<b>User ID:</b> <code>${telegramUserId}</code>
<i>Paste this in Smart Birr → Settings → Telegram to link your web account.</i>

In a private chat with this bot, Chat ID and User ID are usually the same.`,
    );
    return;
  }

  const { reply } = await processFinancialMessage(user.id, trimmed, {
    channel: "telegram",
  });

  await sendTelegramMessage(chatId, reply);
}

async function handleBudgetCommand(
  chatId: number,
  userId: string,
  incomeStr: string | null,
) {
  const budget = await getCurrentBudget(userId);

  if (!budget && !incomeStr) {
    await sendTelegramMessage(
      chatId,
      "Set your income first:\n<i>My income is 20000 birr per month</i>\n\nThen use /budget again.",
    );
    return;
  }

  const income = Number(budget?.monthlyIncome ?? incomeStr ?? 0);
  if (!income) {
    await sendTelegramMessage(chatId, "Couldn't find your income. Tell me: <i>My income is 20000 birr</i>");
    return;
  }

  const plan = generateBudgetPlan(income);
  await upsertBudgetFromIncome(userId, income);

  await sendTelegramMessage(
    chatId,
    `📊 <b>Monthly budget</b> (${formatBirr(income)} income)

🏠 Rent: ${formatBirr(plan.rentLimit)}
🍽 Food: ${formatBirr(plan.foodLimit)}
🚕 Transport: ${formatBirr(plan.transportLimit)}
🎉 Entertainment: ${formatBirr(plan.entertainmentLimit)}
🛡 Emergency fund: ${formatBirr(plan.emergencyFund)}
💰 Savings goal: ${formatBirr(plan.savingsGoal)}
📦 Other/discretionary: ${formatBirr(plan.discretionary)}`,
  );
}

async function handleSavingsCommand(chatId: number, userId: string) {
  const budget = await getCurrentBudget(userId);
  const monthExpenses = await getMonthlyExpenses(userId);
  const totalSpent = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const income = Number(budget?.monthlyIncome ?? 0);
  const savingsTarget = Number(budget?.savingsGoal ?? 0);
  const savedSoFar = Math.max(0, income - totalSpent);

  let msg = "💰 <b>Savings check</b>\n";
  if (income) {
    msg += `Income: ${formatBirr(income)}\nSpent this month: ${formatBirr(totalSpent)}\nRough remaining: ${formatBirr(savedSoFar)}\n`;
    if (savingsTarget) {
      msg += `Savings goal: ${formatBirr(savingsTarget)}\n`;
      msg +=
        savedSoFar >= savingsTarget
          ? "✅ You're on track for your savings goal!"
          : "⚠️ Try to cut discretionary spending to hit your goal.";
    }
  } else {
    msg += "Set your income to track savings. Example: <i>My income is 20000 birr</i>";
  }
  await sendTelegramMessage(chatId, msg);
}

async function handleReportCommand(chatId: number, userId: string) {
  const monthExpenses = await getMonthlyExpenses(userId);
  if (!monthExpenses.length) {
    await sendTelegramMessage(chatId, "No expenses logged this month yet. Try: <i>Spent 500 birr on lunch</i>");
    return;
  }

  const allocation = await getBudgetAllocation(userId);
  const { total, byCategory, warnings } = spendingSummary(
    monthExpenses,
    allocation,
  );

  let msg = `📈 <b>Monthly report</b>\nTotal: ${formatBirr(total)}\n\n`;
  for (const [cat, amt] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    msg += `• ${cat}: ${formatBirr(amt)}\n`;
  }
  if (warnings.length) {
    msg += `\n⚠️ ${warnings.join(" ")}`;
  }
  await sendTelegramMessage(chatId, msg);
}
