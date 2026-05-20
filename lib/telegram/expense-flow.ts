import { formatBirr } from "@/lib/finance/budget-engine";
import { logExpense } from "@/lib/finance/expense-service";
import { formatExpenseLoggedTelegram, getBudgetInsightSnapshot } from "@/lib/finance/budget-insights";
import {
  EXPENSE_CATEGORY_KEYBOARD,
  buildCategoryInlineKeyboard,
  CALLBACK_EXPENSE_CANCEL,
  CALLBACK_SKIP_DESC,
  EXPENSE_AMOUNT_KEYBOARD,
  EXPENSE_DESCRIPTION_KEYBOARD,
  MAIN_REPLY_KEYBOARD,
  parseCategoryCallback,
  parseCategoryText,
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
import {
  ensureWebhookSupportsCallbacks,
  editTelegramMessageReplyMarkup,
  sendTelegramMessage,
} from "./bot";

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

  const webhookRepair = await ensureWebhookSupportsCallbacks();
  if (webhookRepair.fixed) {
    console.log("[telegram][expense] webhook auto-repaired for inline buttons", webhookRepair);
  }

  await upsertTelegramSession(telegramId, userId, "expense_category", {
    period,
  });

  const intro =
    options?.intro ??
    "📝 <b>Log expense</b>\n\nChoose a category (same as the dashboard):";

  await sendTelegramMessage(
    chatId,
    intro,
    "HTML",
    EXPENSE_CATEGORY_KEYBOARD,
  );

  await sendTelegramMessage(
    chatId,
    "Or tap a category on this message:",
    "HTML",
    buildCategoryInlineKeyboard(),
  );
}

export async function handleExpenseCallback(
  chatId: number,
  telegramId: number,
  userId: string,
  callbackData: string,
  sourceMessageId?: number,
): Promise<boolean> {
  console.log("[telegram][expense] callback received", {
    telegramId,
    callbackData,
    sourceMessageId: sourceMessageId ?? null,
  });

  if (callbackData === CALLBACK_EXPENSE_CANCEL) {
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
    await finishExpense(chatId, telegramId, userId, session.data, "");
    return true;
  }

  const category = parseCategoryCallback(callbackData);
  if (!category) {
    console.warn("[telegram][expense] callback category parse failed", {
      telegramId,
      callbackData,
    });
    return false;
  }

  console.log("[telegram][expense] callback category parsed", {
    telegramId,
    callbackData,
    category,
  });

  if (sourceMessageId) {
    await editTelegramMessageReplyMarkup(chatId, sourceMessageId);
  }

  await moveToAmountStep(chatId, telegramId, userId, category);
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
    const category = parseCategoryText(trimmed);
    if (!category) {
      await sendTelegramMessage(
        chatId,
        "Please choose a valid category (e.g. Food, Transport, Rent).",
        "HTML",
        EXPENSE_CATEGORY_KEYBOARD,
      );
      return true;
    }
    await moveToAmountStep(chatId, telegramId, userId, category);
    return true;
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

async function moveToAmountStep(
  chatId: number,
  telegramId: number,
  userId: string,
  category: string,
) {
  await upsertTelegramSession(telegramId, userId, "expense_amount", {
    ...((await getTelegramSession(telegramId))?.data ?? {}),
    category,
  });

  console.log("[telegram][expense] moved to expense_amount", {
    telegramId,
    category,
  });

  const sent = await sendTelegramMessage(
    chatId,
    `💰 <b>${category}</b>\n\nEnter the amount in <b>ETB</b> (numbers only).\n\nExample: <code>350</code>`,
    "HTML",
    EXPENSE_AMOUNT_KEYBOARD,
  );
  if (!sent) {
    console.error("[telegram][expense] failed to send amount prompt", {
      telegramId,
      category,
    });
    await sendTelegramMessage(
      chatId,
      "⚠️ Could not send the next step. Tap <b>📝 Log expense</b> to try again.",
      "HTML",
      MAIN_REPLY_KEYBOARD,
    );
  }
  console.log("[telegram][expense] amount prompt sent", {
    telegramId,
    category,
  });
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
