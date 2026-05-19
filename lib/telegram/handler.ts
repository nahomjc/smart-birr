import {
  formatBirr,
  generateBudgetPlan,
  spendingSummary,
} from "../finance/budget-engine";
import {
  getOrCreateTelegramUser,
  upsertBudgetFromIncome,
  getMonthlyExpenses,
} from "../users/service";
import { getBudgetAllocation, getCurrentBudget } from "../finance/budget-service";
import { processFinancialMessage } from "../services/financial-message";
import { formatEthiopiaNow } from "../datetime/ethiopia";
import {
  handleExpenseCallback,
  handleExpenseTextStep,
  isLogExpenseTrigger,
  startExpenseFlow,
} from "./expense-flow";
import {
  MAIN_REPLY_KEYBOARD,
  REPLY_BUDGET,
  REPLY_HELP,
  REPLY_REPORT,
} from "./keyboards";
import { getTelegramSession } from "./session";
import {
  HELP_TEXT,
  sendTelegramMessage,
  START_TEXT,
  withTelegramTyping,
} from "./bot";

export async function handleTelegramCallback(
  chatId: number,
  telegramUserId: number,
  callbackData: string,
  callbackQueryId: string,
  displayName?: string,
) {
  const user = await getOrCreateTelegramUser(telegramUserId, displayName);
  const handled = await handleExpenseCallback(
    chatId,
    telegramUserId,
    user.id,
    callbackData,
    callbackQueryId,
  );
  if (!handled) {
    await sendTelegramMessage(chatId, "Unknown action. Tap /help.", "HTML", MAIN_REPLY_KEYBOARD);
  }
}

export async function handleTelegramMessage(
  chatId: number,
  telegramUserId: number,
  text: string,
  displayName?: string,
) {
  const user = await getOrCreateTelegramUser(telegramUserId, displayName);
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  const session = await getTelegramSession(telegramUserId);
  if (session && session.state !== "idle") {
    const handled = await handleExpenseTextStep(
      chatId,
      telegramUserId,
      user.id,
      trimmed,
    );
    if (handled) return;
  }

  if (lower === "/start") {
    await sendTelegramMessage(chatId, START_TEXT, "HTML", MAIN_REPLY_KEYBOARD);
    return;
  }
  if (lower === "/help" || trimmed === REPLY_HELP) {
    await sendTelegramMessage(chatId, HELP_TEXT, "HTML", MAIN_REPLY_KEYBOARD);
    return;
  }
  if (lower === "/budget" || trimmed === REPLY_BUDGET) {
    await withTelegramTyping(chatId, () =>
      handleBudgetCommand(chatId, user.id, user.income),
    );
    return;
  }
  if (lower === "/savings") {
    await withTelegramTyping(chatId, () => handleSavingsCommand(chatId, user.id));
    return;
  }
  if (lower === "/report" || trimmed === REPLY_REPORT) {
    await withTelegramTyping(chatId, () => handleReportCommand(chatId, user.id));
    return;
  }
  if (isLogExpenseTrigger(trimmed)) {
    await startExpenseFlow(chatId, telegramUserId, user.id, { period: "manual" });
    return;
  }
  if (lower === "/expense") {
    await startExpenseFlow(chatId, telegramUserId, user.id, { period: "manual" });
    return;
  }
  if (lower === "/chatid") {
    await sendTelegramMessage(
      chatId,
      `🆔 <b>Your Telegram IDs</b>

<b>Chat ID:</b> <code>${chatId}</code>
<b>User ID:</b> <code>${telegramUserId}</code>
<i>Paste User ID in Smart Birr → Settings → Telegram to link your web account.</i>`,
      "HTML",
      MAIN_REPLY_KEYBOARD,
    );
    return;
  }

  const { reply } = await withTelegramTyping(chatId, () =>
    processFinancialMessage(user.id, trimmed, { channel: "telegram" }),
  );

  await sendTelegramMessage(chatId, reply, "HTML", MAIN_REPLY_KEYBOARD);
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
      "Set your income first:\n<i>My income is 20000 birr per month</i>\n\nThen use 📊 Budget again.",
      "HTML",
      MAIN_REPLY_KEYBOARD,
    );
    return;
  }

  const income = Number(budget?.monthlyIncome ?? incomeStr ?? 0);
  if (!income) {
    await sendTelegramMessage(
      chatId,
      "Couldn't find your income. Tell me: <i>My income is 20000 birr</i>",
      "HTML",
      MAIN_REPLY_KEYBOARD,
    );
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
    "HTML",
    MAIN_REPLY_KEYBOARD,
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
  await sendTelegramMessage(chatId, msg, "HTML", MAIN_REPLY_KEYBOARD);
}

async function handleReportCommand(chatId: number, userId: string) {
  const monthExpenses = await getMonthlyExpenses(userId);
  if (!monthExpenses.length) {
    await sendTelegramMessage(
      chatId,
      "No expenses logged this month yet. Tap <b>📝 Log expense</b> or say: <i>Spent 500 birr on lunch</i>",
      "HTML",
      MAIN_REPLY_KEYBOARD,
    );
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
  await sendTelegramMessage(chatId, msg, "HTML", MAIN_REPLY_KEYBOARD);
}
