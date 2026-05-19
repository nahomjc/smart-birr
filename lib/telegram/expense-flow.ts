import { formatBirr } from "@/lib/finance/budget-engine";
import { logExpense } from "@/lib/finance/expense-service";
import { formatExpenseLoggedTelegram, getBudgetInsightSnapshot } from "@/lib/finance/budget-insights";
import {
  buildCategoryInlineKeyboard,
  CALLBACK_EXPENSE_CANCEL,
  CALLBACK_SKIP_DESC,
  EXPENSE_AMOUNT_KEYBOARD,
  EXPENSE_DESCRIPTION_KEYBOARD,
  MAIN_REPLY_KEYBOARD,
  parseCategoryCallback,
  REPLY_CANCEL,
  REPLY_LOG_EXPENSE,
  REPLY_SKIP_DESC,
} from "./keyboards";
import {
  clearTelegramSession,
  getTelegramSession,
  upsertTelegramSession,
  type TelegramSessionData,
} from "./session";
import { answerCallbackQuery, sendTelegramMessage } from "./bot";

const PERIOD_LABELS: Record<string, string> = {
  lunch: "lunch",
  night: "this evening",
  morning: "this morning",
  manual: "this expense",
};

export async function startExpenseFlow(
  chatId: number,
  telegramId: number,
  userId: string,
  options?: { period?: TelegramSessionData["period"]; intro?: string },
) {
  const period = options?.period ?? "manual";
  await upsertTelegramSession(telegramId, userId, "expense_category", {
    period,
  });

  const intro =
    options?.intro ??
    "📝 <b>Log expense</b>\n\nChoose a category (same as the dashboard):";

  await sendTelegramMessage(chatId, intro, "HTML", {
    inline_keyboard: buildCategoryInlineKeyboard().inline_keyboard,
  });
}

export async function handleExpenseCallback(
  chatId: number,
  telegramId: number,
  userId: string,
  callbackData: string,
  callbackQueryId: string,
): Promise<boolean> {
  if (callbackData === CALLBACK_EXPENSE_CANCEL) {
    await answerCallbackQuery(callbackQueryId, "Cancelled");
    await clearTelegramSession(telegramId);
    await sendTelegramMessage(
      chatId,
      "Expense cancelled.",
      "HTML",
      MAIN_REPLY_KEYBOARD,
    );
    return true;
  }

  if (callbackData === CALLBACK_SKIP_DESC) {
    const session = await getTelegramSession(telegramId);
    if (session?.state !== "expense_description") return false;
    await answerCallbackQuery(callbackQueryId);
    await finishExpense(chatId, telegramId, userId, session.data, "");
    return true;
  }

  const category = parseCategoryCallback(callbackData);
  if (!category) return false;

  await answerCallbackQuery(callbackQueryId);
  await upsertTelegramSession(telegramId, userId, "expense_amount", {
    ...((await getTelegramSession(telegramId))?.data ?? {}),
    category,
  });

  await sendTelegramMessage(
    chatId,
    `💰 <b>${category}</b>\n\nEnter the amount in <b>ETB</b> (numbers only).\n\nExample: <code>350</code>`,
    "HTML",
    EXPENSE_AMOUNT_KEYBOARD,
  );
  return true;
}

export async function handleExpenseTextStep(
  chatId: number,
  telegramId: number,
  userId: string,
  text: string,
): Promise<boolean> {
  const session = await getTelegramSession(telegramId);
  if (!session || session.state === "idle") return false;

  const trimmed = text.trim();

  if (
    trimmed === REPLY_CANCEL ||
    trimmed.toLowerCase() === "/cancel" ||
    trimmed.toLowerCase() === "cancel"
  ) {
    await clearTelegramSession(telegramId);
    await sendTelegramMessage(
      chatId,
      "Expense cancelled.",
      "HTML",
      MAIN_REPLY_KEYBOARD,
    );
    return true;
  }

  if (session.state === "expense_category") {
    return false;
  }

  if (session.state === "expense_amount") {
    const amount = Number(trimmed.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount <= 0) {
      await sendTelegramMessage(
        chatId,
        "Please send a valid amount in ETB (e.g. <code>500</code>).",
        "HTML",
        EXPENSE_AMOUNT_KEYBOARD,
      );
      return true;
    }

    await upsertTelegramSession(telegramId, userId, "expense_description", {
      ...session.data,
      amount,
    });

    await sendTelegramMessage(
      chatId,
      `📄 Amount: <b>${formatBirr(amount)}</b>\n\nAdd a short description (optional), or tap <b>Skip description</b>.`,
      "HTML",
      EXPENSE_DESCRIPTION_KEYBOARD,
    );
    return true;
  }

  if (session.state === "expense_description") {
    if (trimmed === REPLY_SKIP_DESC) {
      await finishExpense(chatId, telegramId, userId, session.data, "");
      return true;
    }
    await finishExpense(chatId, telegramId, userId, session.data, trimmed);
    return true;
  }

  return false;
}

async function finishExpense(
  chatId: number,
  telegramId: number,
  userId: string,
  data: TelegramSessionData,
  description: string,
) {
  const category = data.category ?? "Other";
  const amount = data.amount ?? 0;
  const period = data.period ?? "manual";
  const defaultDesc =
    period === "lunch"
      ? "Lunch (Telegram)"
      : period === "night"
        ? "Evening spend (Telegram)"
        : period === "morning"
          ? "Morning spend (Telegram)"
          : "Logged via Telegram";

  await logExpense(
    userId,
    amount,
    category,
    description.trim() || defaultDesc,
    undefined,
    1,
  );

  await clearTelegramSession(telegramId);

  const snapshot = await getBudgetInsightSnapshot(userId);
  const block = formatExpenseLoggedTelegram(category, amount, snapshot);
  const periodNote =
    period !== "manual"
      ? `\n\n<i>Logged for ${PERIOD_LABELS[period] ?? period} check-in.</i>`
      : "";

  await sendTelegramMessage(
    chatId,
    `${block}${periodNote}`,
    "HTML",
    MAIN_REPLY_KEYBOARD,
  );
}

export function isLogExpenseTrigger(text: string): boolean {
  const t = text.trim();
  return (
    t === REPLY_LOG_EXPENSE ||
    t.toLowerCase() === "/expense" ||
    t.toLowerCase() === "log expense"
  );
}
